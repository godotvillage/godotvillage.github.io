---
title: Godot开发局域网聊天软件
author:
  - Moshangzhu
date: 2026-03-19
category:
  - 教程
tag:
  - 案例
---

## 教程简介

本教程将通过开发一个局域网聊天软件，演示 Godot 4 的多人网络连接、RPC 通信、大厅系统等核心功能。

完成该教程后，你将会对 `ENetMultiplayerPeer`、RPC 通信模式、自动加载单例等相关知识点有一定了解。

<!-- more -->

### 获取项目代码

::: info
项目代码在文章末尾，请下载后导入 Godot 4.6 使用
:::

### 环境

教程使用 `Godot 4.6` 版本。

## 核心概念

### ENetMultiplayerPeer

Godot 4 提供的 P2P 网络连接模块，支持创建服务器和客户端。

```gdscript
# 创建服务器
var peer := ENetMultiplayerPeer.new()
peer.create_server(port, max_players)

# 创建客户端
var peer := ENetMultiplayerPeer.new()
peer.create_client(server_ip, port)
```

### RPC 通信模式

| RPC 模式 | 说明 |
|---------|------|
| `@rpc("any_peer", "call_local")` | 发送方本地执行，消息转发至服务器 |
| `@rpc("authority", "call_local")` | 服务器权威广播给所有客户端 |
| `@rpc("authority", "call_remote")` | 仅远程客户端执行 |

### 自动加载（单例）

用于管理全局状态，如网络连接、聊天逻辑等。通过 `project.godot` 的 `[autoload]` 配置。

## 项目架构

```
┌─────────────────────────────────────────────────────────┐
│                    Autoload (单例)                      │
├─────────────────────┬─────────────────────────────────┤
│   NetworkManager     │         ChatManager               │
│  - 连接/断开管理     │  - 大厅玩家列表                   │
│  - ENetMultiplayer  │  - RPC 消息广播                   │
└─────────────────────┴─────────────────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────────┬─────────────────────────────────┐
│    MainMenu.tscn    │         Lobby.tscn               │
│  - 创建/加入服务器  │  - 聊天消息显示                   │
│  - 用户名输入       │  - 玩家列表                       │
└─────────────────────┴─────────────────────────────────┘
```

## 实现步骤

### 第一章 创建项目与自动加载

::: info
请先创建 Godot 项目，并创建 `scenes` 和 `scripts` 目录
:::

#### 配置自动加载

在 `project.godot` 中添加自动加载脚本：

```ini
[application]
config/name="局域网聊天"
run/main_scene="res://scenes/MainMenu.tscn"

[autoload]
NetworkManager="*res://scripts/NetworkManager.gd"
ChatManager="*res://scripts/ChatManager.gd"
```

#### NetworkManager - 网络管理

创建 `scripts/NetworkManager.gd`，负责网络连接管理：

```gdscript
extends Node

# 网络配置
const DEFAULT_PORT := 3000
const MAX_PLAYERS := 32

# 连接状态
enum ConnectionState {
	DISCONNECTED,
	HOSTING,
	CONNECTED
}

var current_state: ConnectionState = ConnectionState.DISCONNECTED
var username: String = "Player"

# 信号定义
signal connection_succeeded()
signal connection_failed()
signal server_disconnected()
signal peer_connected(peer_id: int)
signal peer_disconnected(peer_id: int)

func _ready() -> void:
	multiplayer.connected_to_server.connect(_on_connected_to_server)
	multiplayer.connection_failed.connect(_on_connection_failed)
	multiplayer.server_disconnected.connect(_on_server_disconnected)
	multiplayer.peer_disconnected.connect(_on_peer_disconnected)
	multiplayer.peer_connected.connect(_on_peer_connected)

## 创建服务器（主机）
func create_server(port: int, player_name: String) -> bool:
	username = player_name

	var peer := ENetMultiplayerPeer.new()
	var error := peer.create_server(port, MAX_PLAYERS)

	if error != OK:
		push_error("创建服务器失败: %s" % error)
		return false

	multiplayer.multiplayer_peer = peer
	current_state = ConnectionState.HOSTING

	# 主机自己加入大厅
	ChatManager.add_player_to_lobby(1, username)
	ChatManager.send_system_message("%s 创建了聊天室" % username)

	connection_succeeded.emit()
	return true

## 加入服务器（客户端）
func join_server(ip: String, port: int, player_name: String) -> bool:
	username = player_name

	var peer := ENetMultiplayerPeer.new()
	var error := peer.create_client(ip, port)

	if error != OK:
		push_error("连接服务器失败: %s" % error)
		return false

	multiplayer.multiplayer_peer = peer
	return true

## 回调：连接成功
func _on_connected_to_server() -> void:
	current_state = ConnectionState.CONNECTED
	ChatManager.request_join_lobby.rpc_id(1, username)
	connection_succeeded.emit()

## 回调：玩家断开
func _on_peer_disconnected(peer_id: int) -> void:
	if not multiplayer.is_server():
		return
	var player_name := ChatManager.remove_player_from_lobby(peer_id)
	if player_name != "":
		ChatManager.send_system_message("%s 离开了聊天室" % player_name)
```

