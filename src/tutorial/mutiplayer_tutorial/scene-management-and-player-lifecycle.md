---
title: 场景管理与玩家生命周期
description: 场景切换、玩家生成、复活的实现机制
sticky: false
star: false
category:
  - 教程
tag:
  - 多人游戏
  - 场景管理
date: 2026-03-16
---

## 场景结构

### 主场景层级

```
Main (Node)
├── MultiplayerSpawner
├── CenterPosition (Marker2D)
├── EnemyManager
│   ├── SpawnIntervalTimer
│   └── RoundTimer
├── BackgroundEffects (Node2D)
├── BackgroundMask (Sprite2D)
├── GameUI
├── PauseMenu
└── LobbyManager
```

## MultiplayerSpawner 使用

### 配置

```gdscript
# main.gd
var player_scene: PackedScene = preload("uid://c5dfksrt3u5km")

@onready var multiplayer_spawner: MultiplayerSpawner = $MultiplayerSpawner

func _ready():
    multiplayer_spawner.spawn_function = func(data):
        return spawn_player(data)
```

> **设计说明**：`MultiplayerSpawner` 是 Godot 4 的节点，用于在多人游戏中同步创建和销毁节点。`spawn_function` 定义如何根据 data 创建节点。

### 生成函数

```gdscript
func spawn_player(data: Dictionary) -> Player:
    var player = player_scene.instantiate() as Player
    player.set_display_name(data.display_name)
    player.name = str(data.peer_id)  # 节点名称设为 peer ID
    player.input_multiplayer_authority = data.peer_id
    player.global_position = center_position.global_position

    # 本地玩家连接 UI
    if multiplayer.get_unique_id() == data.peer_id:
        game_ui.connect_player(player)

    # 服务器监听死亡
    if is_multiplayer_authority():
        if data.is_respawning:
            player.is_respawn = true
        player.died.connect(_on_player_died.bind(data.peer_id))

    player_dictionary[data.peer_id] = player
    return player
```

> **设计说明**：
> - 节点名称必须设为 peer ID，便于 `get_tree().get_node(str(peer_id))` 获取
> - `input_multiplayer_authority` 设置后，该玩家能控制自己的角色
> - 仅服务器订阅死亡信号（因为只有服务器执行游戏逻辑）
> - `is_respawning` 标记是否是复活，复活时初始血量设为 1

## 玩家加入流程

```gdscript
@rpc("any_peer", "call_local", "reliable")
func peer_ready(display_name: String):
    var sender_id = multiplayer.get_remote_sender_id()
    player_name_dictionary[sender_id] = display_name

    # 生成玩家
    multiplayer_spawner.spawn({
        "peer_id": sender_id,
        "display_name": player_name_dictionary[sender_id],
        "is_respawning": false
    })

    # 同步敌人状态
    enemy_manager.synchronize(sender_id)
```

> **设计说明**：
> - `get_remote_sender_id()` 获取发起请求的客户端 peer ID
> - `spawn()` 触发 MultiplayerSpawner 自动同步创建玩家到所有客户端
> - 新玩家加入时立即同步当前敌人状态

## 玩家断开处理

```gdscript
# 服务器端处理
func _on_peer_disconnected(peer_id: int):
    if player_dictionary.has(peer_id):
        var player := player_dictionary[peer_id]
        if is_instance_valid(player):
            player.kill()
        player_dictionary.erase(peer_id)
```

> **设计说明**：服务器检测到玩家断开，调用 `kill()` 销毁玩家节点。客户端会收到同步的节点销毁。

## 玩家死亡与复活

### 死亡处理

```gdscript
# 玩家死亡
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
> - `kill()` 仅服务器可调用
> - `_kill.rpc()` 通知所有客户端玩家死亡
> - 延迟 0.5 秒给死亡动画播放时间

### 服务器监听死亡

```gdscript
func _on_player_died(peer_id: int):
    dead_peers.append(peer_id)
    check_game_over()
