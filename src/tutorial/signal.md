---
title: 信号系统
author: Moshangzhu
date: 2025-10-17
category:
  - 教程
tag:
  - 信号
---

## 简介
在开发游戏的过程中，往往会出现这样的情况：
- 玩家受到伤害，需要让血量条发生变化
- 动画播放结束了，需要用代码控制播放下一个动画
- 要设置机关，当玩家触碰后激活某处机关

我们可能会有以下思路：
- 先获得到需要触发变化的节点，然后调用节点上的函数，例如第一种情况在玩家脚本中：`get_node("hp_bar").update_value(hp_value)`
- 先通知父级节点，然后再想办法通知到对应的节点处理，例如第一种情况在玩家脚本中：`get_parent().do_something(hp_value)`
- 先把自己存放再需要变化的节点的属性里，然后每帧根据玩家的属性，例如第一种情况在玩家脚本中：`hp_bar.player = self`，然后在血量的process函数中`update_value(player.hp_value)`

很容易发现以上代码中，传输数据是一件很不方便的事情。尤其是我们不可能将所有代码全部放在一个庞大的`game.tscn`场景文件中，这使得节点之间的交互更是一件复杂的事情。

那有什么办法可以简化这种操作呢？或者说，如何将一个事件，和处理这个事件的函数解绑呢？

答案是**信号**`signal`。

<!-- more -->

::: info 信号机制
在别的语境里，信号通常是事件监听、事件委托、观察者模式、订阅者模式等名词。
在代码中可以声明一个事件，然后将需要处理事件的行为维护成一个数组。当发生这个事件时，就会遍历调用这些行为函数。（观察者模式）
或者在一个第三方的位置，设置一个事件。事件可以由事件发布者发布，再由中介者发布给所有的订阅者。（订阅者模式）
而这些，在Godot中就被封装成了信号系统。
:::
## 在Godot中使用信号
### Godot中的Signal类
Godot中的信号是一种常量。类型是Signal。我们并不需要关心他的值是什么。只需要了解信号的几个重要的函数。

可以用以下方式方便的定义信号。
```gdscript
# 定义一个叫some_sig的信号
signal some_sig
# 定义一个带有两个参数的信号
signal other_sig(param_a: int, param_b: String)
```

绑定信号的方法也很简单，只需要让信号链接到一个Callable类型的变量上：
```gdscript
# 将some_sig信号链接到一个名为_handle_func的函数上。
some_sig.connect(_handle_func)

# 将other_sig信号链接到一个名为_handle_func_with_params的有参数的函数上。
# 因为信号和函数的参数一致，所以无需特殊处理
other_sig.connect(_handle_func_with_params)

# 将some_sig信号链接到_handle_func_with_params并传入参数。
# 由于some_sig无法提供_handle_func_with_params需要的两个参数，
# 所以使用bind为_handle_func_with_params绑定两个固定的参数生成一个新的Callable。
some_sig.connect(_handle_func_with_params.bind(1, "来自some_sig的固定参数"))

func _handle_func():
    print("触发无参数函数")

func _handle_func_with_params(param_a: int, param_b: String):
    print("触发有参数函数: %d %s" % [param_a, param_b])
```

::: details Callable与bind
**Callable**
`Callable`是一种变量类型，指的是可以被调用的函数。使用`func`关键字声明的具名函数和匿名函数都是`Callable`类型的变量。
例如上文中的：
```gdscript
func _handle_func_with_params(param_a: int, param_b: String):
    print("触发有参数函数: %d %s" % [param_a, param_b])
```
`_handle_func_with_params`就是一个`Callable`类型。

信号可以与`Callable`类型链接。所以在`Signal.connect`函数中传入类似`_handle_func_with_params`的函数名即可。

**bind**
bind可以返回一个函数的副本，并为其绑定一个或多个固定的参数。
例如上文中的：
```gdscript
_handle_func_with_params.bind(1, "来自some_sig的固定参数")
```
是调用了`_handle_func_with_params`这个`Callable`变量上的`bind`方法。返回了一个新的`Callable`类型的变量。**这个变量和原来的函数不是一个值。**
返回的副本被`bind`函数绑定了两个固定的值，所以再使用无参数的信号连接时，就不会出现问题。
:::

