---
title: 开发路线规划
icon: list
sidebar: true
category:
  - 项目
author: 斓
date: 2025-12-04
---

## 简介

Alpha 项目致力于为 Godot 开发者提供智能化的辅助工具。本页面展示了项目的功能开发进度，包括已实现的工具函数和交互特性，以及未来的开发规划。

::: tip 状态说明
- ✅ **已完成**：功能已实装并测试通过
- ⬜ **待开发**：功能已列入计划，等待实现
:::

## 🛠️ 工具能力 (Tools)

Alpha 通过一系列原子化的工具函数来操作 Godot 编辑器和项目文件。

### ✅ 已就绪

- [x] **`get_project_info`** <Badge text="查询" type="tip" vertical="middle" />
  - 获取 Godot 引擎、系统和项目配置信息
- [x] **`get_editor_info`** <Badge text="查询" type="tip" vertical="middle" />
  - 获取编辑器当前打开的场景和脚本状态
- [x] **`get_project_file_list`** <Badge text="查询" type="tip" vertical="middle" />
  - 获取项目中所有文件及其 UID 列表
- [x] **`read_file`** <Badge text="文件操作" vertical="middle" />
  - 读取指定文件的内容
- [x] **`write_file`** <Badge text="文件操作" vertical="middle" />
  - 写入或覆盖文件内容
- [x] **`create_folder`** <Badge text="文件操作" vertical="middle" />
  - 创建文件夹
- [x] **`get_class_doc`** <Badge text="查询" type="tip" vertical="middle" />
  - 获取 Godot 原生类的文档信息
- [x] **`add_script_to_scene`** <Badge text="场景操作" type="warning" vertical="middle" />
  - 将脚本加载到场景节点上
- [x] **`sep_script_to_scene`** <Badge text="场景操作" type="warning" vertical="middle" />
  - 将脚本从场景节点上分离
- [x] **`get_image_info`** <Badge text="查询" type="tip" vertical="middle" />
  - 获取图片文件信息
- [x] **`set_singleton`** <Badge text="配置" type="danger" vertical="middle" />
  - 设置或删除项目自动加载脚本或场景
- [x] **`check_script_error`** <Badge text="调试" type="danger" vertical="middle" />
  - 检查脚本中的语法错误
- [x] **`open_resource`** <Badge text="编辑器操作" type="warning" vertical="middle" />
  - 使用编辑器打开资源文件
- [x] **`update_script_file_content`** <Badge text="编辑器操作" type="warning" vertical="middle" />
  - 目标：替换代码中指定行的内容

### 🚧 待开发
- [ ] **场景节点属性修改** <Badge text="场景操作" type="warning" vertical="middle" />
  - 目标：设置特定场景中特定节点的属性值
  - *难点*：需要先打开场景切换界面，并解决变量声明和类型匹配问题
- [ ] **AnimationPlayer 资源操作** <Badge text="动画" type="tip" vertical="middle" />
  - 目标：根据 AI 结果自动添加动画和轨道
  - *数据结构*：AI 返回 JSON 数组，支持批量设置
- [ ] **TileSet 数据读写** <Badge text="TileMap" type="tip" vertical="middle" />
  - 目标：筛选图集，获取/修改瓦片信息（坐标、物理、渲染、导航等）
- [ ] 编写脚本可以直接运行的脚本，并运行 <Badge text="编辑器操作" type="warning" vertical="middle" />
    - 参照`update_script_file_content`的调用快捷键方式
- [ ] 编辑器内编辑Shader <Badge text="编辑器操作" type="warning" vertical="middle" />
    - 参考`update_script_file_content`，但是需要先获得节点

## 💬 交互体验 (Interaction)

提升用户与 AI 协作的流畅度和功能丰富性。

### ✅ 已就绪
- [x] **思考模式**：支持 AI 展示推理过程
- [x] 展示工具调用参数
- 设置与配置
  - [x] 发送后自动清空输入框
  - [x] **全局设置系统**：将设置项改为全局生效
  - [x] **API Key 管理**：添加 Secret Key 设置项
  - [x] **自动展开思考**：添加配置项控制思考过程默认展开状态
  - [x] **智能引用配置**：添加引用后不自动填写文件名的开关
- [x] 面板添加最小宽度

### 📅 规划中

#### 交互优化
- [ ] **Ask 模式优化**：允许调用查询工具但禁止写文件，保障安全
- [ ] **快捷键支持**：
  - [ ] 引用代码段快捷键（自动发送位置和路径）
  - [x] 输入框快速发送快捷键
- [ ] **输入体验优化**：
  - [ ] 无输入时禁用发送按钮
  - [x] 引用文件后自动在光标处插入文件名字符串 `TextEdit.insert_text_at_caret`
- [ ] **错误处理**：
  - [ ] DeepSeek 报错信息友好展示
  - [ ] 用户中断 AI 请求功能

#### 功能增强
- [ ] **记忆管理面板**：管理 AI 的长期记忆
- [ ] **任务规划 (Todo List)**：AI 先规划任务再执行
- [ ] **智能总结**：总结当前对话并开启新对话（带上下文）
- [ ] **会话管理**：
  - [ ] 从特定位置分叉/重新开始对话
  - [x] 历史记录按钮交互修复（悬停抖动问题）
- [ ] **文件变更追踪**：
  - [ ] 显示修改的文件列表
  - [ ] 支持撤回更改
- [ ] **关于页面**：添加作者页面跳转
