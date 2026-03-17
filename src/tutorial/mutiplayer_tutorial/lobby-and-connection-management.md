---
title: 大厅与连接管理
description: 多人游戏大厅系统和连接管理机制
sticky: false
star: false
category:
  - 教程
tag:
  - 多人游戏
  - 大厅系统
date: 2026-03-16
---

## 连接建立

### 主机创建服务器

```gdscript
# multiplayer_menu.gd
func _on_host_pressed() -> void:
    var server_peer := ENetMultiplayerPeer.new()
    var error := server_peer.create_server(MultiplayerConfig.port)

    if error != Error.OK:
        show_error(false)
        return

    multiplayer.multiplayer_peer = server_peer
    get_tree().change_scene_to_packed(main_scene)
```

> **设计说明**：创建 ENet 服务器并设置为当前 multiplayer peer。服务器默认 peer ID 为 1。

### 客户端加入服务器

```gdscript
func _on_join_pressed() -> void:
    var client_peer := ENetMultiplayerPeer.new()
    var error := client_peer.create_client(MultiplayerConfig.ip_address, MultiplayerConfig.port)

    if error != Error.OK:
        show_error(true)
        return

    is_connecting = true
    multiplayer.multiplayer_peer = client_peer
    validate()
```

> **设计说明**：客户端创建时只需要服务器 IP 和端口，peer ID 由服务器分配。

### 连接状态回调

```gdscript
multiplayer.connected_to_server.connect(_on_connected_to_server)
multiplayer.connection_failed.connect(_on_connection_failed)
```

> **设计说明**：Godot 内置的多人信号，连接成功或失败时触发，用于处理 UI 切换。

## LobbyManager 大厅管理

### 功能职责

- 管理玩家准备状态
- 追踪已连接的 peer
- 协调游戏开始

### 核心数据结构

```gdscript
var _ready_peer_ids: Array[int] = []
var _is_lobby_closed: bool
```

> **设计说明**：`_ready_peer_ids` 存储已准备好的玩家 peer ID，`_is_lobby_closed` 防止大厅关闭后新玩家加入。

### 信号系统

```gdscript
signal all_peers_ready       # 所有玩家准备完毕
signal self_peer_ready        # 本地玩家准备
signal lobby_closed          # 大厅关闭
signal peer_ready_states_changed(peers_ready: int, peers_total: int)
```

> **设计说明**：大厅状态变化时发出信号，UI 层订阅这些信号更新界面（如显示"X/Y 玩家已准备"）。

## 玩家准备机制

### 玩家发送准备状态

```gdscript
func _input(event: InputEvent) -> void:
    if event.is_action_pressed("lobby_ready"):
        # RPC 调用服务器端的准备方法
        request_peer_ready.rpc_id(MultiplayerPeer.TARGET_PEER_SERVER)
```

> **设计说明**：`rpc_id(1, ...)` 明确指定发送给服务器（peer ID 1）。`TARGET_PEER_SERVER` = 1，表示服务器。

### 服务器处理准备

```gdscript
@rpc("any_peer", "call_local", "reliable")
func request_peer_ready():
    if !is_multiplayer_authority() || is_lobby_closed:
        return

    var sender_id := multiplayer.get_remote_sender_id()

    if !ready_peer_ids.has(sender_id):
        ready_peer_ids.append(sender_id)
        emit_peer_ready_states_changed()

    # 通知该玩家其准备状态已被接受
    set_peer_ready.rpc(sender_id)
    try_all_peers_ready()
```

> **设计说明**：
> - `get_remote_sender_id()` 获取发起请求的玩家 ID
> - 使用 `call_local` 让服务器也执行（注册状态）
> - 再调用 `set_peer_ready.rpc(sender_id)` 通知该玩家已准备

### 检查所有玩家准备

```gdscript
func check_all_peers_ready() -> bool:
    var all_peers := multiplayer.get_peers()
    all_peers.append(MultiplayerPeer.TARGET_PEER_SERVER)

    for peer_id in all_peers:
        if !ready_peer_ids.has(peer_id):
            return false
    return true
```

