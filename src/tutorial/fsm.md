---
title: Godot有限状态机
description: 三种Godot中实现的状态机
sticky: false
star: false
cover: https://images.unsplash.com/photo-1585829365343-ea8ed0b1cb5b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740
category:
  - 教程
---

## 简介
-  有限状态机（Finite State Machine，简称FSM）是一种计算模型，它由一组状态以及在这些状态之间的转移组成。这个模型可以用于描述系统的行为，其中系统在任何给定时间点都处于某个特定的状态，并且可以根据输入或触发条件从一个状态转移到另一个状态。
## 使用**脚本**构建有限状态机
- 来源: [timothyqiu](https://space.bilibili.com/7092): https://www.bilibili.com/video/BV1yM4y1j79P
### 代码
```gdscript
class_name StateMachine
extends Node

var currenrt_state: int = -1:
	set(v):
		owner.transition_state(currenrt_state, v)
		currenrt_state = v
		state_time = 0

var state_time: float

func _ready() -> void:
	await owner.ready
	currenrt_state = 0

func _physics_process(delta: float) -> void:
	while true:
		var next := owner.get_next_state(currenrt_state) as int
		if currenrt_state == next:
			break
		currenrt_state = next
		
	owner.tick_physics(currenrt_state, delta)
	state_time += delta
	
```
### 说明
- 父节点中需要添加状态机节点。
- 父级节点需要实现三个函数和一个枚举类型
	- `func transition_state(from: State, to: State) -> void:`
		- 切换状态时执行的逻辑
		- 根据`to`参数播放动画
	- `func get_next_state(state: State) -> State:`
		- 主动切换状态
		- 根据当前状态以及某些条件，返回下一个将要变化的状态，默认应返回当前状态
	- `func tick_physics(state:State, delta: float) -> void:`
		- 每一帧根据状态执行代码
		- 一般用于控制移动
	- `State`枚举
		- 用于定义每一种状态
### 示例
- 场景树
![脚本构建状态机场景树示例](/assets/images/tutorial/fsm/fsm_script_tree.png)
    - 只需要有一个脚本节点，无需其他节点。
- Player节点脚本
```gdscript
extends CharacterBody2D
@onready var animation_player = $AnimationPlayer

enum State {
	Idle,
	Walk,
}
	
var speed = 100
var direction = Vector2.ZERO

func _ready() -> void:
	pass
	
func get_next_state(state: State) -> State:
	match state:
		State.Walk:
			if direction.length() == 0:
				return State.Idle
		State.Idle:
			if direction.length() > 0:
				return State.Walk
	return state
	
func tick_physics(state:State, _delta: float) -> void:
	direction = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	
	match state:
		State.Walk:
			move()
	
func transition_state(from: State, to: State) -> void:
	#print("state from {0}, to {1}".format([from, to]))
	match to:
		State.Walk:
			animation_player.play("walk")
		State.Idle:
			animation_player.play("idle")
	
func move():
	velocity = direction * speed
	move_and_slide()
```
### 优缺点
- 状态机代码都在父节点脚本中，代码逻辑耦合严重。
- 父节点的三个函数需要对每一种状态分别处理，代码会比较复杂。
## 使用**节点**构建有限状态机
- 来源: [ImRains](https://space.bilibili.com/66079515) : https://www.bilibili.com/video/BV1de411i7Lh/
### 代码
- StateMachine.gd
```gdscript
extends Node

class_name StateMachine

@export var current_state: StateBase

func _ready() -> void:
	for child in get_children():
		if child is StateBase:
			child.state_machine = self
	await get_parent().ready
	current_state.enter()

func _process(delta: float) -> void:
	current_state.process_update(delta)

func _physics_process(delta: float) -> void:
	current_state.physical_process_update(delta)

## 修改状态
func change_state(target_state_name: String) -> void:
	var target_state = get_node(target_state_name)
	if target_state == null:
		printerr("状态传入错误")
		return
	current_state.exit()
	current_state = target_state
	current_state.enter()

```
- StateBase.gd
```gdscript
extends Node

## 基础状态
class_name StateBase

var state_machine: StateMachine

## 进入状态
func enter() -> void:
	pass

## 退出状态
func exit() -> void:
	pass

## 渲染帧触发
func process_update(delta: float) -> void:
	pass

## 物理帧触发
func physical_process_update(delta: float) -> void:
	pass
	
```
### 说明
- 为需要添加状态机的节点添加StateMachine状态机节点，并在状态机节点下创建若干StateBase节点。
- 为每一个StateBase节点修改名称并**扩展脚本**。
- 在扩展脚本中覆写`enter`、`exit`、`process_update`、`physical_process_update`等函数。
	- `func enter() -> void:`
		- 进入这个状态时需要执行的代码，可以用于播放动画，设置属性等。
	- `func exit() -> void:`
		- 退出这个状态时调用的代码，可以用于释放数据等操作。
	- `func process_update(delta: float) -> void:`
		- 当前状态的每一个渲染帧执行的逻辑。
	- `func physical_process_update(delta: float) -> void:`
		- 当前状态的每一个物理帧执行的逻辑。
		- 可以用于移动。
	- 在覆写的时候可以先调用父类super的同名方法。（虽然父类StateBase里面什么都没有）
- 在需要切换状态的地方使用以下代码切换状态
	```gdscript
	state_machine.change_state("需要切换的状态名称")
	```
### 示例
- 场景树
![节点构建状态机场景树示例](/assets/images/tutorial/fsm/fsm_node_tree.png)
    - 需要有一个状态机节点和若干子状态节点。
- Player节点脚本
```gdscript
extends CharacterBody2D
@onready var animation_player = $AnimationPlayer

var direction = Vector2.ZERO

func _ready() -> void:
	pass

func _physics_process(delta: float) -> void:
	direction = Input.get_vector("move_left", "move_right", "move_up", "move_down")
```
- Idle节点扩展脚本
```gdscript
extends StateBase

@onready var animation_player: AnimationPlayer = $"../../AnimationPlayer"
@export var player: CharacterBody2D = null

func enter():
	super.enter()
	animation_player.play("idle_down")

func physical_process_update(delta: float):
	super.physical_process_update(delta)
	if player.direction.length() != 0:
		state_machine.change_state("Walk")
```
- Walk节点扩展脚本
```gdscript
extends StateBase
@onready var animation_player: AnimationPlayer = $"../../AnimationPlayer"
@export var player: CharacterBody2D = null

var speed = 100

func enter():
	super.enter()
	animation_player.play("walk")
	
func physical_process_update(delta: float):
	super.physical_process_update(delta)
	if player.direction.length() == 0:
		state_machine.change_state("Idle")
	move()
	
func move():
	player.velocity = player.direction * speed
	player.move_and_slide()
```
### 优缺点
- 将代码拆分到若干个节点的代码片段中。代码量增加，但逻辑更清晰。
- 由于状态节点经常需要使用父节点的属性，而这些属性只在父节点中声明使用，会导致代码的可读性降低。

## 使用**函数**构建有限状态机
### 代码
``` gdscript
class_name CallableStateMachine

# 保存状态函数的字典
var state_dictionary = {}
# 当前状态的名称
var current_state: String

# 添加状态，需要传入每帧运行、进入状态、离开状态
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

# 设置初始状态
func set_initial_state(state_callable: Callable):
	var state_name = state_callable.get_method()
	if state_dictionary.has(state_name):
		_set_state(state_name)
	else:
		push_warning("No state with name " + state_name)

# 状态机每帧调用当前状态的normal函数
func update(delta: float):
	if current_state != null:
		(state_dictionary[current_state].normal as Callable).call(delta)

# 切换状态，需要传入要切换的状态的normal函数
func change_state(state_callable: Callable):
	var state_name = state_callable.get_method()
	if state_dictionary.has(state_name):
		_set_state.call_deferred(state_name)
	else:
		push_warning("No state with name " + state_name)

# 内置设置状态函数
func _set_state(state_name: String):
	if current_state:
		var leave_callable = state_dictionary[current_state].leave as Callable
		if !leave_callable.is_null():
			leave_callable.call()

	current_state = state_name
	var enter_callable = state_dictionary[current_state].enter as Callable
	if !enter_callable.is_null():
		enter_callable.call()
```
### 说明
- 这种状态机需要在玩家或敌人的脚本中声明一个函数式状态机，并手动调用`add_states`添加若干个状态。以及需要调用`set_initial_state`手动指定初始状态。
- 每个状态需要传递三个函数。分别是每帧运行的函数（normal）、进入状态运行的函数（enter）以及离开状态运行的函数（leave）。
- 切换状态时，需要调用状态机的`change_state`函数并传递要切换的状态的normal函数。
  

### 示例
- 场景树中无需任何新节点，只需要在玩家脚本中编写响应的代码。
- 玩家场景脚本
```gdscript
var state_machine: CallableStateMachine = CallableStateMachine.new()

# 当前状态
var current_state: String:
	get:
		return state_machine.current_state
	set(value):
		state_machine.change_state(Callable.create(self, value))


func _notification(what: int) -> void:
	if what == NOTIFICATION_SCENE_INSTANTIATED:
		state_machine.add_states(state_idle, enter_state_idle, Callable())
		state_machine.add_states(state_walk, enter_state_walk, leave_state_walk)

func _ready():
	state_machine.set_initial_state(state_idle)

func _process(_delta: float) -> void:
	state_machine.update()

# 状态相关方法
func state_idle(_delta: float):
	# 每帧执行的idle状态代码
	# 切换状态
	var need_move = true
	if need_move
		state_machine.change_state(state_walk)
	pass

func enter_state_idle():
	# 进入idle状态执行的代码
	pass

func state_walk(_delta: float):
	# 每帧执行的walk状态代码
	# 切换状态
	var need_idle = true
	if need_idle
		state_machine.change_state(state_idle)
	pass

func enter_state_walk():
	# 进入walk状态执行的代码
	pass

func leave_state_walk():
	# 离开walk状态执行的代码
	pass

```
### 优缺点
- 将代码放在同一个文件中，可能会导致逻辑混乱，但由于声明状态时状态是若干个函数，而非各种枚举值，少去了很多match判断。
- 优点是由于都在需要控制的节点的脚本中，所以可以直接调用和操作节点中的变量，类似方向和速度等。免去了节点式构建的状态机需要通过传参才能获取属性的不方便。
- 由于每个状态都拆分成了三个函数，也让部分可以抽象成函数的逻辑继续复用，提高了代码的可读性。
