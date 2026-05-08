---
title: 网络架构概述
description: Godot多人游戏中的网络架构设计模式
sticky: false
star: false
category:
  - 教程
tag:
  - 多人游戏
  - 网络同步
date: 2026-03-16
---

## 项目概述

该项目是一个基于 **Godot 4.x** 的 2D 多人射击游戏，采用 **P2P with Server Authority**（具有服务器权威的 P2P）架构。使用 `ENetMultiplayerPeer` 实现 TCP/UDP 连接。

## 核心架构设计

### 1. 权威模式 (Authority Model)

项目采用 **服务器权威 (Server Authority)** 模式：

- **服务器 (Server)**: 管理游戏状态、敌人生成、回合同步
- **客户端 (Client)**: 负责玩家输入，其他玩家位置由服务器同步

```gdscript
# multiplayer_menu.gd - 服务器创建
var server_peer := ENetMultiplayerPeer.new()
server_peer.create_server(MultiplayerConfig.port)

# 客户端连接
var client_peer := ENetMultiplayerPeer.new()
client_peer.create_client(MultiplayerConfig.ip_address, MultiplayerConfig.port)
```

> **设计说明**：ENetMultiplayerPeer 是 Godot 4 推荐的多人网络库，支持可靠和不可靠传输。服务器创建时监听指定端口，客户端通过 IP:端口 连接。

### 2. 网络配置

```gdscript
# multiplayer_config.gd
static var ip_address: String = "127.0.0.1"
static var port: int = 3000
static var display_name: String
```

> **设计说明**：使用静态变量存储配置，因为多人游戏需要跨场景共享这些设置（如大厅设置的游戏房间参数）。

### 3. 多重授权 (Multiplayer Authority)

通过 `input_multiplayer_authority` 实现玩家对自身实体的控制：

```gdscript
# player.gd
var input_multiplayer_authority: int

func _ready():
    player_input_synchronizer_component.set_multiplayer_authority(input_multiplayer_authority)
```

> **设计说明**：`input_multiplayer_authority` 存储当前玩家对应的 peer ID。服务器为每个连接的 peer 创建玩家实例时，将该 peer 的 ID 设为输入授权，实现"每个玩家控制自己的角色"。

## 关键设计模式

### MultiplayerSynchronizer 组件

使用 Godot 内置的 `MultiplayerSynchronizer` 节点进行状态同步：

```gdscript
# player_input_synchronizer_component.gd
class_name PlayerInputSynchronizerComponent
extends MultiplayerSynchronizer

var movement_vector: Vector2 = Vector2.ZERO
var aim_vector: Vector2 = Vector2.RIGHT
var is_attack_pressed: bool

func _process(_delta: float):
    if is_multiplayer_authority():
        gather_input()
```

> **设计说明**：继承 MultiplayerSynchronizer 后，声明的变量会自动同步到所有客户端。`is_multiplayer_authority()` 判断当前节点是否归本地玩家控制——只有控制者才采集输入，避免多个客户端采集同一份输入。

### RPC 通信模式

项目使用三种 RPC 调用模式：

| 模式 | 用途 | 示例 |
|------|------|------|
| `@rpc("authority", "call_local")` | 权威方执行，本地调用 | `play_hit_effects()` |
| `@rpc("authority", "call_remote")` | 权威方执行，远程调用 | `_synchronize()` |
| `@rpc("any_peer", "call_local", "reliable")` | 任意端可调用 | `peer_ready()` |

> **设计说明**：
> - `authority` 表示由具有该节点权威的一方执行（通常是服务器）
> - `call_local` 表示执行后在本地也调用，适合视觉效果
> - `call_remote` 表示只发给其他客户端
> - `any_peer` 允许任意客户端发起请求
> - `reliable` 确保数据必达（用于重要操作如加入游戏），`unreliable` 允许丢包（用于高频更新如移动）

## 网络层级结构

```
┌─────────────────────────────────────┐
│           UI Layer (UI)             │
├─────────────────────────────────────┤
│        Game Logic (Main)            │
│  - LobbyManager (大厅管理)           │
│  - EnemyManager (敌人管理)           │
├─────────────────────────────────────┤
│      Entity Layer (Entities)         │
│  - Player (玩家)                    │
│  - Enemy (敌人)                     │
│  - Bullet (子弹)                    │
├─────────────────────────────────────┤
│    Component Layer (组件)            │
│  - PlayerInputSynchronizer          │
│  - HealthComponent                  │
│  - HitboxComponent / HurtboxComponent│
├─────────────────────────────────────┤
│       Network Layer                  │
│  - ENetMultiplayerPeer              │
│  - MultiplayerSpawner               │
│  - MultiplayerSynchronizer          │
└─────────────────────────────────────┘
```

## 相关文档

- [玩家输入同步机制](/tutorial/mutiplayer_tutorial/player-input-synchronization)
- [大厅与连接管理](/tutorial/mutiplayer_tutorial/lobby-and-connection-management)
- [敌人AI与状态管理](/tutorial/mutiplayer_tutorial/enemy-ai-and-state-management)
- [攻击与碰撞系统](/tutorial/mutiplayer_tutorial/attack-and-collision-system)
- [场景管理与玩家生命周期](/tutorial/mutiplayer_tutorial/scene-management-and-player-lifecycle)