> **设计说明**：服务器也作为一个 peer，需要加入检查列表。

## 玩家加入流程

### 主场景初始化

```gdscript
# main.gd
func _ready():
    multiplayer_spawner.spawn_function = func(data):
        var player = player_scene.instantiate() as Player
        player.set_display_name(data.display_name)
        player.name = str(data.peer_id)
        player.input_multiplayer_authority = data.peer_id
        player.global_position = center_position.global_position

        # 本地玩家连接UI
        if multiplayer.get_unique_id() == data.peer_id:
            game_ui.connect_player(player)

        # 服务器监听玩家死亡
        if is_multiplayer_authority():
            player.died.connect(_on_player_died.bind(data.peer_id))

        player_dictionary[data.peer_id] = player
        return player

    # 发送准备信号
    peer_ready.rpc_id(1, MultiplayerConfig.display_name)
```

> **设计说明**：
> - `spawn_function` 定义如何创建玩家，data 由 `multiplayer_spawner.spawn()` 传入
> - `get_unique_id()` 获取本地 peer ID，用于判断是否本地玩家
> - 服务器端订阅 `died` 信号来追踪玩家死亡

### 玩家加入 RPC

```gdscript
@rpc("any_peer", "call_local", "reliable")
func peer_ready(display_name: String):
    var sender_id = multiplayer.get_remote_sender_id()
    player_name_dictionary[sender_id] = display_name

    # 生成玩家实体
    multiplayer_spawner.spawn({
        "peer_id": sender_id,
        "display_name": player_name_dictionary[sender_id],
        "is_respawning": false
    })

    # 同步敌人状态
    enemy_manager.synchronize(sender_id)
```

> **设计说明**：新玩家加入时，调用 `spawn()` 触发 `spawn_function` 创建玩家实例。同时同步当前回合状态给该玩家。

## 断线处理

### 客户端断线

```gdscript
multiplayer.server_disconnected.connect(_on_server_disconnected)

func _on_server_disconnected():
    end_game()
```

> **设计说明**：服务器断开时，客户端直接返回主菜单。

### 玩家断线

```gdscript
multiplayer.peer_disconnected.connect(_on_peer_disconnected)

func _on_peer_disconnected(peer_id: int):
    if player_dictionary.has(peer_id):
        var player := player_dictionary[peer_id]
        if is_instance_valid(player):
            player.kill()
        player_dictionary.erase(peer_id)
```

> **设计说明**：服务器检测到某玩家断开，销毁其玩家实体并从字典移除。

### 大厅中断线

```gdscript
func _on_peer_disconnected(peer_id: int):
    if is_lobby_closed:
        return

    if ready_peer_ids.has(peer_id):
        ready_peer_ids.erase(peer_id)
        emit_peer_ready_states_changed()
    try_all_peers_ready()
```

> **设计说明**：大厅阶段玩家断开，需要从准备列表移除，并重新检查是否所有玩家都已准备。

## 游戏开始流程

```gdscript
lobby_manager.all_peers_ready.connect(_on_all_peers_ready)

func _on_all_peers_ready():
    lobby_manager.close_lobby()
    enemy_manager.start()
```

> **设计说明**：所有玩家准备完毕后，关闭大厅（禁止新玩家加入），并开始第一回合。

## 设计要点总结

| 功能 | 实现方式 |
|------|----------|
| 连接管理 | ENetMultiplayerPeer |
| 准备状态 | RPC 调用 + 数组追踪 |
| 玩家生成 | MultiplayerSpawner |
| 断线处理 | peer_disconnected 信号 |

## 相关文档

- [网络架构概述](/tutorial/mutiplayer_tutorial/network-architecture-overview)
- [场景管理与玩家生命周期](/tutorial/mutiplayer_tutorial/scene-management-and-player-lifecycle)
