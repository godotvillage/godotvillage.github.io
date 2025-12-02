---
title: 着色器简介
author: Moshangzhu
date: 2025-10-15
category:
  - 教程
tag:
  - 着色器
---

::: details 链接
着色器相关文档：[Godot文档-着色器简介](https://docs.godotengine.org/zh-cn/4.x/tutorials/shaders/introduction_to_shaders.html#)
:::

## 什么是着色器

着色器是一段程序。借助强大的并行计算能力，计算机显卡可以在每次渲染帧中为纹理的每一个像素调用一次着色器程序，并生成新的纹理。

由于是并行运行的程序，所以每一个像素并不知道相邻像素的执行结果。也没有办法将每次执行的结果存储起来传给下一次运行。

<!-- more -->

## 着色器程序

### 着色器类型

程序的第一行通常是着色器类型。类似`shader_type spatial;`
着色器程序分为5种类型。不同类型的着色器有不同的处理函数。我们会在不同的章节详细讲解。

- 2D（`canvas_item`）
- 3D（`spatial`）
- 粒子（`particles`）
- 天空（`sky`）
- 雾（`fog`）

### 着色器渲染模式

着色器渲染模式通常作为程序的第二行，渲染模式会修改 Godot 应用着色器的方式。不同的渲染方式往往会达到不同的效果。

每个类型的着色器的渲染模式都不尽相同，同着色器类型一样，我们会在不同的章节详细讲解。

### 着色器语言

Godot着色器使用的是gdshader语言，是一种基于GLSL简化后的语言。Godot官方提供了转换的方法：[Godot文档-着色器迁移指南](https://docs.godotengine.org/zh-cn/4.x/tutorials/shaders/converting_glsl_to_godot_shaders.html#doc-converting-glsl-to-godot-shaders)。此处不赘述。

由于显卡需要快速的执行程序，所以代码风格比较严格，需要注意的点有：

- 语句需要以分号(`;`)结尾。
- 小数不可以写作整数的格式。类似`1.0`不可以写作`1`，必须要带有`.0`。
- 程序块需要添加大括号

由于着色器语法较多，单独作为一篇文章讲解。

## 着色器能做什么

着色器能够为游戏创造出丰富的视觉效果：

- 材质效果：金属、玻璃、布料等材质渲染
- 光照阴影：真实光照计算和动态阴影
- 动画效果：顶点动画、纹理流动、时间驱动动画
- 特殊效果：粒子系统、溶解、全息、扭曲等
- 后处理：景深、模糊、色调映射等屏幕效果
- 性能优化：LOD、剔除、批处理等优化技术

## 着色器获取

除了自己编写程序以外，也可以直接在网上获取已经写好的shader。

### Godot Shaders
[Godot Shaders](https://godotshaders.com/) 是专门为 Godot 设计的着色器库，可以直接使用。

- 社区驱动的着色器资源库
- 包含材质、动画、后处理等各种效果
- 无需修改，直接下载使用

### Shadertoy
[Shadertoy](https://www.shadertoy.com/) 是全球最大的 GLSL 着色器平台，需要迁移到 Godot 格式。

- 海量的 GLSL 着色器示例
- 实时预览效果
- 包含各种创意和艺术效果

迁移方法参考：[Godot 着色器迁移指南](https://docs.godotengine.org/zh-cn/4.x/tutorials/shaders/converting_glsl_to_godot_shaders.html)

## 额外学习

### The Book of Shaders
[The Book of Shaders](https://thebookofshaders.com/?lan=ch) 是学习片段着色器的经典教程。

- 从基础概念到高级技巧的完整学习路径
- 包含大量交互式示例
- 涵盖算法绘画、生成设计、图像处理等主题
- 提供中文版本，便于学习

### DX11龙书
《Introduction to 3D Game Programming with DirectX 11》是游戏编程的经典教材，群文件内可下载学习。

- 深入讲解3D游戏编程原理
- 包含大量着色器实现细节
- 适合进阶学习使用