#### ChatManager - 聊天管理

创建 `scripts/ChatManager.gd`，负责大厅和消息管理：

```gdscript
extends Node

# 大厅玩家数据
var lobby_players: Dictionary = {}

# 信号
signal player_joined(peer_id: int, player_name: String)
signal player_left(peer_id: int, player_name: String)
signal chat_message_received(peer_id: int, player_name: String, message: String)
signal system_message_received(message: String)
signal lobby_updated(players: Dictionary)

## RPC: 请求加入大厅（客户端发送，服务器处理）
@rpc("any_peer", "call_local", "reliable")
func request_join_lobby(player_name: String) -> void:
	if not multiplayer.is_server():
		return

	var sender_id := multiplayer.get_remote_sender_id()

	if not lobby_players.has(sender_id):
		lobby_players[sender_id] = player_name
		player_joined.emit(sender_id, player_name)
		lobby_updated.emit(lobby_players)

		# 通知其他客户端有新玩家加入
		notify_player_joined.rpc_id(sender_id, player_name)
		# 将当前大厅玩家列表同步给新玩家
		sync_lobby_state.rpc_id(sender_id, lobby_players)

## RPC: 通知其他客户端有新玩家加入
@rpc("authority", "call_remote", "reliable")
func notify_player_joined(peer_id: int, player_name: String) -> void:
	if not lobby_players.has(peer_id):
		lobby_players[peer_id] = player_name
		player_joined.emit(peer_id, player_name)
		lobby_updated.emit(lobby_players)
		system_message_received.emit("%s 加入了聊天室" % player_name)

## RPC: 同步大厅状态给新玩家
@rpc("authority", "call_remote", "reliable")
func sync_lobby_state(players: Dictionary) -> void:
	lobby_players = players
	lobby_updated.emit(lobby_players)

## RPC: 客户端发送聊天消息到服务器
@rpc("any_peer", "call_local", "reliable")
func receive_message_from_client(message: String) -> void:
	if not multiplayer.is_server():
		return
	var sender_id := multiplayer.get_remote_sender_id()
	var player_name: String = lobby_players.get(sender_id, "未知")
	broadcast_chat_message.rpc(sender_id, player_name, message)

## RPC: 聊天消息（广播）
@rpc("authority", "call_local", "reliable")
func broadcast_chat_message(peer_id: int, player_name: String, message: String) -> void:
	chat_message_received.emit(peer_id, player_name, message)

## RPC: 系统消息（广播）
@rpc("authority", "call_local", "reliable")
func broadcast_system_message(message: String) -> void:
	system_message_received.emit(message)

## 添加玩家到大厅
func add_player_to_lobby(peer_id: int, player_name: String) -> void:
	lobby_players[peer_id] = player_name
	player_joined.emit(peer_id, player_name)
	lobby_updated.emit(lobby_players)

## 从大厅移除玩家
func remove_player_from_lobby(peer_id: int) -> String:
	var player_name: String = lobby_players.get(peer_id, "")
	if player_name != "":
		lobby_players.erase(peer_id)
		player_left.emit(peer_id, player_name)
		lobby_updated.emit(lobby_players)
	return player_name

## 获取大厅玩家列表
func get_lobby_players() -> Dictionary:
	return lobby_players.duplicate()

## 清空大厅
func clear_lobby() -> void:
	lobby_players.clear()
	lobby_updated.emit(lobby_players)

## 发送聊天消息
func broadcast_message(player_name: String, message: String) -> void:
	receive_message_from_client.rpc(message)

## 发送系统消息
func send_system_message(message: String) -> void:
	broadcast_system_message.rpc(message)
```

### 第二章 主菜单场景

#### MainMenu.tscn 场景结构

创建 `scenes/MainMenu.tscn`：

```
MainMenu (Control)
└── PanelContainer
    └── VBoxContainer
        ├── Title (Label) - "局域网聊天"
        ├── UsernameSection (VBoxContainer)
        │   ├── UsernameLabel (Label) - "用户名"
        │   └── UsernameLineEdit (LineEdit)
        ├── HostSection (VBoxContainer)
        │   ├── HostLabel (Label) - "创建聊天室"
        │   ├── PortLabel (Label) - "端口"
        │   ├── HostPortSpinBox (SpinBox)
        │   └── HostButton (Button) - "创建"
        ├── JoinSection (VBoxContainer)
        │   ├── JoinLabel (Label) - "加入聊天室"
        │   ├── IPLabel (Label) - "服务器IP"
        │   ├── IPLineEdit (LineEdit)
        │   ├── PortLabel2 (Label) - "端口"
        │   ├── JoinPortSpinBox (SpinBox)
        │   └── JoinButton (Button) - "加入"
        └── StatusLabel (Label)
```