```

> **设计说明**：服务器追踪死亡玩家到 `dead_peers` 数组。

### 游戏结束检查

```gdscript
func check_game_over():
    var is_game_over := true

    for peer_id in get_all_peers():
        if !dead_peers.has(peer_id):
            is_game_over = false
            break

    if is_game_over:
        end_game()
```

> **设计说明**：所有玩家都死亡时游戏结束。

### 回合复活

```gdscript
func _on_round_completed():
    respawn_dead_peers()

func respawn_dead_peers():
    var all_peers := get_all_peers()
    for peer_id in dead_peers:
        if !all_peers.has(peer_id):
            continue
        multiplayer_spawner.spawn({
            "peer_id": peer_id,
            "display_name": player_name_dictionary[peer_id],
            "is_respawning": true
        })
    dead_peers.clear()
```

> **设计说明**：每回合结束时，复活本回合死亡的玩家。使用 `multiplayer_spawner.spawn()` 同步创建复活玩家。

## 场景切换

### 游戏结束切换

```gdscript
func end_game():
    get_tree().paused = false
    # 断开网络连接
    multiplayer.multiplayer_peer = OfflineMultiplayerPeer.new()
    # 返回主菜单
    get_tree().change_scene_to_file(MAIN_MENU_SCENE_PATH)
```

> **设计说明**：
> - 设置为 `OfflineMultiplayerPeer` 断开网络，转为单机模式
> - 切换回主菜单场景

### 菜单到游戏

```gdscript
# multiplayer_menu.gd
func _on_host_pressed():
    var server_peer := ENetMultiplayerPeer.new()
    server_peer.create_server(MultiplayerConfig.port)
    multiplayer.multiplayer_peer = server_peer
    get_tree().change_scene_to_packed(main_scene)

func _on_connected_to_server():
    get_tree().change_scene_to_packed(main_scene)
```

> **设计说明**：主机直接切换，客户端等待连接成功后切换。

## 游戏流程状态机

```
┌──────────────────┐
│    主菜单         │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼          ▼
┌───────┐  ┌───────┐
│ Host  │  │ Join  │
└───┬───┘  └───┬───┘
    │          │
    └────┬─────┘
         ▼
┌──────────────────┐
│   大厅等待        │
│ (等待玩家准备)    │
└────────┬─────────┘
         │ 所有玩家准备
         ▼
┌──────────────────┐
│   游戏进行        │
│ - 敌人生成        │
│ - 战斗           │
│ - 回合结算        │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼          ▼
┌───────┐  ┌───────┐
│ 游戏  │  │ 游戏  │
│ 完成  │  │ 结束  │
└───┬───┘  └───┬───┘
    │          │
    └────┬─────┘
         ▼
┌──────────────────┐
│    主菜单         │
└──────────────────┘
```

## 数据管理

### 玩家字典

```gdscript
var player_dictionary: Dictionary[int, Player] = {}
var player_name_dictionary: Dictionary[int, String] = {}
var dead_peers: Array[int] = []
```

> **设计说明**：使用 peer ID 作为键存储玩家引用，便于通过 ID 查找。

### 获取所有 Peer

```gdscript
func get_all_peers() -> PackedInt32Array:
    var all_peers := multiplayer.get_peers()
    all_peers.push_back(multiplayer.get_unique_id())
    return all_peers
```

> **设计说明**：`get_peers()` 只返回客户端，不含服务器自己，需要手动添加。

## 设计要点总结

| 功能 | 实现方式 |
|------|----------|
| 玩家生成 | MultiplayerSpawner |
| 玩家追踪 | Dictionary[int, Player] |
| 死亡追踪 | dead_peers Array |
| 场景切换 | change_scene_to_file / change_scene_to_packed |
| 断线处理 | peer_disconnected 信号 |

## 相关文档

- [网络架构概述](/tutorial/mutiplayer_tutorial/network-architecture-overview)
- [大厅与连接管理](/tutorial/mutiplayer_tutorial/lobby-and-connection-management)
- [敌人AI与状态管理](/tutorial/mutiplayer_tutorial/enemy-ai-and-state-management)