触发信号可以使用信号的emit函数。如果信号带有参数，也可以在emit函数中传参。

```gdscript
# 触发无参数信号
some_sig.emit()
# 触发有参数信号并传参
other_sig.emit(2, "触发信号")
```
有了以上的内容，我们就可以声明并使用信号了。

在编辑器中，则可以选择一个带有信号的节点，在界面右侧检查旁找到节点面板，选择信号面板，双击想要连接的信号，然后在弹出的连接信号面板中选择一个处理信号的脚本，并选取或新建一个处理方法。点击连接按钮后即可将信号连接到方法。
![](/assets/images/tutorial/signal/signal_connect_in_editor.png)

### 变体写法

除了上述的信号链接方法，Godot还提供了另一种写法。我们可以通过节点的`connect`函数来链接信号：

```gdscript
# 使用字符串形式的信号名称来链接信号
self.connect("some_sig", _handle_func)
```

这种写法和`some_sig.connect(_handle_func)`的效果是一样的。区别在于：
- 前者使用字符串`"some_sig"`来指定信号名称
- 后者直接使用信号常量`some_sig`本身

使用字符串形式的好处是可以动态地指定信号名称，但缺点是容易因为拼写错误导致问题，且IDE无法提供代码补全和类型检查。因此在大多数情况下，推荐使用直接访问信号常量的方式。

### 信号标志

在链接信号时，我们可以传入一个可选的标志参数，来控制信号的特殊行为。这些标志定义在`Object.ConnectFlags`枚举中。

使用方式如下：
```gdscript
# 连接信号时传入标志参数
some_sig.connect(_handle_func, CONNECT_ONE_SHOT)
```

Godot提供了以下几种信号标志：

#### 延迟触发 CONNECT_DEFERRED

```gdscript
some_sig.connect(_handle_func, CONNECT_DEFERRED)
```

使用延迟标志后，信号触发时不会立即调用函数，而是等到当前帧的末尾（空闲时）才触发。这在某些需要等待所有逻辑执行完毕后再处理的场景中很有用。

#### 一次性连接 CONNECT_ONE_SHOT

```gdscript
some_sig.connect(_handle_func, CONNECT_ONE_SHOT)
```

一次性连接会在第一次触发后自动断开，不需要手动调用`disconnect`。适合只需要响应一次的事件，例如游戏开始时的初始化信号。

#### 持久连接 CONNECT_PERSIST

```gdscript
some_sig.connect(_handle_func, CONNECT_PERSIST)
```

持久连接会在场景保存时一起被序列化存储。在编辑器中通过"节点"面板手动创建的信号连接默认就是持久的。这意味着场景加载时，这些连接会自动恢复。

#### 引用计数 CONNECT_REFERENCE_COUNTED

```gdscript
some_sig.connect(_handle_func, CONNECT_REFERENCE_COUNTED)
```

允许同一个信号和函数多次建立连接，每次连接都会增加内部计数器。每当触发一次就会减少一次计数，当全部计数都触发后，即完全断开连接。需要调用相同次数的`disconnect`才能完全断开连接。

#### 追加源对象 CONNECT_APPEND_SOURCE_OBJECT

```gdscript
some_sig.connect(_handle_func, CONNECT_APPEND_SOURCE_OBJECT)
```

实例化场景时，会自动将发出信号的对象追加到回调函数的参数末尾。这在需要知道信号来源的场景中很有用。

部分信号标志可以在Godot编辑器的信号连接窗口中选择（需要勾选高级按钮）：
![](/assets/images/tutorial/signal/signal_flags_in_editor.png)

::: tip 组合使用标志
多个标志可以使用按位或运算符`|`组合使用：
```gdscript
some_sig.connect(_handle_func, CONNECT_DEFERRED | CONNECT_ONE_SHOT)
```
:::

