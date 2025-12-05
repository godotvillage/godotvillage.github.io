---
title: 文件读写与存档系统
author: Moshangzhu
date: 2025-10-19
category:
  - 教程
tag:
  - 文件
  - 未完成
---

## 简介

想象一下这样的场景：你的玩家在游戏中辛辛苦苦打了三个小时，终于攒够了装备、升到了满级、解锁了所有成就。但当他们关闭游戏再次打开时，却发现一切从头开始——所有的进度都消失了，就像从未玩过一样。

或者你想制作一款剧情丰富的RPG游戏，玩家的每个选择都会影响后续的故事走向。但如果没有存档系统，玩家就必须一口气通关，否则所有的选择和进度都会丢失。

再比如，你想让玩家自定义游戏设置——音量大小、画质选项、按键绑定。如果这些设置无法保存，每次启动游戏都要重新调整，这会让玩家非常抓狂。

那么，如何让这些珍贵的游戏数据在关闭游戏后依然保留呢？

答案是**文件读写与存档系统**。

在现代游戏开发中，存档系统是几乎所有类型游戏的必备功能。无论是RPG的进度保存、动作游戏的检查点、还是简单的设置保存，都离不开文件读写操作。

在Godot中，我们有多种方式来实现文件的读写和数据持久化——**ConfigFile**、**JSON**、**二进制文件**、**资源文件**、**数据库**等。每种方式都有其适用场景。

<!-- more -->

::: info 数据持久化
数据持久化是指将程序运行时产生的数据保存到硬盘等存储介质上，使得数据在程序关闭后仍然存在，下次启动时可以重新加载。

在游戏开发中，常见的需要持久化的数据包括：
- **游戏进度**：玩家的关卡进度、任务完成情况、收集品状态
- **角色数据**：等级、经验值、装备、技能、属性
- **游戏设置**：音量、画质、按键绑定、语言选择
- **统计数据**：游戏时长、击败敌人数、死亡次数、成就解锁

选择合适的存档方式不仅能提升玩家体验，还能防止作弊、保护数据安全。
:::

## Godot中的五种数据持久化方式

### 使用ConfigFile保存配置
待补充

### 使用JSON保存游戏数据

JSON（JavaScript Object Notation）是一种轻量级的数据交换格式，具有良好的可读性和跨平台兼容性。在Godot中，使用JSON保存游戏数据非常方便——通过 `JSON.stringify()` 将数据序列化为字符串写入文件，读取时再用 `JSON.parse_string()` 反序列化即可。

但有一个关键限制：**JSON只能处理Dictionary和Array等基础类型**，无法直接序列化自定义类对象。因此，我们需要为每个数据类手动编写转换方法：

- **`to_dict()`**：将对象转换为Dictionary（序列化），用于保存
- **`from_dict()`**：从Dictionary还原对象（反序列化），用于读取

下面的示例代码展示了一个完整的JSON存档方案，包括：
1. **数据类定义**：如何为类编写 `to_dict()` 和 `from_dict()` 方法
2. **类型处理**：基本类型直接存储，`Vector2` 等Godot内置类型需要用 `JSON.from_native()` / `JSON.to_native()` 转换
3. **嵌套对象**：通过递归调用实现嵌套类的序列化
4. **文件读写**：使用 `FileAccess` 进行文件的读取和保存

