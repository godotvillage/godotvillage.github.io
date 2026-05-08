---
title: CallableStateMachine 实现
description: 使用Godot Callable实现自定义状态机
sticky: false
star: false
category:
  - 教程
tag:
  - 多人游戏
  - 设计模式
date: 2026-03-16
---

## 状态机概述

项目使用 `Callable` 实现了一个轻量级的状态机，用于管理敌人 AI 的行为状态。这种方式比传统的状态模式更灵活。

## 类定义

```gdscript
class_name CallableStateMachine

var state_dictionary = {}
var current_state: String
```

> **设计说明**：字典存储状态，字符串记录当前状态名。

## 核心数据结构

```gdscript
state_dictionary[状态方法名] = {
    "normal": Callable,    # 状态持续时每帧调用
    "enter": Callable,     # 进入状态时调用
    "leave": Callable      # 离开状态时调用
}
```

> **设计说明**：每个状态有三个 Callable，分别对应进入、持续、离开三个时机。

## 添加状态

```gdscript
func add_states(
    normal_state_callable: Callable,
    enter_state_callable: Callable,
    leave_state_callable: Callable
):
    state_dictionary[normal_state_callable.get_method()] = {
        "normal": normal_state_callable,
        "enter": enter_state_callable,
        "leave": leave_state_callable
    }
```

> **设计说明**：用 `get_method()` 获取方法名作为字典键，实现方法名到状态的映射。

## 设置初始状态

```gdscript
func set_initial_state(state_callable: Callable):
    var state_name = state_callable.get_method()
    if state_dictionary.has(state_name):
        _set_state(state_name)
    else:
        push_warning("No state with name " + state_name)
```

> **设计说明**：初始状态只调用进入回调，不调用离开回调（因为没有上一个状态）。

## 状态更新

```gdscript
func update():
    if current_state != null:
        (state_dictionary[current_state].normal as Callable).call()
```

> **设计说明**：每帧调用当前状态的 `normal` 回调，执行状态逻辑。

## 状态切换

```gdscript
func change_state(state_callable: Callable):
    var state_name = state_callable.get_method()
    if state_dictionary.has(state_name):
        _set_state.call_deferred(state_name)
    else:
        push_warning("No state with name " + state_name)
```

> **设计说明**：使用 `call_deferred` 延迟到下一帧切换状态，避免在状态回调中立即切换导致栈溢出。

## 内部状态切换

```gdscript
func _set_state(state_name: String):
    # 调用上一个状态的 leave
    if current_state:
        var leave_callable = state_dictionary[current_state].leave as Callable
        if !leave_callable.is_null():
            leave_callable.call()

    # 切换状态
    current_state = state_name

    # 调用新状态的 enter
    var enter_callable = state_dictionary[current_state].enter as Callable
    if !enter_callable.is_null():
        enter_callable.call()
```

> **设计说明**：
> - 先调用旧状态的 `leave`（清理工作）
> - 再切换 `current_state`
> - 最后调用新状态的 `enter`（初始化工作）
> - 使用 `is_null()` 检查 Callable 是否为空（可选回调）

## 使用示例

### 定义状态方法

```gdscript
# enemy.gd
func _notification(what: int) -> void:
    if what == NOTIFICATION_SCENE_INSTANTIATED:
        state_machine.add_states(state_spawn, enter_state_spawn, Callable())
        state_machine.add_states(state_normal, enter_state_normal, leave_state_normal)
        state_machine.add_states(state_charge_attack, enter_state_charge_attack, leave_state_charge_attack)
        state_machine.add_states(state_attack, enter_state_attack, leave_state_attack)
```

> **设计说明**：
> - `NOTIFICATION_SCENE_INSTANTIATED` 在节点完全创建后触发
> - `Callable()` 创建空 Callable，用于不需要 leave 回调的状态

### 状态方法定义

```gdscript
# 状态持续逻辑（每帧调用）
func state_spawn():
    pass

func state_normal():
    if is_multiplayer_authority():
        velocity = global_position.direction_to(target_position) * 40

# 进入状态时调用
func enter_state_spawn():
    var tween := create_tween()
    tween.tween_property(visuals, "scale", Vector2.ONE, .4)\
        .from(Vector2.ZERO)\
        .set_ease(Tween.EASE_OUT)\
        .set_trans(Tween.TRANS_BACK)
    tween.finished.connect(func ():
        state_machine.change_state(state_normal)
    )

# 离开状态时调用
func leave_state_normal():
    animation_player.play("RESET")
```

> **设计说明**：
> - `state_*` 方法是每帧执行的逻辑（返回值为 void）
> - `enter_state_*` 做初始化，如播放动画、设置计时器
> - `leave_state_*` 做清理，如停止动画、重置状态

### 更新状态机

```gdscript
func _process(_delta: float) -> void:
    state_machine.update()
    if is_multiplayer_authority():
        move_and_slide()
```

> **设计说明**：状态机每帧更新，通常在 `_process` 中调用。

### 切换状态

```gdscript
func state_normal():
    if is_multiplayer_authority():
        # 检查切换条件
        if can_attack && distance_to_target < 150:
            state_machine.change_state(state_charge_attack)
```

> **设计说明**：在 `normal` 回调中检查切换条件，满足时调用 `change_state`。

## 优势分析

### 1. 简洁的语法

使用 `Callable` 不需要创建大量状态类：

```gdscript
# 传统方式
state_machine.change_state(EnemyStateSpawn.new())

# Callable 方式
state_machine.change_state(state_spawn)
```

### 2. 灵活的状态定义

```gdscript
# 可以使用 Callable.create() 创建带参数的状态
state_machine.add_states(
    state_normal,
    enter_state_normal,
    Callable.create(self, "leave_state_normal", ["param1", "param2"])
)
```

### 3. 延迟切换

```gdscript
func change_state(state_callable: Callable):
    _set_state.call_deferred(state_name)  # 延迟到下一帧执行
```

## 与传统状态模式对比

| 方面 | CallableStateMachine | 传统状态模式 |
|------|---------------------|-------------|
| 代码量 | 较少 | 较多 |
| 灵活性 | 高 | 中 |
| 状态类数量 | 不需要 | 每个状态一个类 |
| 学习成本 | 中 | 高 |

## 注意事项

1. **状态方法命名**: 状态方法名必须与调用时一致
2. **空 Callable**: 使用 `is_null()` 检查空的可调用对象
3. **NOTIFICATION_SCENE_INSTANTIATED**: 确保在节点实例化时添加状态

```gdscript
func _notification(what: int) -> void:
    if what == NOTIFICATION_SCENE_INSTANTIATED:
        # 添加状态定义
```

## 相关文档

- [敌人AI与状态管理](/tutorial/mutiplayer_tutorial/enemy-ai-and-state-management)
- [网络架构概述](/tutorial/mutiplayer_tutorial/network-architecture-overview)
