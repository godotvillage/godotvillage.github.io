---
title: 全局加载与单例模式
author: Goodman
date: 2025-10-23
category:
  - 教程
tag:
  - 瓦片地图
---

## 简介

图块地图（Tile Map）是Godot中功能强大的2d地图制作节点，由于TileMap在Godot4.5已废弃，且与TileMapLayer使用其实差异不大，故本篇主要讲解 TileMapLayer。本篇为快速教程，指在方便用户快速上手TileMapLayer，一个完整的
## 基本概念
 - **Tile** : 相当于颜料，瓦片是TileMap中最小的单位 ，包含图集坐标信息，纹理、碰撞形状、导航网格等属性
 - **TileMap** : 相当于画布，包含绘制工具(例如多种不一样画笔)，将设置好的Tile，根据场景需要进行绘制。
 - **TileSet** : 相当于调色板，对导入素材进行预处理，你可以准备绘制前预制颜料的亮度，颜色，数量(编辑图块的渲染，物理层，动画...)
 - 它们之间的关系如下
![之间的关系](/assets/images/tutorial/tilemap/tilemaplayer.png)

## 使用技巧1：TileMapLayer节点搭建一个场景
1.创建TileMaplayer节点（可根据需求添加多个TileMapLayer节点）
![步骤一](/assets/images/tutorial/tilemap/add-tilemap-node.png)
2.创建的一个新的TileSet（在TileMap节点的检查器中），编辑好你需要的瓦片
![步骤二](/assets/images/tutorial/tilemap/tilesetpanel.png)
3.绘制 使用TileMap编辑工具，使用画笔工具后选择图块来快速构建地图。
![输入图片说明](/assets/images/tutorial/tilemap/tilemap-panel.png)
## 使用技巧2：自动地形设置方法
1.打开TileMapLayer的检查器，在TileSet的地形设置（TerrainSets）添加地形图层，注意设置Mode为Match Corners
![输入图片说明](/assets/images/tutorial/tilemap/terrainset.png)
2.在TileSet中，选择绘制属性/地形/选择创建好的地形，在素材中进行绘制
![输入图片说明](/assets/images/tutorial/tilemap/tileset-draw-terrain.png)
3.回到TileMap中，选择地形进行绘制
![输入图片说明](/assets/images/tutorial/tilemap/use-tileset-terrain.png)




## 在GDscritp访问TileMap
**访问节点与基础信息**​
|代码| 作用 |
|--|--|
|​`@onready var tilemap = $TileMap` | 获取场景中TileMap节点的引用。 |
|`tile_set`|获取该TileMap所使用的TileSet资源|
|`get_cell_source_id(coords)`| 获取指定单元格的瓦片源ID|
|`get_cell_atlas_coords(layer, coords)`|获取指定单元格的瓦片在图集中的坐标。|

**调整和修改**
|代码| 作用 |
|--|--|
|`local_to_map(pos)`|转换为瓦片位置|
|`set_cell(coords, source_id, atlas_coords, alternative_tile)`|在指定位置设置瓦片|
|`serase_cell(coords)`|清除指定位置的瓦片|

## 案例1：防止相机移出地图范围

​基于地图信息的游戏逻辑：利用获取到的地图信息来决定游戏行为。一个典型的应用是**设置相机边界**，防止相机移出地图范围

1.添加TileMapLayer节点和玩家相机节点
```gdscript
	@onready var camera_2d: Camera2D = $player/Camera2D
	@export var tile_map: TileMapLayer
```
2.设置相机边界逻辑
```gdscript
func _ready() -> void:
	#获取TileMap节点中所有已被放置图块所占据的矩形区域
	#grow(-1)为缩进一格 为避免在相机视口内露出地图边缘
	var used := tile_map.get_used_rect().grow(-1)
	#获取 TileMap 一个图块的尺寸
	var tile_size := tile_map.tile_set.tile_size

	#根据TileMap地块尺寸 限制相机的移动
	# 将网格坐标表示的边界转换为像素坐标表示的边界
	#2d相机的最高/低点
	camera_2d.limit_top = used.position.y * tile_size.y
	camera_2d.limit_bottom =used.end.y * tile_size.y
	#2d相机的最左/右点
	camera_2d.limit_left = used.position.x * tile_size.x
	camera_2d.limit_right = used.end.x * tile_size.x

	# 重置相机的平滑过渡，防止玩家初始位置在限制区域外时产生镜头抖动
	camera_2d.reset_smoothing()
```
## 案例2：鼠标点击添加图块
通过获取TileMap的瓦片位置坐标来修改地图效果，制作出游戏中实时添加地图图块的效果

1.还是添加需要修改的TileMapLayer节点
```gdscript
	@onready var tile_map_layer: TileMapLayer = $TileMapLayer
```
2.在func _input()中设置好输入映射（鼠标点击动作），获取鼠标点击位置，再转换为瓦片位置
```gdscript
func _input(event):
	#当鼠标左键点击，执行以下操作
	if Input.is_action_just_pressed("click"):
		#获取鼠标点击的全局位置
		var mouse_pos : Vector2 = get_global_mouse_position()
		#转换鼠标全局为瓦片位置
		var tile_mosuse_pos : Vector2i = tile_map_layer.local_to_map(mouse_pos)
```
3.定位要添加的瓦片素材坐标位置 图片ID+图集坐标
```gdscript
#TileSet中图片素材的id
var source_id : int = 0 
#TileSet中图片素材的坐标位置
var atlas_coord : Vector2i = Vector2i(13,0)
```
4.使用set_cell（鼠标点击位置，素材图片的id,素材瓦片的位置坐标）函数，将瓦片在运行时添加到TileMap中
```gdscript
tile_map_layer.set_cell(tile_mosuse_pos , source_id , atlas_coord)
```
5.拓展：再添加一个鼠标右击清除的图块的效果
```gdscript
tile_map_layer.set_cell(tile_mosuse_pos , -1 , atlas_coord)
```
注意
1.为确保类型安全可以在var 声明这个变量的类型
2.tile_mosuse_posw瓦片位置变量类型为Vector2i区别于Vector2，所以需要转化 





## 参考视频
[如何使用 TileMap｜Godot 4 教程《勇者传说》#2_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Yz4y1b7hz)
[Godot 4 TileMap 教程（1）设置、图层、动画_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV17t42157si)
