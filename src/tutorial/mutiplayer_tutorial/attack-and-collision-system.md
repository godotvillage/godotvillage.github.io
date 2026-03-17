---
title: 攻击与碰撞系统
description: 子弹、Hitbox/Hurtbox设计与网络同步
sticky: false
star: false
category:
  - 教程
tag:
  - 多人游戏
  - 战斗系统
date: 2026-03-16
---

## 组件架构

项目使用组合模式实现攻击系统：

```
HitboxComponent (攻击方)
        ↓
   碰撞检测
        ↓
HurtboxComponent (受击方)
        ↓
   伤害处理
        ↓
  HealthComponent
```

## HitboxComponent (攻击组件)

### 定义

```gdscript
class_name HitboxComponent
extends Area2D

signal hit_hurtbox(hurtbox_component: HurtboxComponent)

var damage: int = 1
var source_peer_id: int  # 攻击来源的 peer ID
var is_hit_handled: bool  # 防止重复命中
```

> **设计说明**：`source_peer_id` 记录子弹是谁发射的，用于区分敌我伤害。`is_hit_handled` 防止单次碰撞触发多次伤害。

## HurtboxComponent (受击组件)

### 定义

```gdscript
class_name HurtboxComponent
extends Area2D

signal hit_by_hitbox(hitbox_component: HitboxComponent)

var disable_collisions: bool = false

func _on_area_entered(area: Area2D):
    if area is HitboxComponent:
        if disable_collisions:
            return
        hit_by_hitbox.emit(area)
```

> **设计说明**：受击框检测到攻击框时发出信号。`disable_collisions` 用于受伤后短暂无敌（如受伤闪烁期间）。

## 子弹系统

### 子弹创建

```gdscript
# player.gd
func try_fire():
    if !fire_rate_timer.is_stopped():
        return

    var bullet = bullet_scene.instantiate() as Bullet
    bullet.damage = get_bullet_damage()
    bullet.global_position = barrel_position.global_position
    bullet.source_peer_id = player_input_synchronizer_component.get_multiplayer_authority()
    bullet.start(player_input_synchronizer_component.aim_vector)
    get_parent().add_child(bullet, true)
```

> **设计说明**：
> - 第二个参数 `true` 表示在服务器端创建
> - `source_peer_id` 存储发射者的 peer ID，用于伤害归属
> - `aim_vector` 决定子弹飞行方向

### 子弹飞行

```gdscript
# bullet.gd
class_name Bullet
extends Node2D

const SPEED: int = 600

var direction: Vector2
var source_peer_id: int
var damage: int = 1

func _process(delta: float):
    global_position += direction * SPEED * delta

func start(dir: Vector2):
    direction = dir
    rotation = direction.angle()
```

> **设计说明**：子弹继承 Node2D（而非 RigidBody），手动计算位置。服务器和客户端各自运行子弹逻辑，保证一致性。

### 子弹碰撞

```gdscript
func _ready() -> void:
    hitbox_component.damage = damage
    hitbox_component.source_peer_id = source_peer_id
    hitbox_component.hit_hurtbox.connect(_on_hit_hurtbox)
    life_timer.timeout.connect(_on_life_timer_timeout)

func register_collision():
    hitbox_component.is_hit_handled = true
    queue_free()

func _on_hit_hurtbox(_hurtbox_component: HurtboxComponent):
    register_collision()
```

> **设计说明**：碰撞后立即标记 `is_hit_handled` 并销毁子弹，防止穿透再次触发。

## 伤害处理流程

### 1. 玩家被击中

```gdscript
# player.gd
func _on_hit_by_hitbox():
    play_hit_effects.rpc()

# hurtbox 接收信号
func hit_by_hitbox(hitbox_component: HitboxComponent):
    # 造成伤害（仅服务器）
    if is_multiplayer_authority():
        health_component.damage(hitbox_component.damage)
```

> **设计说明**：视觉效果（RPC）和伤害计算（服务器）分离。`play_hit_effects.rpc()` 所有客户端都会执行，伤害仅服务器计算。

### 2. 伤害计算

```gdscript
# health_component.gd
class_name HealthComponent
extends Node

signal died
signal damaged
signal health_changed(current_health: int, max_health: int)

@export var max_health: int = 1
var _current_health: int

func damage(amount: int):
    current_health = clamp(current_health - amount, 0, max_health)
    damaged.emit()
    if current_health == 0:
        died.emit()
```

