---
title: 导航系统以及A星算法
sticky: false
star: false
author: 
  - 玄溟
  - 阿鱼
category:
  - 教程
tag:
  - 功能教程
date: 2025-10-13
---

:::details 教程使用环境

- Godot v4.5.1-stable
- Windows 10
:::

## Godot导航系统的基本概念和组件

### Godot导航系统基本概念

当你完成了游戏中的角色控制，可以操作像素小人肆意的奔跑在绿色草地上的时候，也许你会想：为什么我要亲自动手？他能不能自己跑起来？那么好，Godot确实为你这个想法提供了支持，他就是导航系统。

让一个像素小人从一个点移动到另一个点，听起来一点也不复杂，甚至你完全可以自己编写代码让你的像素小人一格一格移动到目标点。

实际上导航系统一点也不简单，你需要考虑场景中障碍物位置和可行走区域，确保导航路径生成时能正确避开障碍物，需要考虑计算路径的时间成本，还有动态障碍物、如何便于调试等等问题。

所以Godot帮我们考虑过了这些事情，我们只需要花几分钟学习如何使用，然后就能轻松的让你的像素小人自动移动起来。

#### 名词释义

- **自动寻路**：只给出两个点，让角色自动找到两个点的有效路径

- **烘焙(Bake)**：事先计算好的意思

- **导航代理(NavigationAgent)**：简单理解为“AI的导航员”，帮助角色规划从当前位置到目标点的最优路径，并控制角色沿路径移动，同时避开障碍物

- **导航网格(NavigationMesh)**：定义场景中可行走的区域的“虚拟地图”，由**多边形**组成

- **导航区域(NavigationRegion)**:场景中标记需要生成导航数据的区域，通常包含障碍物和可行走地形

- **A*算法(AStar)**：也叫A星算法，经典寻路算法，通过网格或点连接计算最短路径

- **动态避障(Dynamic Obstacle Avoidance)**：代理在移动中实时避开其他动态物体（如玩家或移动障碍）

- **路径点(PathPoint)**：A*算法中用于连接的可遍历位置，代理通过路径点序列移动

- **代价(Cost)**：路径规划中不同区域的权重（如草地比沼泽更易通行）

### Godot导航系统核心组件
这里列举了Godot官方提供的导航节点，详细的内容和方法可以直接查看官方文档，我们这里只简单讨论一下，侧重示例演示。

注意：下面列出的4个节点在当前版本被标记为实验性，也就是说他有可能在将来的版本改动或者弃用，请考虑清楚后使用。

#### NavigationAgent2D节点
用于寻路至某个位置并且能够躲避障碍物的 2D 代理。

通常情况下，对需要根据导航移动的精灵节点添加上这个节点，就可以实现自动寻路逻辑了
```gdscript
extends CharacterBody2D

@onready var navigation_agent_2d: NavigationAgent2D = $NavigationAgent2D
const SPEED = 300.0

func _physics_process(_delta: float) -> void:
	var dir = get_nav_dir()
	# 没有目的地
	if not dir:
		return
	# 已经到目的地附近
	if navigation_agent_2d.is_navigation_finished():
		velocity = Vector2.ZERO
		move_and_slide()
		return
	velocity = dir * SPEED
	move_and_slide()

# 将点击的位置传入导航代理，并将获取到的下一个移动节点转本地坐标
func get_nav_dir():
	if not clickPosition:
		return
	navigation_agent_2d.target_position = clickPosition
	return to_local(navigation_agent_2d.get_next_path_position()).normalized()
```
如图：
![点击导航](/assets/images/tutorial/navigation/点击导航.gif)

需要注意的是，追击的时候如果单位碰撞范围>target_desired_distance，会导致单位永远到不了目的地,然后抖动
如图：
![碰撞抖动](/assets/images/tutorial/navigation/碰撞抖动.gif)

当正确设置好碰撞范围，则不会出现抖动的情况
如图：
![碰撞停止抖动](/assets/images/tutorial/navigation/碰撞停止抖动.gif)


#### NavigationObstacle2D节点
用于导航的 2D 障碍物，能够影响导航网格的烘焙、约束启用了避障处理的代理的速度。

简单来说就是这个节点可以为当前的障碍物添加一个更大范围的碰撞，代理移动的时候会被这个大一些的碰撞体阻挡住。
如图：
![避障](/assets/images/tutorial/navigation/避障.gif)

#### NavigationRegion2D节点
可达的 2D 地区，NavigationAgent2D 能够将其用于寻路。

