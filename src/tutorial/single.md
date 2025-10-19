---
title: 全局加载与单例模式
author: Moshangzhu
date: 2025-10-18
category:
  - 教程
tag:
  - 设计模式
---

## 简介
想象一下这样的场景：你正在制作一款RPG游戏，玩家在村庄地图收集了100枚金币，然后进入了森林地图。此时你发现玩家的金币数据丢失了，因为场景切换后，原来的节点树被销毁了。

或者你想制作一个背景音乐播放器，希望音乐能在不同场景间连续播放。但每次切换场景，音乐都会重新开始，因为`AudioStreamPlayer`节点跟随场景一起被重新创建了。

再比如，你想在游戏的任何地方都能调用一个暂停功能，或者记录游戏设置。如果把这些功能分散在各个场景中，不仅代码会重复，还很难保证数据的一致性。

这些问题的本质都是一样的：**如何创建一个在整个游戏生命周期中始终存在的节点？**

在Godot中，这个问题有一个优雅的解决方案——**自动加载（AutoLoad）**。

<!-- more -->

::: info 自动加载与单例模式
自动加载是Godot提供的一个特殊机制，可以让指定的脚本或场景在游戏启动时自动创建，并在整个游戏运行期间持续存在，不会随场景切换而销毁。

这其实是**单例模式**的一种实现。单例模式是软件工程中的经典设计模式，用于确保某个类在整个程序中只有一个实例，并提供全局访问点。在其他编程语言中实现单例往往需要编写不少样板代码，而Godot将这个过程简化成了在项目设置中的简单配置。

通过自动加载，我们可以轻松创建全局管理器、数据存储、事件总线等关键组件，让它们在任何场景、任何脚本中都能被访问。
:::

## 在Godot中使用自动加载

### 创建自动加载

在Godot中设置自动加载非常简单。自动加载可以是一个**脚本文件**（.gd）、**场景文件**（.tscn）。下面我们通过一个简单的例子来演示。

首先，创建一个脚本文件 `global_data.gd`：

```gdscript
# global_data.gd
extends Node

# 玩家的金币数量
var coins: int = 0

# 玩家的等级
var player_level: int = 1

func add_coins(amount: int):
    coins += amount
    print("获得 %d 金币，当前金币: %d" % [amount, coins])

func level_up():
    player_level += 1
    print("升级！当前等级: %d" % player_level)
```

然后将这个脚本添加到自动加载列表中：

1. 打开菜单栏：**项目 → 项目设置**
2. 在左侧选择 **全局 → 自动加载** 标签页
3. 点击路径输入框右侧的文件夹图标，选择刚才创建的 `global_data.gd` 文件
4. 在"节点名称"输入框中，输入一个全局访问的名称，例如 `GlobalData`
5. 点击 **添加** 按钮

![](/assets/images/tutorial/single/autoload_setting.png)

完成这些步骤后，`GlobalData` 就成为了一个全局单例节点。

::: tip 节点名称规范
节点名称建议使用大驼峰命名法（PascalCase），如 `GlobalData`、`GameManager`、`EventBus` 等。这样可以与普通变量区分开来，一眼就能看出这是一个全局单例。
:::

### 访问自动加载节点

设置好自动加载后，就可以在项目的任何脚本中直接通过节点名称访问它了：

```gdscript
# player.gd
extends CharacterBody2D

func _ready():
    # 直接通过名称访问自动加载节点
    print("游戏开始时的金币: %d" % GlobalData.coins)

func collect_coin():
    # 调用自动加载节点的方法
    GlobalData.add_coins(1)

func defeat_boss():
    GlobalData.add_coins(100)
    GlobalData.level_up()
```

```gdscript
# shop.gd
extends Control

@onready var coin_label: Label = %CoinLabel

func _ready():
    # 在商店界面显示玩家的金币
    update_coin_display()

func update_coin_display():
    coin_label.text = "金币: %d" % GlobalData.coins

func buy_item(price: int):
    if GlobalData.coins >= price:
        GlobalData.coins -= price
        update_coin_display()
        print("购买成功！")
    else:
        print("金币不足！")
```

可以看到，无论是在玩家场景还是商店场景中，都可以直接使用 `GlobalData` 访问同一个数据。场景切换时数据不会丢失，因为 `GlobalData` 节点始终存在于场景树的根部，不会被销毁。

### 自动加载场景

除了脚本，我们也可以将一个**场景**设置为自动加载。这在某些情况下很有用，比如创建一个全局的音频管理器。

首先创建一个场景 `audio_manager.tscn`，结构如下：
```
AudioManager (Node)
├─ BGMPlayer (AudioStreamPlayer)
└─ SFXContainer (Node)
```

为根节点添加脚本 `audio_manager.gd`：

```gdscript
# audio_manager.gd
extends Node

@onready var bgm_player: AudioStreamPlayer = $BGMPlayer
@onready var sfx_container: Node = $SFXContainer

func play_bgm(music: AudioStream):
	bgm_player.stream = music
	bgm_player.play()

func stop_bgm():
	bgm_player.stop()

func play_sfx(sound: AudioStream):
	var sfx_player = AudioStreamPlayer.new()
	sfx_player.stream = sound
	sfx_player.finished.connect(sfx_player.queue_free)
	sfx_container.add_child(sfx_player)
	sfx_player.play()

```

