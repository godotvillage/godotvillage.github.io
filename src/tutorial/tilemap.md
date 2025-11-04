---
title: 瓦片地图详解
author: 
  - Goodman
  - 陌上竹
date: 2025-10-23
category:
  - 教程
tag:
  - 瓦片地图
---

## 简介

图块地图（Tile Map）是Godot中功能强大的2d地图制作节点，由于TileMap在Godot4.5已废弃，且与TileMapLayer使用其实差异不大，故本篇主要讲解 TileMapLayer。本篇为快速教程，指在方便用户快速上手TileMapLayer。

::: info
在Godot 4.3之后的版本添加了`TilemapLayer`替代原有的`Tilemap`节点，使每层瓦片地图都可以使用不同的`tileset`以及物理数据等，解决了之前版本中`Tilemap`在某些复杂场景下的局限性。

在本教程中，如果没有特殊说明，以下知识默认均使用`TilemapLayer`讲解。`Tilemap`与`TilemapLayer`除了API有部分区别外，其余部分均可通用。
:::
## 基本概念
- **瓦片地图（Tilemap）**: 就像是一张巨大的拼图画板，你可以在上面摆放各种瓦片来构建游戏世界。比如制作一个RPG游戏的地图，草地、道路、房屋都摆放在这个画板上。
- **瓦片地图层（TilemapLayer）**: 就像Photoshop中的图层概念，每一层都是独立的画布。比如制作游戏场景时，你可以把地面放在底层，装饰物放在中层，云朵放在顶层，这样方便管理和修改。多个TilemapLayer可以堆叠使用，实现前景、中景、背景的分层效果。
- **瓦片集合（TileSet）**: 相当于你的素材库或工具箱，里面装着所有可以使用的瓦片资源。就像乐高玩具盒，里面有各种形状、颜色的积木供你选择。
- **图集（AtlasSource）**: 一张大图片，上面整齐排列着许多小瓦片素材。就像一本贴纸册，把所有地形素材（草地、石头、水面等）都印在一张大纸上，使用时按坐标裁剪。
- **场景集合（Scene Collection）**: 预先制作好的场景模板集合。比如一棵完整的树（包含树干、树冠、阴影等多个节点），可以直接作为瓦片重复使用。
- **瓦片（Tile）**: TileMap中的最小单位，就像拼图中的一小块。每个瓦片可以是一块草地、一块砖墙，或者一个装饰物。
- **瓦片数据（Tile Data）**: 每个瓦片携带的详细信息，包括它的图片位置、是否有碰撞、能否行走等。就像产品说明书，记录着这块瓦片的所有属性。
![Tilemap相关类关系图](/assets/images/tutorial/tilemap/tilemap_classes.png)

### 代码常用API
#### TilemapLayer
对于TilemapLayer节点，有以下属性及方法可以方便的获取或设置数据。
- 属性
	- tileset: TileSet 
		获得TilemapLayer设置的tileset
- 方法
	- `TileData get_cell_tile_data(coords: Vector2i)`
		用于获取某个坐标瓦片的瓦片数据tile_data，大部分的功能都要围绕这个API展开
	- `void _tile_data_runtime_update(coords: Vector2i, tile_data: TileData)`
		虚函数，重写可在游戏中修改tile的tile_data
	- `bool _use_tile_data_runtime_update(coords: Vector2i)`
		虚函数，重写可用于激活在游戏中修改tile_data
	- `Vector2i get_neighbor_cell(coords: Vector2i, neighbor: CellNeighbor)`
		用于获取某个坐标的瓦片的相邻瓦片，对于某些异形地图处理瓦片遍历很有用
	- `Array[Vector2i] get_used_cells()`
		获取地图中所有瓦片的坐标
	- `Rect2i get_used_rect()`
		获取地图所有包围瓦片的包围矩形
	- `Vector2 map_to_local(map_position: Vector2i)`
		从地图坐标转换为本地坐标，配合local_to_map可以快速的坐标转换操作
	- `Vector2i local_to_map(local_position: Vector2)`
		从本地坐标转换为地图坐标，配合map_to_local可以快速的坐标转换操作
	- `void set_cell(coords: Vector2i, source_id: int = -1, atlas_coords: Vector2i = Vector2i(-1, -1), alternative_tile: int = 0)`
		在对应的坐标设置对应的瓦片，自动生成地图需要大量的使用本API，source_id和atlas_coords应从tile_set中获取
	- `void set_cells_terrain_connect(cells: Array[Vector2i], terrain_set: int, terrain: int, ignore_empty_terrains: bool = true)`
		更新cells中所有的瓦片为terrain_set中的terrain地形。并按照规则连接地形
