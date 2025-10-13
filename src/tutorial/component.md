---
title: 在Godot中使用组件
sticky: false
star: false
category:
  - 教程
---

## 继承模式 vs 组件模式

在游戏开发中，有两种主要的架构模式：**继承模式**和**组件模式**。
 

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

## 实现方式
以上代码中已经讲解了组件模式的开发思路，也展示了部分代码。接下来则会使用一个案例来说明在项目中，如何使用组件模式。

