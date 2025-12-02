---
title: 在Godot中使用组件
sticky: false
star: false
category:
  - 教程
tag:
  - 设计模式
date: 2025-10-13
---

:::details 教程使用环境
- Godot v4.5.stable 
- Windows 10 (build 19045)
:::

## 继承模式 vs 组件模式

在游戏开发中，有两种主要的架构模式：**继承模式**和**组件模式**。

<!-- more -->

### Godot的继承模式

```gdscript
# 基础角色类
class Character extends Node2D:
    # 实现基础的逻辑，例如攻击受击、属性管理。
    pass

# 玩家类，继承自角色
class Player extends Character:
    # 实现玩家逻辑，在角色的基础上额外可受到玩家的操控。
    pass

# 敌人类，继承自角色
class Enemy extends Character:
    # 实现敌人逻辑，玩家不可操控。会对玩家做出攻击。
    pass

# 地面敌人类，继承自敌人
class GroundEnemy extends Enemy:
    # 敌人的子类，会在地面接近玩家，做出攻击。
    pass

# 飞行敌人类，继承自敌人
class FlyingEnemy extends Enemy:
    # 敌人的子类，会在空中接近玩家，做出攻击。
    pass

```

Godot的继承模式特点：
- Godot采用节点继承的方式构建游戏对象
- 每个节点都有特定的功能，如Area2D专门处理物理碰撞检测
- 通过继承和组合节点来构建复杂的游戏对象

::: info 思考
如果此时希望设计一种敌人，既可以飞天，也可以落地，应该继承自哪个类？
```gdscript
class FlyingAndGroundEnemy extends ?
```
我们会发现，继承自哪个类都不合适，如果继承自`Enemy`，则地面和空中的逻辑需要再实现一次。而无论是继承自`GroundEnemy`还是`FlyingEnemy`，另一种移动方式也需要实现。为了减少需要实现的代码逻辑。我们可以尝试使用组件来解决这个问题。
:::

### 组件模式架构

#### 各种组件类
```gdscript
class InputComponent extends Node:
    # 操控组件，处理输入逻辑
    pass

class AttackComponent extends Node:
    # 攻击组件，处理攻击逻辑
    pass

class HitComponent extends Node:
    # 受击组件，处理受击逻辑
    pass

class AttributeComponent extends Node:
    # 属性组件，管理角色属性
    pass

class FlyComponent extends Node:
    # 飞行组件，处理飞行逻辑
    pass

class GroundMoveComponent extends Node:
    # 地面运动组件，处理地面移动逻辑
    pass
```


#### 具体实体的组件组合

```gdscript
# 玩家实体，包含玩家所需的组件
class Player extends Node2D:
    var input_component: InputComponent
    var attack_component: AttackComponent
    var hit_component: HitComponent
    var attribute_component: AttributeComponent
    

# 地面敌人实体，包含地面敌人所需的组件
class GroundEnemy extends Node2D:
    var attack_component: AttackComponent
    var hit_component: HitComponent
    var attribute_component: AttributeComponent
    var ground_move_component: GroundMoveComponent
    

# 飞行敌人实体，包含飞行敌人所需的组件
class FlyingEnemy extends Node2D:
    var attack_component: AttackComponent
    var hit_component: HitComponent
    var attribute_component: AttributeComponent
    var fly_component: FlyComponent

    
```

其他引擎的组件模式（如Unity）：
- 游戏对象是一个通用的容器
- 功能通过添加不同的组件来实现
- 组件之间相互独立，易于复用和组合

::: info 思考
有了组件模式，我们就可以根据实体的功能任意组合需要的组件。
例如既可以飞行也可以落地的敌人，我们可以这样实现。
```gdscript
class FlyingAndGroundEnemy extends Node2D:
    var attack_component: AttackComponent
    var hit_component: HitComponent
    var attribute_component: AttributeComponent
    var ground_move_component: GroundMoveComponent
    var fly_component: FlyComponent
```
如果此时我还想有一个无法移动，也无法受伤，但却会对玩家造成伤害的敌人（可能看起来是个陷阱），我们很快就可以组装起一个需要的实体：
```gdscript
class TrapEnemy extends Node2D:
    var attack_component: AttackComponent
    var attribute_component: AttributeComponent
```
:::

## 案例学习
以上代码中已经讲解了组件模式的开发思路，也展示了部分代码。接下来则会使用一个案例来说明在项目中，如何使用组件模式。

### 操控组件
首先按照常见的方式来创建一个游戏项目。
#### 非组件模式
创建了一个玩家(`player_extends.tscn`)场景，并为玩家添加了根据鼠标输入移动。则可以有以下代码：
```gdscript
# player_extends.gd
extends CharacterBody2D

const SPEED = 300.0

func _physics_process(_delta: float) -> void:
	var direction := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	velocity = direction * SPEED
	move_and_slide()
```
玩家可以根据鼠标的输入（上下左右方向键）移动。

如果将以上代码改为组件式应该如何编写代码呢？

#### 组件模式
首先我们应先创建一个`input_component`作为接收输入和控制移动的脚本，并带有一个direction变量供玩家场景读取。组件可以是脚本，也可以是场景。为了方便演示，此处新建一个脚本。
```gdscript
# input_component.gd
class_name InputComponent
extends Node

var direction: Vector2 = Vector2.ZERO

func _physics_process(_delta: float) -> void:
	direction = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

```
然后新建一个玩家场景(`player_use_component.tscn`)，在其中添加必要元素后，新增加一个`InputComponent`节点，然后编写玩家场景脚本(`player_use_component.gd`)。代码如下：
```gdscript
extends CharacterBody2D
# 引用输入组件
@onready var input_component: InputComponent = $InputComponent

const SPEED = 300.0

func _physics_process(_delta: float) -> void:
	# 获取输入组件中的方向
	velocity = input_component.direction * SPEED
	move_and_slide()
```
目前场景节点树如下：
![](/assets/images/tutorial/component/input_component_node_tree.png)

至此我们完成了对普通的处理输入到使用组件处理输入的转变。可能这看起来有些麻烦，因为我们并没有从案例中看到任何好处。那么我们可以继续学习一个案例，来体会组件式的结构带来的封装的便利。

### 再来一个案例
暂时没想好做啥，先空着