#### TileSet
对于瓦片集，虽然这个对象很重要，但是在正常使用下，几乎不需要考虑其中的API。维护tileset的工作一般在引擎中进行。
如果你需要自己开发有关Tileset的插件，则需要使用它的函数。请自行在[官方文档-TileSet](https://docs.godotengine.org/zh-cn/4.x/classes/class_tileset.html#class-tileset)中查阅。
- 属性
	- tile_size: Vector2i 用于设置瓦片的大小
- 方法
	如上，不再介绍

#### TileData
瓦片信息中存储着瓦片的数据，默认情况下，某一个tile在tilemapLayer中不管使用多少次，仍使用的是同一个tile_data。如果修改这个tile_data会影响到所有的这个瓦片。如果需要单独修改某个瓦片，应使用`_tile_data_runtime_update`和`_use_tile_data_runtime_update`做特殊处理。

瓦片数据涉及的属性和方法基本都是插件才需要用到的。以下仅展示比较重要的部分。

可以判断瓦片地图是否为空来判断瓦片地图的某个位置是否有瓦片

- 属性
	- material: Material
		材质，可以设置shader等
	- modulate: Color
		叠加的颜色调制
- 方法
	- `Variant get_custom_data(layer_name: String)`
		获取自定义数据
	- `void set_custom_data(layer_name: String, value: Variant)`
		设置自定义数据


## 使用瓦片地图
下面我们将从几方面分别讲解如何使用瓦片地图

### 构建地图
1.创建TileMaplayer节点（可根据需求添加多个TileMapLayer节点）
![步骤一](/assets/images/tutorial/tilemap/add-tilemap-node.png){style=width:50%}
2.创建的一个新的TileSet（在TileMap节点的检查器中），然后选中某一个瓦片地图，即可在下方看到TileSet面板和TileMap面板，其中TileSet面板是用来设置TileSet中的数据的，而TileMap面板则是选取Tile并在场景中绘制的。选中TileSet面板，并在图块源中拖入一个图集图片，会弹出一个弹框询问是否按照TileSet设置的大小自动生成瓦片，可以选择同意。如果不自动生成，可以在设置中点选暗色的瓦片激活。生成的瓦片才可以绘制到Tilemap中。
::: info
鼠标点击可以创建一个瓦片。
按住ctrl并鼠标拖动可以快速创建多个瓦片。
按住shift并鼠标拖动可以快速创建一个更大的瓦片。
:::
![步骤二](/assets/images/tutorial/tilemap/tilesetpanel.png){style=width:50%}
3.选择TileMap面板，然后选中一个瓦片，确保当前是选择工具而非移动工具，然后在页面中开始绘制。默认情况下鼠标左键绘制，右键删除。
![输入图片说明](/assets/images/tutorial/tilemap/tilemap-panel.png){style=width:50%}

### 地形
地形系统就像是给瓦片贴上标签，将具有相同属性的瓦片（比如都是草地、都是水域）归类为同一种地形。设置地形后，当你绘制地图时，这些瓦片会自动连接和匹配，不需要手动一个个调整边缘，大大提高了绘制效率。比如制作一片草地时，只需要选中草地地形工具涂抹，系统就会自动帮你选择合适的草地瓦片并处理好边界过渡。

#### 自动地形设置方法
1.打开TileMapLayer的检查器，在TileSet的地形设置（TerrainSets）添加一个地形集，然后再添加一个地形，注意设置Mode为Match Corners（不同的匹配模式适合不同的纹理集，此处使用匹配角举例），同一个地形集使用的是同一种匹配模式。
![输入图片说明](/assets/images/tutorial/tilemap/terrainset.png){style=width:50%}
2.在TileSet中，选择绘制属性/地形/选择创建好的地形，在素材中进行绘制
::: info
**绘制**面板可以同时设置多个瓦片的属性，**选择**面板只可以设置单个瓦片的属性。
:::
![输入图片说明](/assets/images/tutorial/tilemap/tileset-draw-terrain.png){style=width:50%}
3.回到TileMap面板中，选择地形，然后在场景中使用画笔进行绘制，此时可以发现，图块已经可以链接到一起了。
![输入图片说明](/assets/images/tutorial/tilemap/use-tileset-terrain.png){style=width:50%}

#### 地形原理
地形系统的核心工作原理可以理解为"智能拼图识别"。每个瓦片都携带了一张"身份卡"（地形位掩码），记录着它四周（上下左右及四个角）分别连接着什么类型的地形。

当你在地图上绘制时，系统会实时检查当前瓦片周围的地形情况，就像拼图时会看相邻的拼图片边缘是否匹配一样。比如一个草地瓦片，它的上方是草地、右侧是水域，系统就会自动选择一个"上边是草地、右边是水域"的边界瓦片来放置，保证地形的自然过渡。

**匹配模式**决定了系统如何判断"匹配"：
- **Match Corners（匹配角）**：主要关注四个角的连接情况，适合45度角的纹理或需要精确角点过渡的场景
![匹配角示例](/assets/images/tutorial/tilemap/match_corner_example.png){style=width:50%}

- **Match Sides（匹配边）**：主要关注上下左右四条边的连接，适合简单的矩形瓦片
![匹配角示例](/assets/images/tutorial/tilemap/match_sides_example.png){style=width:50%}

- **Match Corners and Sides（匹配角和边）**：同时考虑角和边，提供最精确的匹配，适合复杂的地形纹理
![匹配边和角示例](/assets/images/tutorial/tilemap/match_corner_and_sides_example.png){style=width:50%}
![匹配边和角](/assets/images/tutorial/tilemap/match_corner_and_sides.png){style=width:50%}

由上面的示例中可以发现，匹配边和角可以展示出最复杂的地形，其缺点就是对美术要求较高。具体使用哪种地形可以根据已有的图集情况选择。

通过这种自动匹配机制，你只需要像涂色一样大面积绘制，系统就能智能地为你选择正确的边界瓦片，避免了手动拼接的繁琐工作。

### 物理
物理系统就像是给瓦片地图添加"无形的墙"和"禁区标识"。在游戏中，玩家不能穿墙而过，角色不能掉出地图边界，这些都需要通过物理碰撞来实现。TileMap的物理系统让你可以直接在瓦片上绘制碰撞形状，比如给墙壁、岩石、地图边界等瓦片设置碰撞体，角色在移动时就会自动被这些"无形的墙"阻挡。这样你就不需要手动创建大量的碰撞体节点，大大简化了场景搭建的工作。

首先需要在tileset中添加一个物理层。并设置物理层和物理遮罩层。需要的话也可以设置物理材质。
![物理层](/assets/images/tutorial/tilemap/tilemap_physics_layer.png)
然后在TileSet面板中切换到绘制面板，选择刚才新建的物理层，在下方添加形状后点击瓦片开始绘制。物理形状可以有多个。尽量不要重叠。
![绘制物理形状](/assets/images/tutorial/tilemap/tilemap_physics_draw.png)

::: warning
物理绘制必须像素对齐。否则可能会导致玩家在场景中移动时卡在某个位置无法移动。
可以点开绘制旁边的**栅格吸附**。选择**半像素吸附**或**栅格吸附**(推荐)，即可获得更加准确的定位。
:::

以下是一个绘制地图边界的示例
![物理示例](/assets/images/tutorial/tilemap/tilemap_physics.png){style=width:50%}
以下是一个绘制不可穿过的地形的示例
![物理示例2](/assets/images/tutorial/tilemap/tilemap_physics2.png){style=width:50%}

在绘制时，还可以为形状设置不同的属性，例如是否单向碰撞等。

### 导航
2D导航可以参照教程[导航系统以及A星算法](/tutorial/navigation)，接下来介绍使用TilemapLayer构建导航区域。
![导航层](/assets/images/tutorial/tilemap/tilemap_physics_draw.png)

创建导航层之后，即可像是物理那样在绘制中绘制导航层形状。
![导航示例](/assets/images/tutorial/tilemap/tilemap_navigation_example.png){style=width:50%}

绘制导航层后，即可像使用NavigationRegion2D那样开始使用2D导航了。

::: warning
需要注意的是，由于Tilemap的导航层不可以烘焙，所以无法使用根据StaticBody来动态的烘焙导航区域。请根据需求自行选择方案。

此处提供另一种方案，即为TilemapLayer添加分组，并使NavigationRegion2D根据分组烘焙导航区域。
![烘焙导航区域](/assets/images/tutorial/tilemap/tilemap_bake_navation_region.png){style=width:50%}

:::

### 光照
光照系统就像是给瓦片地图添加"光影魔法"。在游戏中，墙壁可以阻挡光线形成阴影，营造出真实的明暗效果。TileMap的光照遮挡系统让你可以直接在瓦片上绘制遮挡形状，就像使用LightOccluder2D节点一样，为游戏场景添加丰富的光影效果，增强视觉层次感。

首先需要在TileSet的Rendering（渲染）设置中找到Occlusion Layers（遮挡层），新建一个遮挡层。

然后在TileSet面板中切换到绘制面板，选择刚才新建的遮挡层，在下方添加遮挡形状后点击瓦片开始绘制。遮挡形状定义了哪些区域会阻挡光线，从而产生阴影效果。

绘制完成后，场景中的Light2D节点就会根据这些遮挡形状自动计算阴影，就像使用LightOccluder2D节点一样。你可以为不同的瓦片设置不同的遮挡形状，比如墙壁需要完全遮挡光线，而栅栏可能只需要部分遮挡。

::: info
遮挡层的使用方式与LightOccluder2D完全相同，如果你熟悉LightOccluder2D的使用方法，那么在TileMap中使用遮挡层会非常容易上手。
如果绘制完成后发现没有出现遮挡，需要开启光线节点的`shadow_enable`属性
:::

![光照示例](/assets/images/tutorial/tilemap/tileset-light.png){style=width:50%}

### Y排序
在使用瓦片地图时，往往会出现瓦片大小超出网格的情况，此时需要离相机更近的瓦片盖住离相机更远的瓦片，因为是2D环境下，所以通常会使用瓦片所在的Y坐标作为渲染前后的依据，即：Y坐标更大的瓦片会盖住Y坐标更小的瓦片。

Godot中开启Y坐标排序的方法很简单，只需要在节点上勾选`Ordering`中的`Y Sort Enabled`即可。开启选项之后，会将这个节点的**所有子节点**按照Y坐标大小排序。

我们继续使用案例来讲解，这是一个没有开启Y排序的地图，可以看到，虽然所有图块都在同一层，但是出现了莫名奇妙的重叠现象。

![关闭Y排序示例](/assets/images/tutorial/tilemap/tileset_with_no_ysort.png){style=width:50%}

而打开Y排序后，无需任何其他操作，Y坐标更大的下方的瓦片就会自然的盖住上方的瓦片。
![开启Y排序示例](/assets/images/tutorial/tilemap/tileset_with_ysort.png){style=width:50%}

### 场景合集
瓦片图集通常可以满足大部分的需求，但有时我们会遇到更复杂的场景。
类似希望能将一个Area2D像瓦片那样可以在网格上放置。此时我们就需要场景合集功能。

首先在TileSet面板中点击下方的加号
然后选择场景合集，然后上方即可出现一个场景合集，选中它之后，即可看到一个空的场景合集。

![场景合集](/assets/images/tutorial/tilemap/tilemap_scene_collection.png){style=width:50%}

然后将需要作为场景合集的场景拖入到场景合集中，然后切换到TileMap面板，即可像正常绘制的瓦片那样绘制场景。

![使用场景合集](/assets/images/tutorial/tilemap/tilemap_add_scene.png){style=width:50%}


## 具体案例
### 案例1：防止相机移出地图范围

​基于地图信息的游戏逻辑：利用获取到的地图信息来决定游戏行为。一个典型的应用是**设置相机边界**，防止相机移出地图范围

1.添加TileMapLayer节点和玩家相机节点
2.设置相机边界逻辑

完整代码如下：

```gdscript
# 1. 添加TileMapLayer节点和玩家相机节点
@onready var camera_2d: Camera2D = $player/Camera2D
@export var tile_map: TileMapLayer

# 2. 设置相机边界逻辑
func _ready() -> void:
	# 获取TileMap节点中所有已被放置图块所占据的矩形区域
	# grow(-1)为缩进一格 为避免在相机视口内露出地图边缘
	var used := tile_map.get_used_rect().grow(-1)

	# 获取 TileMap 一个图块的尺寸
	var tile_size := tile_map.tile_set.tile_size

	# 根据TileMap地块尺寸 限制相机的移动
	# 将网格坐标表示的边界转换为像素坐标表示的边界
	# 2d相机的最高/低点
	camera_2d.limit_top = used.position.y * tile_size.y
	camera_2d.limit_bottom = used.end.y * tile_size.y

	# 2d相机的最左/右点
	camera_2d.limit_left = used.position.x * tile_size.x
	camera_2d.limit_right = used.end.x * tile_size.x

	# 重置相机的平滑过渡，防止玩家初始位置在限制区域外时产生镜头抖动
	camera_2d.reset_smoothing()
```
### 案例2：鼠标点击添加图块
通过获取TileMap的瓦片位置坐标来修改地图效果，制作出游戏中实时添加地图图块的效果

1.添加需要修改的TileMapLayer节点引用
2.在func _input()中设置好输入映射（鼠标点击动作），获取鼠标点击位置，再转换为瓦片位置
3.定位要添加的瓦片素材坐标位置（图片ID+图集坐标）
4.使用set_cell函数将瓦片在运行时添加到TileMap中
5.拓展：添加鼠标右击清除图块的效果

完整代码如下：

```gdscript
# 1. 添加TileMapLayer节点引用
@onready var tile_map_layer: TileMapLayer = $TileMapLayer

# 2. TileSet中图片素材的id
var source_id : int = 0 
# TileSet中图片素材的坐标位置
var atlas_coord : Vector2i = Vector2i(0,0)

func _input(event):
	# 当鼠标左键点击，执行以下操作
	if Input.is_action_just_pressed("click"):
		# 获取鼠标点击的全局位置
		var mouse_pos : Vector2 = get_global_mouse_position()
		# 转换鼠标全局为瓦片位置
		var tile_mosuse_pos : Vector2i = tile_map_layer.local_to_map(mouse_pos)
		# 使用set_cell将瓦片添加到TileMap中
		tile_map_layer.set_cell(tile_mosuse_pos , source_id , atlas_coord)
	
	# 拓展：鼠标右击清除图块
	if Input.is_action_just_pressed("right_click"):
		var mouse_pos : Vector2 = get_global_mouse_position()
		var tile_mosuse_pos : Vector2i = tile_map_layer.local_to_map(mouse_pos)
		# 将source_id设置为-1即可清除瓦片
		tile_map_layer.set_cell(tile_mosuse_pos , -1 , atlas_coord)
```
注意
1.为确保类型安全可以在var 声明这个变量的类型
2.tile_mosuse_posw瓦片位置变量类型为Vector2i区别于Vector2，所以需要转化 


### 案例3：动态切换瓦片数据实现隐藏地图效果
接下来我们创建一个游戏，然后创建三层瓦片地图，一层是背景，一层是无法穿过的墙，一层是当达到条件是就会消失的墙。
并添加一个玩家，这里代码比较简单且无关，不再赘述。场景节点如下。Area2D盖住的部分就是会消失的墙。

![使用场景合集](/assets/images/tutorial/tilemap/example3-1.png){style=width:50%}

目前由于物理形状的存在，所以所有的墙都不能穿过。接下来，我们要为MaskLayer添加一个脚本，当Area2D检测到玩家时，就将瓦片的物理关闭，并且透明度变成0.3。展示出内部的山洞并且允许玩家进入。

```gdscript
## mask_layer.gd

extends TileMapLayer

# 记录玩家是否进入
var player_entered: bool = false

func _on_area_2d_body_entered(_body: Node2D) -> void:
	player_entered = true
	notify_runtime_tile_data_update()

func _on_area_2d_body_exited(_body: Node2D) -> void:
	player_entered = false
	notify_runtime_tile_data_update()

# 是否更新瓦片信息
func _use_tile_data_runtime_update(_coords: Vector2i) -> bool:
	# 因为玩家离开后会慢慢恢复不透明，所以所有的瓦片都需要更新
	return true

# 隐藏层的透明度
var layer_alpha = 1.0

# 更新瓦片数据
func _tile_data_runtime_update(_coords: Vector2i, tile_data: TileData) -> void:
	if player_entered:
		tile_data.set_collision_polygons_count(0, 0)

# 根据玩家进入状态修改透明度
func _process(delta: float) -> void:
	if player_entered:
		if layer_alpha > 0.3:
			layer_alpha = move_toward(layer_alpha, 0.3, delta)
			set_modulate(Color(1, 1, 1, layer_alpha))
	else:
		if layer_alpha < 1.0:
			layer_alpha = move_toward(layer_alpha, 1.0, delta)
			set_modulate(Color(1, 1, 1, layer_alpha))

```

<video src="/assets/images/tutorial/tilemap/example3-2.mp4" controls></video>

**代码实现要点：**

这个案例的核心思路是让地图"活起来"——当玩家靠近时，墙壁会变得透明并允许穿过，就像游戏中的"透视墙"或"隐藏通道"效果。实现的关键步骤如下：

1. **玩家检测**：就像在门口安装感应器一样，当玩家进入`Area2D`区域时，系统会收到信号，然后通知所有瓦片"该更新了！"。这里使用`notify_runtime_tile_data_update()`来触发更新。

2. **移除碰撞**：当玩家进入区域后，原本阻挡玩家的墙壁需要"消失"。通过重写`_tile_data_runtime_update()`函数，把瓦片的碰撞形状清空（设置为0），这样玩家就可以自由穿过了。就像原本坚硬的墙壁突然变成了空气。

3. **透明度动画**：为了让效果更自然，使用`move_toward()`让透明度平滑过渡。玩家靠近时，墙壁慢慢变透明（降到0.3），让玩家能隐约看到后面的内容；玩家离开时，墙壁又慢慢恢复不透明，营造出神秘感。

4. **同步更新**：通过让`_use_tile_data_runtime_update()`返回`true`，确保整个图层的所有瓦片都能实时响应状态变化，而不是只有个别瓦片在更新。

这种动态修改瓦片数据的技术非常实用，你可以用它制作探索类的隐藏区域、根据剧情触发的地形变化，或者像传送门那样可穿透的特殊墙壁效果。

示例项目代码下载 [项目文件](/zips/tilemap-example.zip)
 
### 案例4：六边形寻路
未完待续

## 参考视频
[如何使用 TileMap｜Godot 4 教程《勇者传说》#2_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Yz4y1b7hz)
[Godot 4 TileMap 教程（1）设置、图层、动画_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV17t42157si)