> **设计说明**：生命值归一化到 [0, max_health] 范围。死亡时发出 `died` 信号，由父节点处理后续逻辑。

### 3. 死亡处理

```gdscript
# player.gd
func _on_died():
    kill()

func kill():
    if !is_multiplayer_authority():
        push_error("Cannot call kill on non-server client")
        return

    _kill.rpc()
    await get_tree().create_timer(.5).timeout
    died.emit()
    queue_free()

@rpc("authority", "call_local", "reliable")
func _kill():
    is_dying = true
    player_input_synchronizer_component.public_visibility = false
```

> **设计说明**：
> - `_kill.rpc()` 使用 `call_local`，服务器执行后本地也隐藏玩家
> - `reliable` 确保死亡状态同步
> - 延迟 0.5 秒后再销毁，让死亡动画有时间播放

## 攻击效果同步

### 开火效果

```gdscript
@rpc("authority", "call_local", "unreliable")
func play_fire_effects():
    if weapon_animation_player.is_playing():
        weapon_animation_player.stop()
    weapon_animation_player.play("fire")

    # 枪口闪光
    var muzzle_flash: Node2D = muzzle_flash_scene.instantiate()
    muzzle_flash.global_position = barrel_position.global_position
    muzzle_flash.rotation = barrel_position.global_rotation
    get_parent().add_child(muzzle_flash)

    # 屏幕震动（仅本地）
    if player_input_synchronizer_component.is_multiplayer_authority():
        GameCamera.shake(1)

    weapon_stream_player.play()
```

> **设计说明**：
> - `unreliable` 用于高频效果，允许丢包
> - 屏幕震动仅本地执行，因为只有本地玩家需要震动反馈
> - 枪口闪光创建为本地节点，不用同步

### 受击效果

```gdscript
@rpc("authority", "call_local")
func play_hit_effects():
    if player_input_synchronizer_component.is_multiplayer_authority():
        GameCamera.shake(1)
        hit_stream_player.play()

    # 粒子效果
    var hit_particles: Node2D = ground_particles_scene.instantiate()
    background_node.add_child(hit_particles)
    hit_particles.global_position = global_position

    # 闪烁效果
    hurtbox_component.disable_collisions = true
    var tween := create_tween()
    tween.set_loops(10)
    tween.tween_property(visuals, "visible", false, .05)
    tween.tween_property(visuals, "visible", true, .05)
```

> **设计说明**：受击时通过 tween 实现受伤闪烁，同时禁用碰撞防止连续受伤。

## 攻击冷却

```gdscript
func try_fire():
    if !fire_rate_timer.is_stopped():
        return

    # ... 开火逻辑

    fire_rate_timer.wait_time = get_fire_rate()
    fire_rate_timer.start()

func get_fire_rate() -> float:
    var fire_rate_count := UpgradeManager.get_peer_upgrade_count(
        player_input_synchronizer_component.get_multiplayer_authority(),
        "fire_rate"
    )
    return BASE_FIRE_RATE * (1 - (.1 * fire_rate_count))
```

> **设计说明**：根据玩家升级计算射速。`get_multiplayer_authority()` 获取当前玩家的 peer ID，用于查询该玩家的升级属性。

## 网络同步要点

| 方面 | 实现方式 |
|------|----------|
| 伤害计算 | 仅服务器 (is_multiplayer_authority) |
| 效果播放 | RPC call_local |
| 位置同步 | MultiplayerSynchronizer |
| 可靠性 | 关键操作用 reliable，开火效果用 unreliable |

## 设计模式总结

1. **组件化设计**: 分离攻击、伤害、效果
2. **源追溯**: source_peer_id 追踪伤害来源
3. **权威验证**: 所有伤害计算在服务器执行
4. **效果分离**: 视觉效果与逻辑分离，通过 RPC 同步

## 相关文档

- [网络架构概述](/tutorial/mutiplayer_tutorial/network-architecture-overview)
- [玩家输入同步机制](/tutorial/mutiplayer_tutorial/player-input-synchronization)
- [敌人AI与状态管理](/tutorial/mutiplayer_tutorial/enemy-ai-and-state-management)
