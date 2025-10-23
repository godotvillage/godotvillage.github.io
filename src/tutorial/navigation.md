---
title: 导航系统以及A星算法
sticky: false
star: false
author: 玄溟
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