#### MainMenu.gd - 主菜单脚本

创建 `scripts/MainMenu.gd`：

```gdscript
extends Control

# 引用节点
@onready var username_line_edit: LineEdit = $PanelContainer/VBoxContainer/UsernameSection/UsernameLineEdit
@onready var host_port_spinbox: SpinBox = $PanelContainer/VBoxContainer/HostSection/HostPortSpinBox
@onready var host_button: Button = $PanelContainer/VBoxContainer/HostSection/HostButton
@onready var ip_line_edit: LineEdit = $PanelContainer/VBoxContainer/JoinSection/IPLineEdit
@onready var join_port_spinbox: SpinBox = $PanelContainer/VBoxContainer/JoinSection/JoinPortSpinBox
@onready var join_button: Button = $PanelContainer/VBoxContainer/JoinSection/JoinButton
@onready var status_label: Label = $PanelContainer/VBoxContainer/StatusLabel

func _ready() -> void:
	host_button.pressed.connect(_on_host_pressed)
	join_button.pressed.connect(_on_join_pressed)
	NetworkManager.connection_succeeded.connect(_on_connection_succeeded)
	NetworkManager.connection_failed.connect(_on_connection_failed)
	username_line_edit.text = "玩家" + str(randi() % 1000)

## 创建服务器
func _on_host_pressed() -> void:
	var username: String = username_line_edit.text.strip_edges()
	if username.is_empty():
		status_label.text = "请输入用户名"
		return

	var port: int = int(host_port_spinbox.value)
	status_label.text = "正在创建服务器..."
	host_button.disabled = true
	join_button.disabled = true

	if NetworkManager.create_server(port, username):
		_load_lobby()
	else:
		status_label.text = "创建服务器失败"
		host_button.disabled = false
		join_button.disabled = false

## 加入服务器
func _on_join_pressed() -> void:
	var username: String = username_line_edit.text.strip_edges()
	if username.is_empty():
		status_label.text = "请输入用户名"
		return

	var ip: String = ip_line_edit.text.strip_edges()
	if ip.is_empty():
		ip = "127.0.0.1"

	var port: int = int(join_port_spinbox.value)
	status_label.text = "正在连接服务器..."
	host_button.disabled = true
	join_button.disabled = true

	NetworkManager.join_server(ip, port, username)

## 连接成功
func _on_connection_succeeded() -> void:
	_load_lobby()

## 连接失败
func _on_connection_failed() -> void:
	status_label.text = "连接服务器失败"
	host_button.disabled = false
	join_button.disabled = false

## 加载大厅场景
func _load_lobby() -> void:
	var tree := get_tree()
	if tree:
		tree.change_scene_to_file("res://scenes/Lobby.tscn")
```

### 第三章 聊天大厅场景

#### Lobby.tscn 场景结构

创建 `scenes/Lobby.tscn`：

```
Lobby (Control)
└── HSplitContainer
    ├── PlayerListPanel (PanelContainer)
    │   └── VBoxContainer
    │       ├── PlayerListTitle (Label) - "在线玩家"
    │       └── PlayerList (ItemList)
    └── ChatPanel (PanelContainer)
        └── VBoxContainer
            ├── ChatHistory (RichTextLabel)
            └── InputContainer (HBoxContainer)
                ├── MessageLineEdit (LineEdit)
                ├── SendButton (Button) - "发送"
                └── DisconnectButton (Button) - "断开"
```

#### Lobby.gd - 大厅脚本

创建 `scripts/Lobby.gd`：