然后在项目设置中添加这个**场景文件** `audio_manager.tscn` 为自动加载，节点名称设为 `AudioManager`。

这样，即使场景切换，背景音乐也会持续播放，因为 `AudioManager` 及其子节点不会被销毁。

::: details 脚本 vs 场景：如何选择？
**使用脚本作为自动加载：**
- 仅需要存储数据和逻辑，不需要子节点
- 代码结构简单，易于维护
- 例如：全局数据存储、游戏设置、事件总线

**使用场景作为自动加载：**
- 需要包含子节点（如多个AudioStreamPlayer、Timer等）
- 需要在编辑器中可视化配置节点属性
- 需要使用场景树的层级结构
- 例如：音频管理器、UI层管理、调试工具面板

大多数情况下，简单的脚本就足够了。只有在确实需要节点树结构时，才使用场景。
:::

### 自动加载的原理

自动加载的本质是在游戏启动时实例化节点并添加到 `/root` 下：

- **脚本文件**：Godot根据 `extends` 关键字创建对应类型的节点，然后附加脚本
  ```gdscript
  # extends Node → 创建 Node 节点并附加脚本
  # extends Control → 创建 Control 节点并附加脚本
  ```

- **场景文件**：直接实例化场景

### 自动加载的生命周期

- **创建时机**：游戏启动时，主场景加载之前，按项目设置中的顺序创建
- **生命周期**：整个游戏运行期间都存在，不会随场景切换而销毁
- **销毁时机**：游戏退出时销毁

可以通过以下代码验证：

```gdscript
# global_data.gd
extends Node

func _ready():
    print("GlobalData 节点已创建")
    print("场景树中的位置: ", get_path())  # 输出: /root/GlobalData

func _exit_tree():
    print("GlobalData 节点被销毁")
```

运行游戏后会发现，无论如何切换场景，`_ready()` 只会在游戏启动时调用一次，`_exit_tree()` 只会在游戏退出时调用一次。

::: warning 注意自动加载的顺序
如果有多个自动加载节点，并且它们之间存在依赖关系，需要注意它们在项目设置中的顺序。

例如，如果 `EventBus` 需要使用 `GlobalData`，那么 `GlobalData` 应该排在 `EventBus` 之前。因为在 `EventBus` 的 `_ready()` 函数中，排在它前面的自动加载节点已经准备好了，而排在它后面的可能还没有初始化。
:::

## 使用静态方法的单例模式

并非所有的全局功能都需要使用自动加载。如果只是一些**纯逻辑的工具函数**，不需要保存状态、不需要访问节点树，那么使用**静态方法**会是更好的选择。

### 创建静态工具类

使用 `class_name` 定义一个全局类，并使用 `static` 关键字定义静态方法：

```gdscript
# utils.gd
class_name Utils

# 格式化时间戳
static func format_time(seconds: int) -> String:
    var minutes = seconds / 60
    var secs = seconds % 60
    return "%02d:%02d" % [minutes, secs]

# 随机选择数组元素
static func random_choice(array: Array):
    if array.is_empty():
        return null
    return array[randi() % array.size()]
```

定义后可以在任何地方直接使用，**无需添加到自动加载**：

```gdscript
# player.gd
func _ready():
    var formatted_time = Utils.format_time(125)  # 直接调用
    print("游戏时间: ", formatted_time)  # 输出: 02:05
```

### 静态方法 vs 自动加载

| 特性 | 静态方法 | 自动加载 |
|------|---------|---------|
| **保存状态** | ❌ 不能 | ✅ 可以 |
| **使用信号** | ❌ 不能 | ✅ 可以 |
| **访问节点树** | ❌ 不能 | ✅ 可以 |
| **适用场景** | 纯函数、工具类 | 数据管理、事件总线 |

::: tip 如何选择
- **静态方法**：工具函数、数学计算、格式转换等无状态逻辑
- **自动加载**：需要保存数据、发送信号、访问节点树的场景
:::

两种方式可以组合使用，例如自动加载节点可以调用静态工具类的方法。

## 场景级别的单例模式

有时我们需要在某个场景内保证某个节点只有一个实例，但不需要全局存在。这种情况可以使用**场景级别的单例模式**。

```gdscript
# level_manager.gd
class_name LevelManager
extends Node

# 静态变量保存单例实例
static var instance: LevelManager = null

func _ready():
    # 如果实例已存在，销毁当前节点
    if instance != null:
        push_warning("当前节点树中已经存在单例实例")
        queue_free()
        return
    # 否则将自己设为实例
    instance = self

func _exit_tree():
    # 节点被销毁时清空实例引用
    if instance == self:
        instance = null
```

这种模式的特点：
- 在场景运行期间只允许存在一个实例
- 如果尝试创建第二个实例，会自动销毁
- 可以通过 `LevelManager.instance` 访问当前实例
- 场景切换时实例会被清空，不会全局持久化

**使用示例：**

```gdscript
# 在其他脚本中访问单例
func _ready():
    if LevelManager.instance:
        LevelManager.instance.start_level()
    else:
        push_warning("LevelManager 实例不存在")
```

::: tip 使用场景
适合用于在**单个关卡或场景内**需要唯一存在的管理器，例如：
- 关卡管理器（LevelManager）
- 波次生成器（WaveSpawner）
- 场景内的UI管理器

如果需要跨场景持久化，应该使用自动加载而不是场景级单例。
:::