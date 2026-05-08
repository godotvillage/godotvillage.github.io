---
title: 玩家输入同步机制
description: 多人游戏中的玩家输入同步机制
sticky: false
star: false
category:
  - 教程
tag:
  - 多人游戏
  - 输入同步
date: 2026-03-16
---

## 核心组件：PlayerInputSynchronizerComponent

这是实现玩家输入同步的核心组件，继承自 `MultiplayerSynchronizer`。

### 工作原理

```gdscript
class_name PlayerInputSynchronizerComponent
extends MultiplayerSynchronizer

var movement_vector: Vector2 = Vector2.ZERO
var aim_vector: Vector2 = Vector2.RIGHT
var is_attack_pressed: bool
```

> **设计说明**：继承 MultiplayerSynchronizer 后，这些变量会自动同步给所有客户端。本地玩家修改这些值后，其他客户端会收到更新。

## 输入采集

```gdscript
func gather_input():
    # 方向输入
    movement_vector = Input.get_vector("move_left", "move_right", "move_up", "move_down")

    # 瞄准方向（鼠标位置）
    aim_vector = aim_root.global_position.direction_to(aim_root.get_global_mouse_position())

    # 攻击输入
    is_attack_pressed = Input.is_action_pressed("attack")
```

> **设计说明**：
> - `Input.get_vector` 获取方向键输入，返回归一化的向量
> - 瞄准方向通过计算自身到鼠标位置的方向向量得到
> - 攻击使用"按下"状态而非"按下瞬间"，实现按住连发

## 授权机制

```gdscript
func _ready():
    # 设置网络授权
    player_input_synchronizer_component.set_multiplayer_authority(input_multiplayer_authority)

    # 非本地玩家禁用激活区域碰撞
    activation_area_collision_shape.disabled =\
        !player_input_synchronizer_component.is_multiplayer_authority()
```

> **设计说明**：`input_multiplayer_authority` 在玩家生成时由服务器传入（对应连接的 peer ID）。调用 `set_multiplayer_authority` 后，`is_multiplayer_authority()` 会对应该玩家返回 true。非本地玩家的碰撞体禁用，避免本地客户端处理不该自己处理的碰撞。

### 关键判断方法

| 方法 | 用途 |
|------|------|
| `is_multiplayer_authority()` | 判断当前节点是否具有权威 |
| `is_multiplayer_authority()` 在 Player 中 | 判断是否本地玩家 |

## 移动同步

```gdscript
func _process(delta: float) -> void:
    var movement_vector := player_input_synchronizer_component.movement_vector

    if is_multiplayer_authority():
        # 仅权威方计算移动
        var target_velocity = movement_vector * get_movement_speed()
        velocity = velocity.lerp(target_velocity, 1 - exp(-25 * delta))
        move_and_slide()

        # 攻击逻辑仅在权威方执行
        if player_input_synchronizer_component.is_attack_pressed:
            try_fire()
```

> **设计说明**：只有具有 authority 的玩家（即自己）才计算移动和执行攻击。其他客户端通过 MultiplayerSynchronizer 同步 `movement_vector`，但不做物理计算，只做插值动画。

**使用插值实现平滑移动：**
```gdscript
velocity = velocity.lerp(target_velocity, 1 - exp(-25 * delta))
```

> **设计说明**：使用指数衰减插值实现平滑加速，参数 25 控制响应速度。`exp(-25 * delta)` 约等于 0.99997，每帧逼近目标速度。

## 动画同步

动画播放基于 `movement_vector`：

```gdscript
if is_equal_approx(movement_vector.length_squared(), 0):
    animation_player.play("RESET")
else:
    animation_player.play("run")
```

> **设计说明**：因为所有客户端都同步了 `movement_vector`，所以每个客户端都能独立判断并播放相同动画，实现无需 RPC 的动画同步。

## 瞄准同步

```gdscript
func update_aim_position():
    var aim_vector = player_input_synchronizer_component.aim_vector
    var aim_position = weapon_root.global_position + aim_vector

    # 角色朝向
    visuals.scale = Vector2.ONE if aim_vector.x > 0 else Vector2(-1, 1)

    # 武器旋转
    weapon_root.look_at(aim_position)
```

> **设计说明**：通过同步 `aim_vector`，所有客户端都能独立计算瞄准方向，实现武器和角色朝向的同步。

## 显示名称处理

```gdscript
var is_single_player = multiplayer.multiplayer_peer is OfflineMultiplayerPeer
var is_client_authority = player_input_synchronizer_component.is_multiplayer_authority()

if is_single_player || is_client_authority:
    display_name_label.visible = false  # 本地玩家隐藏名称
else:
    display_name_label.text = display_name  # 显示其他玩家名称
```

> **设计说明**：本地玩家不需要看到自己的名字（FPS 视角），但可以看到其他玩家的名字用于识别。单机模式也隐藏名称。

## 设计模式总结

1. **输入所有权**: 每个玩家控制自己的输入采集
2. **状态预测**: 本地玩家立即响应输入
3. **权威验证**: 服务器验证并执行关键操作（攻击、伤害）
4. **自动同步**: MultiplayerSynchronizer 自动同步输入状态给其他客户端

## 相关文档

- [网络架构概述](/tutorial/mutiplayer_tutorial/network-architecture-overview)
- [攻击与碰撞系统](/tutorial/mutiplayer_tutorial/attack-and-collision-system)
- [场景管理与玩家生命周期](/tutorial/mutiplayer_tutorial/scene-management-and-player-lifecycle)