```gdscript
extends Control

# 引用节点
@onready var player_list: ItemList = $HSplitContainer/PlayerListPanel/VBoxContainer/PlayerList
@onready var chat_history: RichTextLabel = $HSplitContainer/ChatPanel/VBoxContainer/ChatHistory
@onready var message_line_edit: LineEdit = $HSplitContainer/ChatPanel/VBoxContainer/InputContainer/MessageLineEdit
@onready var send_button: Button = $HSplitContainer/ChatPanel/VBoxContainer/InputContainer/SendButton
@onready var disconnect_button: Button = $HSplitContainer/ChatPanel/VBoxContainer/InputContainer/DisconnectButton

func _ready() -> void:
	send_button.pressed.connect(_on_send_pressed)
	disconnect_button.pressed.connect(_on_disconnect_pressed)
	message_line_edit.text_submitted.connect(_on_message_submitted)

	ChatManager.player_joined.connect(_on_player_joined)
	ChatManager.player_left.connect(_on_player_left)
	ChatManager.chat_message_received.connect(_on_chat_message_received)
	ChatManager.system_message_received.connect(_on_system_message_received)
	ChatManager.lobby_updated.connect(_on_lobby_updated)
	NetworkManager.server_disconnected.connect(_on_server_disconnected)

	_update_player_list()
	message_line_edit.grab_focus()
	_add_system_message("欢迎来到聊天室！")

## 发送消息
func _on_send_pressed() -> void:
	_send_message()

func _on_message_submitted(message: String) -> void:
	_send_message()

func _send_message() -> void:
	var message: String = message_line_edit.text.strip_edges()
	if message.is_empty():
		return
	NetworkManager.send_chat_message(message)
	message_line_edit.clear()

## 断开连接
func _on_disconnect_pressed() -> void:
	NetworkManager.disconnect_from_server()
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

## 玩家加入回调
func _on_player_joined(peer_id: int, player_name: String) -> void:
	_update_player_list()

## 玩家离开回调
func _on_player_left(peer_id: int, player_name: String) -> void:
	_update_player_list()

## 聊天消息回调
func _on_chat_message_received(peer_id: int, player_name: String, message: String) -> void:
	var display_name := player_name if peer_id != NetworkManager.get_local_peer_id() else "你"
	chat_history.append_text("[%s] %s: %s\n" % [_get_time_string(), display_name, message])
	_scroll_to_bottom()

## 系统消息回调
func _on_system_message_received(message: String) -> void:
	_add_system_message(message)

## 大厅更新回调
func _on_lobby_updated(players: Dictionary) -> void:
	_update_player_list()

## 服务器断开回调
func _on_server_disconnected() -> void:
	_add_system_message("已与服务器断开连接")
	await get_tree().create_timer(1.5).timeout
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

## 更新玩家列表
func _update_player_list() -> void:
	player_list.clear()
	var players: Dictionary = NetworkManager.get_players()

	for peer_id in players.keys():
		var player_name: String = players[peer_id]
		var prefix := "● " if peer_id == NetworkManager.get_local_peer_id() else "  "
		var host_tag := " [主机]" if peer_id == 1 and NetworkManager.is_host() else ""
		player_list.add_item(prefix + player_name + host_tag)

## 添加系统消息
func _add_system_message(message: String) -> void:
	chat_history.append_text("[%s] [系统] %s\n" % [_get_time_string(), message])
	_scroll_to_bottom()

## 滚动到底部
func _scroll_to_bottom() -> void:
	chat_history.scroll_to_line(chat_history.get_line_count() - 1)

## 获取时间字符串
func _get_time_string() -> String:
	var time := Time.get_time_dict_from_system()
	return "%02d:%02d:%02d" % [time.hour, time.minute, time.second]
```

## 遇到的问题

### 问题1：变量类型推断错误

使用 `:=` 自动类型推断时，如果返回值是 `Variant` 类型，变量也会被推断为 `Variant`。

**解决方案**：显式声明类型。

```gdscript
# 错误
var players := NetworkManager.get_players()

# 正确
var players: Dictionary = NetworkManager.get_players()
```

### 问题2：get_tree() 返回 null

在某些时机下 `get_tree()` 可能返回 `null`。

**解决方案**：使用局部变量缓存并检查。

```gdscript
func _load_lobby() -> void:
	var tree := get_tree()
	if tree:
		tree.change_scene_to_file("res://scenes/Lobby.tscn")
```

### 问题3：客户端发送消息服务器收不到

最初使用 `@rpc("authority")` 广播消息，但客户端无法触发权威 RPC。

**解决方案**：采用「客户端请求 → 服务器广播」模式：

```gdscript
# 1. 客户端请求
@rpc("any_peer", "call_local", "reliable")
func receive_message_from_client(message: String) -> void:
	if not multiplayer.is_server():
		return
	# 服务器广播
	broadcast_chat_message.rpc(sender_id, player_name, message)

# 2. 服务器广播
@rpc("authority", "call_local", "reliable")
func broadcast_chat_message(...) -> void:
	chat_message_received.emit(...)
```

## 使用方法

1. **创建聊天室**：输入用户名 → 设置端口 → 点击"创建"
2. **加入聊天室**：输入用户名 → 输入服务器IP（留空默认127.0.0.1）和端口 → 点击"加入"
3. 聊天消息会自动同步给所有在线玩家

## 下载链接

[示例代码下载](/zips/localchat.zip)