### 断开信号

当不再需要响应某个信号时，可以使用`disconnect`函数断开连接：

```gdscript
# 断开信号连接
some_sig.disconnect(_handle_func)
```

断开信号连接在节点被删除或功能被禁用时很有必要，可以避免触发已经失效的函数。

## 全局事件总线
如果你已经过一段游戏开发经验了，会发现在使用信号时总会有些麻烦：在使用某个节点的信号时需要先想办法获取到这个节点，然后才能通过节点连接信号处理事件。可不可以用一种方法能更方便的使用信号呢？

全局事件总线是一个依赖于自动加载的统一管理信号的架构方式。它作为一个完全独立，又可以在任何地方轻易的访问，且全局唯一（单例）的节点，可以作为一个事件转发的枢纽。

我们可以在一个自动加载的脚本中，新建一些信号，然后事件触发方直接触发全局脚本上的信号，事件接收方则将处理函数连接在全局脚本的信号上。这样两个节点不需要知道对方是否存在以及所在的位置，只需要关心事件是否被触发以及触发后的逻辑。减少了项目上场景与场景之间的依赖，实现了解耦的目的。

以下是一个全局事件总线的示例：
```gdscript
# event_bus.gd
# 自动加载，名称为EventBus
extends Node

signal player_hp_changed(hp: int)


# player.gd
# 玩家脚本
class_name Player
extends CharacterBody2D

var max_hp: int = 100
var hp: int = 100

func hurt(damage: int):
    # 玩家受伤，扣除血量
    hp = clamp(hp - damage, 0, max_hp)
    # 血量变化，发送信号
    EventBus.player_hp_changed.emit(hp)

# game_manager.gd
# 游戏控制器
class_name GameManager
extends Node

func _ready():
    # 连接玩家血量变化信号
    EventBus.player_hp_changed(_handle_player_hp_changed)

func _handle_player_hp_changed(player_hp: int):
    # 判断玩家血量是否为0
    if player_hp == 0:
        game_over()

func game_over():
    # 退出游戏
    get_tree().quit()

# ui.gd
# 游戏UI
extends Control
# 进度条节点，用来展示玩家血量
@onready var player_hp_progress_bar: ProgressBar = %PlayerHpProgressBar

var player_hp

func _ready():
    # 连接玩家血量变化信号
    EventBus.player_hp_changed(_handle_player_hp_changed)

# 血量变化后更新ui
func _handle_player_hp_changed(current_player_hp: int):
    player_hp = current_player_hp
    update_ui()

# 更新ui
func update_ui():
    player_hp_progress_bar.value = float(player_hp) / 100.0
```
在这个例子中：
- **EventBus** 作为全局事件总线，定义了`player_hp_changed`信号
- **Player** 在血量变化时通过`EventBus.player_hp_changed.emit(hp)`发送信号
- **GameManager** 监听该信号，当玩家血量为0时结束游戏
- **UI** 同样监听该信号，实时更新血量显示

可以看到，Player不需要知道GameManager和UI的存在，GameManager和UI也不需要获取Player节点的引用，所有的通信都通过EventBus完成。这种方式使得各个模块之间的耦合度大大降低，代码更加清晰易维护。

::: tip 多个事件总线
在大型项目中，可以根据功能模块创建多个事件总线，而不是把所有信号都放在一个EventBus中。例如：
- **UIEventBus** - 管理UI相关的事件（按钮点击、面板切换等）
- **GameEventBus** - 管理游戏逻辑事件（关卡完成、任务触发等）
- **AudioEventBus** - 管理音频事件（播放音效、切换BGM等）

这样可以让代码结构更加清晰，也方便团队协作时的分工管理。
:::

::: warning 注意事项
使用全局事件总线时需要注意：
- 避免滥用。不是所有的信号都适合放在事件总线中，只有需要跨场景、跨模块通信的事件才建议使用
- 信号命名要清晰，避免命名冲突
- 记得在节点销毁时断开不再需要的信号连接，避免内存泄漏
:::