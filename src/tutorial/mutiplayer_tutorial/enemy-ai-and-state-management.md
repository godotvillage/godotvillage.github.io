---
title: 敌人AI与状态管理
description: 敌人状态机设计和服务器权威AI
sticky: false
star: false
category:
  - 教程
tag:
  - 多人游戏
  - AI
  - 状态机
date: 2026-03-16
---

## 敌人架构概览

项目使用 **CallableStateMachine** 实现敌人状态管理，配合服务器权威模式。

### 敌人状态列表

```
SPAWN (出生) → NORMAL (普通) → CHARGE_ATTACK (冲锋) → ATTACK (攻击)
```

## 状态机实现

### CallableStateMachine 类

```gdscript
# callable_state_machine.gd
class_name CallableStateMachine

var state_dictionary = {}
var current_state: String

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

> **设计说明**：用字典存储状态的三个回调函数，键是方法名。`Callable` 可以直接绑定对象方法，比传统状态模式更简洁。

### 敌人状态定义

```gdscript
# enemy.gd
func _notification(what: int) -> void:
    if what == NOTIFICATION_SCENE_INSTANTIATED:
        state_machine.add_states(state_spawn, enter_state_spawn, Callable())
        state_machine.add_states(state_normal, enter_state_normal, leave_state_normal)
        state_machine.add_states(state_charge_attack, enter_state_charge_attack, leave_state_charge_attack)
        state_machine.add_states(state_attack, enter_state_attack, leave_state_attack)
```

> **设计说明**：`NOTIFICATION_SCENE_INSTANTIATED` 在场景实例化后触发，确保节点完全准备好后再添加状态。

## 敌人状态详解

### 1. SPAWN 状态（出生）

```gdscript
func enter_state_spawn():
    var tween := create_tween()
    tween.tween_property(visuals, "scale", Vector2.ONE, .4)\
        .from(Vector2.ZERO)\
        .set_ease(Tween.EASE_OUT)\
        .set_trans(Tween.TRANS_BACK)
    tween.finished.connect(func ():
        state_machine.change_state(state_normal)
    )
```

> **设计说明**：使用弹性动画让敌人从无到有出现，完成后自动切换到普通状态。

### 2. NORMAL 状态（普通）

```gdscript
func enter_state_normal():
    animation_player.play("run")
    if is_multiplayer_authority():
        acquire_target()
        target_acquisition_timer.start()

func state_normal():
    if is_multiplayer_authority():
        # 移动向目标
        velocity = global_position.direction_to(target_position) * 40

        # 定时获取新目标
        if target_acquisition_timer.is_stopped():
            acquire_target()
            target_acquisition_timer.start()

        # 检查攻击条件
        var can_attack := attack_cooldown_timer.is_stopped() || global_position.distance_to(target_position) < 16
        if can_attack && global_position.distance_to(target_position) < 150:
            state_machine.change_state(state_charge_attack)
```

> **设计说明**：AI 逻辑仅在服务器执行（`is_multiplayer_authority()`）。定时更新目标位置（每 0.5 秒），避免每帧计算。当玩家进入攻击范围且冷却结束时，切换到冲锋状态。

### 3. CHARGE_ATTACK 状态（冲锋准备）

```gdscript
func enter_state_charge_attack():
    if is_multiplayer_authority():
        acquire_target()
        charge_attack_timer.start()

    # 显示警告图标
    alert_tween = create_tween()
    alert_tween.tween_property(alert_sprite, "scale", Vector2.ONE, .2)

func state_charge_attack():
    if is_multiplayer_authority():
        # 减速
        velocity = velocity.lerp(Vector2.ZERO, 1.0 - exp(-15 * get_process_delta_time()))
        if charge_attack_timer.is_stopped():
            state_machine.change_state(state_attack)
```

> **设计说明**：冲锋前有短暂准备时间（通过计时器），期间显示警告图标给玩家反应。

### 4. ATTACK 状态（攻击）

```gdscript
func enter_state_attack():
    if is_multiplayer_authority():
        # 启用碰撞体
        collision_mask = 1 << 0
        collision_layer = 0
        hitbox_collision_shape.disabled = false
        # 冲刺
        velocity = global_position.direction_to(target_position) * 400

func state_attack():
    if is_multiplayer_authority():
        # 减速
        velocity = velocity.lerp(Vector2.ZERO, 1.0 - exp(-3 * get_process_delta_time()))
        if velocity.length() < 25:
            state_machine.change_state(state_normal)