- 可以自定义一个导航区域
如图：
![自定义导航区域](/assets/images/tutorial/navigation/自定义导航区域.gif)

- 根据障碍物自动烘焙可导航区域
创建导航区域后，设置source_geometry_mode为Group Expicit，然后复制source_geometry_group_name中的值新建一个分组，将指定障碍物图层设置到这个分组下，就可以进行自动烘焙了
如图：
![自定义烘焙导航区域](/assets/images/tutorial/navigation/自定义烘焙导航区域.gif)

::: info 注意
需要烘焙的那个障碍物图层如果是手动设置的物理层，需要注意多个图块尽可能连接准确，如果出现不同图块物理层连接错位，有可能导致最终烘焙的导航区域出现重合的边发生错误
:::

- TileMapLayer设置TileSet资源的时候也可以新增导航区域，这时只要把图块放到游戏中，指定的图块就自动设置为导航区域了
如图：
![TileMapLayer添加导航图块](/assets/images/tutorial/navigation/TileMapLayer添加导航图块.png)


#### NavigationLink2D节点
暂无说明



## A*算法

本教程主要是介绍Godot中内置的算法类

### A*算法简介

A*算法由Peter Hart、Nils Nilsson和Bertram Raphael于1968年提出，最初用于解决图搜索问题。其设计灵感来源于Dijkstra算法和启发式搜索的结合，通过引入启发式函数（如曼哈顿距离）显著提升了搜索效率。该算法在早期人工智能和机器人导航领域得到验证，后逐渐成为路径规划的经典方法。

在Godot中A*算法主要用于NPC寻路、动态障碍物避让等场景。

他的优势是提供一个启发函数，（比如曼哈顿距离）估算当前节点到目标的“直线距离”，算法总是优先计算“实际已走距离+直线距离”总和最小的节点。简单来说就是不会绕路。这点相比Dijkstra算法全搜索最少提升30%的效率。并且支持自定义代价函数，可以适应不同的地形，例如：高地地形比平原地形难走，可以通过自定义代价函数来实现。
当然，A*算法的局限性也在启发函数上，就像你用现实生活中的导航软件，导航有时候会给你导航到一条看似近的路，实际上路上在封路施工，导致你最终绕更远的路，这或许就是所谓成也萧何败萧何，在使用的时候如果遇到性能下降的情况，可以考虑是否是启发函数的问题，我们这里暂时就不做深入讨论了。

### Godot4内置的A*算法

#### AStar2D
用于在二维空间的连通图中，寻找两个顶点之间的最短路径。

需要手动添加路径点，并且建立点的连接。这个类适用任何类型的图形（四边形，六边形等）。当然，如果你的游戏是六边形网格，也有相应的插件提供导航功能，例如：AStarHexGrid2D，这不在本次教程的讨论范围，感兴趣的可以自行学习。

#### AStarGrid2D
AStarGrid2D 是 AStar2D 的变种，针对疏松 2D 网格进行了优化。因为不需要手动创建点并进行连接，所以用起来更加简单。这个类还支持使用不同的启发方法、斜向移动模式、跳跃模式，从而加速运算。

相对于AStar2D，他是一个矩形网格，限制了网格的点有4个相邻点，可以直接用于矩形网格游戏导航。

只需提供导航区域、单元格大小。其他内容引擎会自行处理。