示例代码：
::: details
``` gdscript
# ============================================================
# 数据类定义
# 将需要保存的数据封装成类，并提供序列化/反序列化方法
# ============================================================

class TestClass:
	# 定义需要保存的属性
	var a: int = 0                              # 整数类型，默认值为0
	var b: String = ""                          # 字符串类型，默认值为空字符串
	var c: Vector2 = Vector2.ZERO               # Vector2类型，Godot内置类型，需要特殊处理
	var d: TestSubClass = TestSubClass.new()    # 嵌套的子类对象，需要递归序列化

	## 将当前对象转换为字典（序列化）
	## 用于保存时将对象转换为JSON可处理的格式
	func to_dict() -> Dictionary:
		return {
			"a": self.a,                        # 基本类型可以直接存储
			"b": self.b,
			"c": JSON.from_native(self.c),      # Vector2等Godot内置类型需要用JSON.from_native()转换
			"d": self.d.to_dict(),              # 嵌套对象需要递归调用to_dict()
		}

	## 从字典创建对象（反序列化）
	## 用于读取时将JSON数据还原为对象
	## [param dict] 从JSON解析得到的字典
	## [return] 返回还原后的TestClass实例
	static func from_dict(dict: Dictionary) -> TestClass:
		var res = TestClass.new()               # 创建新实例
		res.a = dict.get("a", 0)                # 使用get()方法获取值，第二个参数是默认值（防止键不存在时报错）
		res.b = dict.get("b", "")               # 注意：原代码这里默认值写成了0，应该是""
		res.c = JSON.to_native(dict.get("c", {}))   # 使用JSON.to_native()将数据还原为Vector2
		res.d = TestSubClass.from_dict(dict.get("d", {}))  # 嵌套对象递归调用from_dict()
		return res


# 子类示例：展示如何处理嵌套对象
class TestSubClass:
	var e: int = 0

	## 子类的序列化方法
	func to_dict() -> Dictionary:
		return {
			"e": self.e
		}

	## 子类的反序列化方法
	static func from_dict(dict: Dictionary) -> TestSubClass:
		var res = TestSubClass.new()
		res.e = dict.get("e", 0)
		return res


# ============================================================
# 文件读写函数
# ============================================================

# 存档文件路径（使用user://确保导出后可写入）
var save_file_path = "user://save.json"

# 存档对象实例
var save_object: TestClass

## 从文件加载存档数据
func load_from_file():
	# 以只读模式打开文件
	var file = FileAccess.open(save_file_path, FileAccess.READ)

	# 检查文件是否成功打开
	if FileAccess.get_open_error() == OK:
		# 读取文件的全部内容为字符串
		var file_content: String = file.get_as_text()

		# 判断文件内容是否为空
		if not file_content == "":
			# 将JSON字符串解析为字典
			var dict = JSON.parse_string(file_content)
			# 通过反序列化方法将字典转换为对象
			save_object = TestClass.from_dict(dict)
		else:
			# 文件为空时，创建一个新的默认对象
			save_object = TestClass.new()

		# 关闭文件（重要！不关闭可能导致资源泄露）
		file.close()
	else:
		# 文件打开失败时输出错误信息
		printerr("打开文件错误")


## 将存档数据保存到文件
func save_to_file():
	# 以写入模式打开文件（如果文件不存在会自动创建，存在则覆盖）
	var file = FileAccess.open(save_file_path, FileAccess.WRITE)

	# 将对象转换为字典，再将字典序列化为JSON字符串
	var file_content = JSON.stringify(save_object.to_dict())

	# 将JSON字符串写入文件
	file.store_string(file_content)

	# 关闭文件
	file.close()

```
:::

### 使用二进制文件保存数据
待补充

### 使用Resource资源文件保存数据

Resource是Godot引擎的原生资源系统，使用它来保存数据是最"Godot风格"的方式。相比JSON方案，Resource有以下优势：

- **原生类型支持**：`Vector2`、`Color`、`PackedScene` 等Godot内置类型可以直接保存，无需手动转换
- **代码极简**：只需调用 `ResourceSaver.save()` 和 `load()`，无需编写序列化/反序列化方法
- **编辑器集成**：`.tres` 文件可以在Godot编辑器中直接查看和编辑

::: warning 注意事项
- 存档路径建议使用 `user://` 前缀（如 `user://save.tres`），因为 `res://` 目录在导出后是只读的
- Resource文件是Godot特有格式，不适合需要跨引擎或被外部程序读取的场景
- 如果需要防止玩家修改存档，应考虑使用二进制格式（`.res`）而非文本格式（`.tres`）
:::

示例代码：
::: details
``` gdscript
# ============================================================
# 存档路径和资源实例
# ============================================================

# 存档文件路径（使用user://确保导出后可写入）
var save_path = "user://save.tres"

# 存档资源实例
var save_resource = TestResource.new()


# ============================================================
# 自定义Resource类
# 继承Resource即可，属性会自动被序列化
# ============================================================

class TestResource extends Resource:
	# 基本类型 - 直接支持
	var a: int = 0
	var b: String = ""

	# Godot内置类型 - 直接支持，无需手动转换！
	var c: Vector2 = Vector2.ZERO

	# 甚至可以保存其他资源类型，如场景、纹理等
	var d: PackedScene = null


# ============================================================
# 文件读写函数
# ============================================================

## 将资源保存到文件
func save_resource_to_file():
	# 使用ResourceSaver保存资源
	# 第一个参数：资源对象
	# 第二个参数：保存路径
	var error = ResourceSaver.save(save_resource, save_path)
	if error != OK:
		printerr("保存失败，错误码：", error)


## 从文件加载资源
func load_resource_from_file():
	# 检查文件是否存在
	if ResourceLoader.exists(save_path):
		# 使用load()函数加载资源，自动还原为Resource对象
		save_resource = load(save_path)
	else:
		# 文件不存在时，创建新的默认资源
		save_resource = TestResource.new()
```
:::