func leave_state_attack():
    if is_multiplayer_authority():
        # 恢复碰撞层
        collision_mask = default_collision_mask
        collision_layer = default_collision_layer
        hitbox_collision_shape.disabled = true
        attack_cooldown_timer.start()
```

> **设计说明**：攻击时临时改变碰撞层——攻击方的碰撞层设为 0（不与玩家碰撞），碰撞掩码设为检测玩家层。离开状态时恢复。

## 目标获取

```gdscript
func acquire_target():
    var players = get_tree().get_nodes_in_group("player")
    var nearest_player: Player = null

    for player in players:
        if nearest_player == null:
            nearest_player = player
        else:
            if player.global_position.distance_squared_to(global_position) < \
               nearest_player.global_position.distance_squared_to(global_position):
                nearest_player = player

    if nearest_player != null:
        target_position = nearest_player.global_position
```

> **设计说明**：使用 `distance_squared_to` 避免开方运算，提高性能。选择最近玩家作为目标。

## 网络同步处理

### 权威判断

```gdscript
func _ready():
    if is_multiplayer_authority():
        health_component.died.connect(_on_died)
        state_machine.set_initial_state(state_spawn)
        hurtbox_component.hit_by_hitbox.connect(_on_hit_by_hitbox)
```

> **设计说明**：仅服务器创建敌人，所以直接检查 `is_multiplayer_authority()` 即可。客户端不创建敌人实例，也不执行 AI。

### 动画和效果

```gdscript
@rpc("authority", "call_local")
func spawn_hit_effects():
    hit_stream_player.play()
    var hit_particles: Node2D = impact_particles_scene.instantiate()
    hit_particles.global_position = hurtbox_component.global_position
    get_parent().add_child(hit_particles)
```

> **设计说明**：`call_local` 让服务器执行后本地也播放效果，不需要额外 RPC。

## 敌人管理器 (EnemyManager)

### 服务器权威

所有敌人生成由服务器控制：

```gdscript
# enemy_manager.gd
func start():
    if is_multiplayer_authority():
        begin_round()

func spawn_enemy():
    var enemy = enemy_scene.instantiate() as Node2D
    enemy.global_position = get_random_spawn_position()
    enemy_spawn_root.add_child(enemy, true)
    spawned_enemies += 1
```

> **设计说明**：第二个参数 `true` 表示在服务器端实例化，确保多人和单机都能正常工作。

### 回合同步

```gdscript
func synchronize(to_peer_id: int = -1):
    if !is_multiplayer_authority():
        return

    var data = {
        "round_timer_is_running": !round_timer.is_stopped(),
        "round_timer_time_left": round_timer.time_left,
        "round_count": round_count
    }

    if to_peer_id > -1 && to_peer_id != 1:
        _synchronize.rpc_id(to_peer_id, data)
    else:
        _synchronize.rpc(data)
```

> **设计说明**：
> - `to_peer_id = -1` 表示广播给所有客户端
> - `to_peer_id > 0 && to_peer_id != 1` 表示发给特定客户端（不含服务器自己）
> - 服务器自己不需要同步，所以用 `rpc_id` 发给其他客户端，用 `rpc` 发给所有（含自己）

## 敌人死亡处理

```gdscript
func _on_died():
    spawn_death_particles.rpc()
    GameEvents.emit_enemy_died()
    queue_free()
```

```gdscript
# game_events.gd
extends Node

signal enemy_died

func emit_enemy_died():
    enemy_died.emit()
```

```gdscript
# enemy_manager.gd
func _on_enemy_died():
    spawned_enemies -= 1
    check_round_completed()
```

> **设计说明**：使用信号跨节点通信。EnemyManager 订阅 GameEvents 的 `enemy_died` 信号，敌人死亡时自动减少计数并检查回合是否完成。

## 设计要点总结

| 设计点 | 实现方式 |
|--------|----------|
| 状态管理 | CallableStateMachine 自定义状态机 |
| AI逻辑 | 仅服务器执行（is_multiplayer_authority） |
| 动画同步 | 通过 RPC 本地执行 |
| 目标选择 | 最近玩家优先 |
| 碰撞检测 | 动态启用/禁用碰撞层 |

## 相关文档

- [网络架构概述](/tutorial/mutiplayer_tutorial/network-architecture-overview)
- [攻击与碰撞系统](/tutorial/mutiplayer_tutorial/attack-and-collision-system)
- [CallableStateMachine实现](/tutorial/mutiplayer_tutorial/callable-state-machine-implementation)
