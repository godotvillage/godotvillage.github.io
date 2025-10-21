---
title: 实现一个2D画图软件
author: 
  - Moshangzhu
  - 上杉炎
date: 2025-10-20
category:
  - 教程
tag:
  - 案例
---

## 教程简介
本教程将通过实现一个画图软件，演示画图、选色、图层等核心功能。

完成该教程后，你将会对鼠标事件、Image、ImageTexture、自动加载等相关知识点有一定了解。

<!-- more -->

### 获取项目代码
完整代码托管在[GitHub仓库](https://github.com/godotvillage/painter-example)，每个分支对应不同章节（如`chapter-1`表示第一章）。

### 环境
教程使用`Godot 4.5`版本。

## 教程章节
### 第一章 添加主面板布局
::: info
Git项目分支：`chapter-1`，可以直接切换到该分支查看当前章节代码
:::
在这一章节中，我们将一起实现项目创建和主场景布局的搭建。

#### 新建项目
- 打开`Godot`软件，点击左上角`创建`按钮
- 选择一个存放游戏目录的路径，并为你的游戏起一个名字
- 点击`创建`按钮
- 此时会看到一个仅包含`icon.svg`文件的空项目

#### 新建主场景并添加布局
- 创建一个名为`scenes`的目录，在其中新建一个`Control`类型的场景，命名为`main`
- 接下来在`main`场景中添加以下节点。节点较多，可以慢慢来，不用着急
  ```
  Main (Control)
  ├── MarginContainer (MarginContainer)
  │   └── MainLayout (VBoxContainer)
  │       ├── Navbar (HBoxContainer)
  │       │   ├── Toolbar (HBoxContainer)
  │       │   │   ├── Pen (Button) - "画笔"
  │       │   │   └── Eraser (Button) - "橡皮"
  │       │   └── Colorbar (HBoxContainer)
  │       │       ├── FrontColorContainer (VBoxContainer)
  │       │       │   ├── FrontColor (ColorRect)
  │       │       │   └── Label (Label) - "前景色"
  │       │       └── BackColorContainer (VBoxContainer)
  │       │           ├── BackColor (ColorRect)
  │       │           └── Label (Label) - "背景色"
  │       ├── PaintBoard (Control)
  │       │   └── VBoxContainer (VBoxContainer)
  │       │       ├── HBoxContainer (HBoxContainer)
  │       │       │   ├── PaintLayers (Control)
  │       │       │   │   └── PaintLayer (TextureRect)
  │       │       │   └── VScrollBar (VScrollBar)
  │       │       └── HScrollBar (HScrollBar)
  │       ├── BottomPanel (HBoxContainer)
  │       └── Footbar (HBoxContainer)
  ```
- 完成节点添加后，让我们了解一下这些节点的作用
  - `MainLayout`：主场景的布局容器，软件的所有内容都在这个节点内
  - `Navbar`：画布上方的导航栏（后续可能会添加菜单栏）
    - `Toolbar`：工具栏，目前包含两个工具：画笔和橡皮
    - `Colorbar`：颜色栏，用于设置前景色和背景色
  - `PaintBoard`：画板区域，为了支持缩放功能，这里添加了两个滚动条
    - `PaintLayers`：图层容器，包含所有图层，缩放和拖动等操作都基于这个节点
      - `PaintLayer`：画板图层，使用`TextureRect`实现，是核心节点之一，后续很多功能都会围绕它展开
  - `BottomPanel`：底部面板，未来可以放置图层管理等功能
  - `Footbar`：底部状态栏，用于显示当前状态信息
- 接下来还需要调整一些节点属性
  - `MarginContainer/MainLayout/PaintBoard/VBoxContainer/HBoxContainer` 节点需要添加**垂直扩展**
  - `MarginContainer/MainLayout/PaintBoard/VBoxContainer/HBoxContainer/PaintLayers` 节点需要添加**垂直扩展**
  - `MarginContainer/MainLayout/PaintBoard/VBoxContainer/HBoxContainer/PaintLayers/PaintLayer` 需要添加尺寸（非最小尺寸）

完成以上步骤后，运行游戏并将`main`场景设置为主场景，就可以看到以下界面：
![](/assets/images/tutorial/example/painter/main_layout.png)


### 第二章 添加绘图代码
::: info
Git项目分支：`chapter-2`，可以直接切换到该分支查看当前章节代码
:::
接下来为`PaintLayer`节点添加脚本。创建一个名为`paint_layer.gd`的脚本，并填入以下代码：
``` gdscript
class_name PaintLayer
extends TextureRect

# 图层的图像数据
var image : Image = null

# 当前图层是否激活（可绘制）
var is_active: bool = true

# 画笔半径
var brush_r = 5
# 画笔颜色
var brush_color : Color = Color(0,0,0, 1)

# 是否正在绘制中
var drawing: bool = false

func _ready() -> void:
	# 创建一个空白图像，大小与TextureRect相同
	image = Image.create_empty(int(size.x), int(size.y), false, Image.FORMAT_RGBA8)
	# 用白色填充图像
	image.fill(Color(1,1,1,1))
	# 将图像转换为纹理并赋值给TextureRect
	texture = ImageTexture.create_from_image(image)

func _gui_input(event: InputEvent) -> void:
	# 如果图层未激活，不处理输入
	if not is_active:
		return
	# 处理鼠标按钮事件
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			# 左键按下时开始绘制，松开时停止绘制
			drawing = event.pressed
			if drawing:
				# 按下时在鼠标位置绘制一个圆
				paint_circle(get_local_mouse_position(), brush_r, brush_color)
	# 处理鼠标移动事件
	if event is InputEventMouseMotion and drawing:
		# 如果正在绘制，随着鼠标移动持续绘制圆形
		paint_circle(get_local_mouse_position(), brush_r, brush_color)

func paint_circle(layer_pos: Vector2i, r: float, color: Color):
	# 半径小于等于0时不绘制
	if r <= 0:
		return

	# 遍历圆形范围内的所有像素点
	for x in range(max(0, int(layer_pos.x - r)), min(image.get_width() - 1, int(layer_pos.x + r)) + 1):
		for y in range(max(0, int(layer_pos.y - r)), min(image.get_height() - 1, int(layer_pos.y + r)) + 1):
			# 判断当前像素是否在圆形范围内（使用距离平方判断）
			if Vector2(x, y).distance_squared_to(layer_pos) < pow(r, 2):
				# 将该像素设置为指定颜色
				image.set_pixelv(Vector2i(x, y), color)

	# 更新纹理以显示新绘制的内容
	texture.update(image)

```
这段代码实现了基础的绘图功能：
- 在`_ready`函数中创建空白画布（`Image`对象）并填充为白色
- 通过`_gui_input`函数监听鼠标事件：
  - 左键按下时开始绘制
  - 按住左键拖动时持续绘制
  - 松开左键时停止绘制
- `paint_circle`函数负责绘制圆形画笔：遍历圆形范围内的像素点，根据距离判断是否在圆内
- 每次绘制后更新纹理，使修改立即显示在画布上

现在运行游戏，就可以在画布上自由绘制了！试着按住鼠标左键并拖动，会看到黑色的画笔痕迹。

![](/assets/images/tutorial/example/painter/drawing.png)

### 第三章 优化绘图代码
::: info
Git项目分支：`chapter-3`，可以直接切换到该分支查看当前章节代码
:::
在上一章中实现了基础绘制功能，不过可能会注意到一个小问题：当快速移动鼠标时，画笔轨迹会出现断续的情况。这是因为鼠标事件的触发频率有限，快速移动时事件之间的间隔较大。

解决方法很简单：记录每次绘制时的鼠标位置，在下一次绘制时，从上一个位置到当前位置之间画一条连续的线。具体实现就是在两点之间补充若干个圆形，让它们连接起来。

让我们更新一下代码：
``` gdscript
class_name PaintLayer
extends TextureRect

# 图层的图像数据
var image : Image = null

# 当前图层是否激活（可绘制）
var is_active: bool = true

# 画笔半径
var brush_r = 5
# 画笔颜色
var brush_color : Color = Color(0,0,0, 0.1)

# 是否正在绘制中
var drawing: bool = false

# 存储上一个鼠标位置，用于绘制连续线条
var last_mouse_pos: Vector2i = Vector2i.ZERO

func _ready() -> void:
	# 创建一个空白图像，大小与TextureRect相同
	image = Image.create_empty(int(size.x), int(size.y), false, Image.FORMAT_RGBA8)
	# 用白色填充图像
	image.fill(Color(1,1,1,1))
	# 将图像转换为纹理并赋值给TextureRect
	texture = ImageTexture.create_from_image(image)

func _gui_input(event: InputEvent) -> void:
	# 如果图层未激活，不处理输入
	if not is_active:
		return
	# 处理鼠标按钮事件
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			# 左键按下时开始绘制，松开时停止绘制
			drawing = event.pressed
			if drawing:
				# 按下时在鼠标位置绘制一个圆，并记录位置
				var current_pos = get_local_mouse_position()
				last_mouse_pos = Vector2i(current_pos.x, current_pos.y)
				paint_circle(last_mouse_pos, brush_r, brush_color)
			else:
				# 松开鼠标时重置上一个位置
				last_mouse_pos = Vector2i.ZERO
	# 处理鼠标移动事件
	if event is InputEventMouseMotion and drawing:
		var current_pos = get_local_mouse_position()
		var current_pos_i = Vector2i(current_pos.x, current_pos.y)

		# 如果这是第一次移动，直接绘制
		if last_mouse_pos == Vector2i.ZERO:
			paint_circle(current_pos_i, brush_r, brush_color)
		else:
			# 在两个位置之间绘制连续的线条，避免出现断点
			draw_line_between(last_mouse_pos, current_pos_i, brush_r, brush_color)

		# 更新上一个鼠标位置
		last_mouse_pos = current_pos_i

func paint_circle(layer_pos: Vector2i, r: float, color: Color):
	# 半径小于等于0时不绘制
	if r <= 0:
		return

	# 遍历圆形范围内的所有像素点
	for x in range(max(0, int(layer_pos.x - r)), min(image.get_width() - 1, int(layer_pos.x + r)) + 1):
		for y in range(max(0, int(layer_pos.y - r)), min(image.get_height() - 1, int(layer_pos.y + r)) + 1):
			# 判断当前像素是否在圆形范围内（使用距离平方判断）
			if Vector2(x, y).distance_squared_to(layer_pos) < pow(r, 2):
				# 将该像素设置为指定颜色
				image.set_pixelv(Vector2i(x, y), color)

	# 更新纹理以显示新绘制的内容
	texture.update(image)

# 在两个点之间绘制连续的线条，防止快速移动鼠标时出现断续的笔画
func draw_line_between(from: Vector2, to: Vector2, r: float, color: Color):
	var distance = from.distance_to(to)

	# 如果两点距离很小，直接绘制终点即可
	if distance <= 1:
		paint_circle(to, r, color)
		return

	# 计算需要插值的步数（基于距离和画笔半径，确保圆形之间有重叠）
	var steps = max(2, int(distance / (r * 0.5)))

	# 在起点和终点之间进行线性插值，绘制一系列圆形形成连续线条
	for i in range(steps + 1):
		var t = float(i) / steps
		var interpolated_pos = from.lerp(to, t)
		paint_circle(Vector2i(interpolated_pos.x, interpolated_pos.y), r, color)

```

这次更新主要包含以下改进：
- 新增 `last_mouse_pos` 变量，用于记录上一次的鼠标位置
- 鼠标按下时记录位置，松开时重置，便于下次绘制
- 鼠标移动时，会从上一个位置到当前位置绘制连续线条，而不只是单点
- 新增 `draw_line_between` 函数：
  - 计算两点间距离
  - 根据距离和画笔半径智能确定插值步数
  - 使用线性插值（`lerp`）在两点间补充若干圆形
  - 通过适当的步数（基于 `r * 0.5`）确保圆形重叠，形成流畅线条
- 同时将画笔颜色透明度调整为 `0.1`，呈现更自然的半透明效果

经过这些优化，即使快速移动鼠标，画笔轨迹也能保持流畅连贯，再也不会出现断点啦！

![](/assets/images/tutorial/example/painter/drawing-better.png)

### 第四章 画笔颜色和全局配置
未完待续