### 本教程所用工程文件
[Github仓库地址](https://github.com/JessieLR/Godot_Navigation/tree/main)


## 在Godot使用避障提升性能

### 说在前面

本文使用的方法中用到的节点在4.5版本中被标记为实验性，如果您是在更新的版本中看到了该方法，则下文节点有被未来版本删除的可能性，不过godot也许会有相应的替代节点或是别的实现方式。（没有就当笔者没说）

### 为什么要提升性能

因为遇到了性能问题，或是预见了性能问题一定会成为阻拦开发的障碍。如果没有遇到性能问题也没预见自己之后的开发会遭遇何种性能瓶颈的话，笔者推荐暂时不用急着考虑如何将优化做到完美。

### 为什么使用避障

以笔者为例，笔者在开发类幸存者原型的时候因为设计了多种敌人，出于快速实现原型的需求，笔者让这些敌人简单的朝着玩家所在的点加速移动直到最高速度，并且给每个不同强度的敌人使用了不同的加速度与最大速度，同时希望这些（同种）敌人在追逐玩家时不要因为玩家带着敌人绕圈而汇聚成“一坨的敌人”，这样无论是何种攻击方式都基本将攻击到近乎所有的尾随敌人。所以笔者一开始为此给所有的敌人使用了相同大小的圆形碰撞体，旨在让敌人追逐玩家时可以自然的散成“茫茫的敌人”，而攻击方式的数值和范围也可以得到合理的展现。

但是，问题出现的想象的要快，屏幕上超过300个怪物在追逐玩家的时候，因为每种怪物的最大速度不一致导致敌人之间的彼此碰撞明显增多，游戏明显变得卡顿。经由大佬提醒，（2D项目中）可以使用NavigationRegion2D节点+敌人身上附着NavigationAgent2D节点来实现对敌人内部实现避障，从根本上解决过多的碰撞检测带来的性能开销。

### 性能提升效果

测试项目的内容为每帧生成一个会追击鼠标最后点击的位置的小鸡并打印当前小鸡数量。

在一个只有简单结构的小鸡身上，使用4px半径避障时在全图小鸡数量达到2k以上的时候，笔者电脑的调试帧数才出现些许下降。（60帧于小鸡数量2k时下降至30帧左右）

![避障小鸡](/assets/images/tutorial/navigation/避障小鸡.png)

![避障性能](/assets/images/tutorial/navigation/避障性能.png)

而使用4px圆形碰撞体实现效果时，仅在900只小鸡数量的时候，笔者电脑的调试帧数就从60狂跌到10帧。（60帧于小鸡数量900时下降至10帧左右)

![碰撞小鸡](/assets/images/tutorial/navigation/碰撞小鸡.png)

![碰撞性能](/assets/images/tutorial/navigation/碰撞性能.png)

### 如何使用避障（2D项目）

我们需要知道避障的本质是选择一个更合理的不会撞到（敌人的）同伴的路径，所以避障算是寻路/导航的一部份，关于这部分内容则可以查询新手村的另一篇教程“导航系统以及A星算法”。

所以在我们的游戏中，想要实现避障需要解决两个问题：应该在哪里避障（导航）？谁需要避障（导航）？

#### 1、应该在哪里避障（导航）？

在2D界面以下三个节点中我们应最常用到的是NavigationRegion2D。简单来说，该Region的范围便是处于该导航层（navigation_layers）上的需要被导航的对象（NavigationAgent2D）会使用到的范围。

而NavigationObstacle2D和NavigationLink2D，笔者也还不熟悉。~~（老陌帮我想想怎么糊弄过去）~~ ~~（老陌也不会）~~

![应该在哪里避障](/assets/images/tutorial/navigation/应该在哪里避障.png)

一般我们使用NavigationRegion2D划定的方式大多为以下两种

##### 1·直接使用3个及以上的点构成的多边形作为导航多边形

如图，只需要在选择模式(Q)中画出自己想要的形状便可以完成多边形。

![自行划定多边形](/assets/images/tutorial/navigation/自行划定多边形.png)

![画多边形](/assets/images/tutorial/navigation/画多边形.png)

##### 2·使用tileset的Navigation Layers设置完成地图的构建后烘焙成完整多边形

如图，tileset的方式会稍微复杂一些，需要设置好了tileset并完成了tilemap之后点击“烘焙导航多边形”才行，不过好处是tileset里面做完了之后无论是新拓展什么瓦片组合的地形，只需要做好之后重新烘焙便可完成调整。

![tileset导航](/assets/images/tutorial/navigation/tileset导航.png)

![tilemap烘焙多边形](/assets/images/tutorial/navigation/tilemap烘焙多边形.png)

#### 2、谁需要避障（导航）？

一言以蔽之，NavigationAgent2D。在设置好navigation_layers并对需要的属性进行调整之后，只需要在需要使用避障的会移动的节点（以CharacterBody2D举例）上挂载NavigationAgent2D节点，并设置其的target_position，在每个物理帧中使用调用get_next_path_position()得到的向量进行归一化并乘上节点的速度后由NavigationAgent2D的velocity_computed信号来执行move_and_slide()即可。

![谁需要避障](/assets/images/tutorial/navigation/谁需要避障.png)

### 避障做不到的事

说是导航+避障，但其实不在导航内的区域如果是不想让节点去的地方的话，其实并不代表不会被太多数量的对象挤过去，这部分需求应当还是使用NavigationObstacle2D或是碰撞达成。同时就算是使用了避障导航避免碰撞的计算问题，但导航本身大量使用也是有性能开销的，如果需要更加大量的对象进行分散式追逐的话，应该需要寻找别的解决方案。