### 使用SQLite数据库保存数据
待补充

## DLC 和 MOD

DLC（Downloadable Content，可下载内容）和MOD（Modification，游戏模组）是扩展游戏内容的重要方式。在Godot中，我们可以通过**PCK资源包**来实现这一功能。

### PCK资源包简介

PCK（Pack）是Godot的资源打包格式。当你导出游戏时，所有资源都会被打包成一个 `.pck` 文件。利用这一特性，我们可以：

- **制作DLC**：将新关卡、角色、道具等打包成独立的 `.pck` 文件，玩家购买后下载即可
- **支持MOD**：允许玩家创建自己的 `.pck` 资源包，为游戏添加自定义内容

### 实现原理

1. **创建DLC/MOD项目**：新建一个Godot项目，使用与主游戏**相同的路径结构**
2. **导出为PCK**：导出时选择"导出PCK/ZIP"而非完整游戏
3. **运行时加载**：主游戏启动时扫描指定目录，使用 `ProjectSettings.load_resource_pack()` 加载PCK文件
4. **资源覆盖**：PCK中的资源会覆盖主游戏中同路径的资源，或添加新资源

::: tip 路径一致性
DLC项目中的资源路径必须与主游戏保持一致。例如，如果主游戏的关卡在 `res://levels/` 目录下，DLC中的新关卡也应放在 `res://levels/` 目录。
:::

示例代码：
::: details
``` gdscript
# ============================================================
# DLC加载器
# 在游戏启动时自动扫描并加载dlc目录下的所有PCK文件
# ============================================================

extends Control

# 加载DLC后要跳转的场景（在编辑器中选择.tscn文件）
@export_file('*.tscn') var start_scene


func _ready() -> void:
	# 游戏启动时自动加载DLC
	load_dlc()


## 扫描并加载所有DLC资源包
func load_dlc() -> void:
	# 打开dlc目录（相对于游戏可执行文件的位置）
	# 注意：这里使用 './' 而非 'res://'，因为DLC文件在游戏外部
	var dlc_dir = DirAccess.open('./dlc')

	if dlc_dir != null:
		# 打印当前目录路径（调试用）
		print("DLC目录：", dlc_dir.get_current_dir())

		# 开始遍历目录
		dlc_dir.list_dir_begin()
		var file_name = dlc_dir.get_next()

		# 循环遍历目录中的所有文件和子目录
		while file_name != "":
			if dlc_dir.current_is_dir():
				# 跳过子目录（如果需要递归加载，可以在这里添加逻辑）
				print("跳过目录：", file_name)
			else:
				print("发现文件：", file_name)

				# 只加载.pck格式的资源包
				if file_name.ends_with(".pck"):
					# 使用ProjectSettings.load_resource_pack()加载PCK文件
					# 加载成功后，PCK中的资源会合并到游戏的虚拟文件系统中
					var success = ProjectSettings.load_resource_pack('./dlc/' + file_name)

					if success:
						print("✓ 加载DLC成功：", file_name)
					else:
						printerr("✗ 加载DLC失败：", file_name)

			# 获取下一个文件
			file_name = dlc_dir.get_next()

		# 结束目录遍历（释放资源）
		dlc_dir.list_dir_end()
	else:
		# dlc目录不存在，这是正常情况（玩家可能没有安装任何DLC）
		print("未找到dlc目录，跳过DLC加载")

	# 等待一小段时间，确保资源加载完成
	await get_tree().create_timer(0.1).timeout

	# 跳转到起始场景
	# 此时DLC中的资源已经可用，如果DLC覆盖了某些资源，将使用DLC版本
	get_tree().change_scene_to_file(start_scene)
```
:::