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

## Godot中的信号
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

::: info Callable与bind
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
:::
