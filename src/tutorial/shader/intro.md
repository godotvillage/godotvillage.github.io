---
title: 着色器简介
author: 陌上竹
date: 2026-03-23
category:
  - 教程
tag:
  - 着色器
---

::: details 链接
着色器相关文档：[Godot文档-着色器简介](https://docs.godotengine.org/zh-cn/4.x/tutorials/shaders/introduction_to_shaders.html)
:::

## 什么是 Shader

Shader（着色器）是一种运行在 GPU 上的特殊程序，负责决定如何处理网格模型的数据（如顶点位置、颜色、法线等）以及如何将它们绘制到屏幕上。

Godot 引擎的 Shader 语言基于流行的 OpenGL Shading Language (GLSL)，但进行了简化和扩展，提供了更方便开发者使用的接口。

<!-- more -->

## 为什么使用 Shader

- **高性能**：GPU 并行处理，适合处理大量像素
- **程序化生成**：可以动态生成纹理、颜色、效果
- **视觉效果**：实现光照、阴影、材质等复杂效果
- **实时反馈**：支持时间相关的动态效果

## Godot 中的 Shader 类型

Godot 4 支持 5 种 Shader 类型：

### canvas_item（2D 着色器）

用于 2D 场景中的渲染，如 Sprite2D、Control 组件、ColorRect 等。

```gdshader
shader_type canvas_item;

void vertex() {
    // 顶点着色器
}

void fragment() {
    // 片段着色器
    COLOR = vec4(1.0, 0.0, 0.0, 1.0); // 输出红色
}
```

### spatial（3D 着色器）

用于 3D 场景中的物体渲染，如网格、地形等。

```gdshader
shader_type spatial;

void vertex() {
    // 顶点着色器：处理每个顶点
}

void fragment() {
    // 片段着色器：处理每个像素
}

void light() {
    // 光照着色器：处理光照计算
}
```

### particles（粒子着色器）

用于粒子系统的渲染。

```gdshader
shader_type particles;

void start() {
    // 粒子产生时调用
}

void process() {
    // 粒子每帧更新时调用
}

void fragment() {
    // 粒子片段着色器
}
```

### sky（天空着色器）

用于渲染天空盒和大气效果。

```gdshader
shader_type sky;

void sky() {
    // 天空着色器主函数
}

void fragment() {
    // 片段处理
}
```

### fog（雾效着色器）

用于体积雾效的渲染。

```gdshader
shader_type fog;

void fog() {
    // 雾效着色器主函数
}
```

## 数据类型

Godot Shader 支持绝大多数 GLSL ES 3.0 数据类型：

### 基础类型

| 类型 | 描述 |
|------|------|
| `void` | 空类型 |
| `bool` | 布尔类型 |
| `int` | 有符号整型 |
| `float` | 浮点数 |
| `bvec2/3/4` | 2/3/4 维布尔向量 |
| `ivec2/3/4` | 2/3/4 维整型向量 |
| `vec2/3/4` | 2/3/4 维浮点向量 |

### 矩阵类型

| 类型 | 描述 |
|------|------|
| `mat2` | 2x2 矩阵 |
| `mat3` | 3x3 矩阵 |
| `mat4` | 4x4 矩阵 |

### 纹理类型

| 类型 | 描述 |
|------|------|
| `sampler2D` | 2D 纹理采样器 |
| `samplerCube` | 立方体纹理采样器 |
| `sampler3D` | 3D 纹理采样器 |

### 代码示例

```gdshader
// 向量定义
vec2 uv = vec2(0.5, 0.5);
vec3 normal = vec3(0.0, 1.0, 0.0);
vec4 color = vec4(1.0, 0.0, 0.0, 1.0);

// 矩阵定义
mat2 rot2d = mat2(1.0, 0.0, 0.0, 1.0);
mat3 basis = mat3(MODEL_MATRIX);

// Swizzling（分量重排）
vec4 a = vec4(1.0, 2.0, 3.0, 4.0);
vec3 b = a.xyz;  // b = vec3(1.0, 2.0, 3.0)
float c = b.x;   // 可以，只取 x 分量
```

### 精度修饰符

```gdshader
lowp float a;    // 低精度
mediump vec2 b;  // 中精度
highp int c;     // 高精度

// 也可以使用关键词
precision lowp float;
```

## Uniform 变量声明与使用

Uniform 变量用于从 CPU 端向 GPU 端传递数据，在整个绘制过程中保持不变。

### 基本语法

```gdshader
shader_type canvas_item;

uniform float my_float = 1.0;        // 带默认值
uniform vec4 my_color;               // 不带默认值
uniform sampler2D my_texture;        // 纹理采样器
```

### Hint 提示

Hint 用于在编辑器中提供更好的 UI 交互和默认值提示。

| Hint | 描述 | 示例 |
|------|------|------|
| `hint_range(min, max)` | 范围提示 | `uniform float amount : hint_range(0, 1) = 0.5;` |
| `source_color` | 颜色提示 | `uniform vec4 color : source_color;` |
| `hint_albedo` | 纹理提示（默认白色） | `uniform sampler2D tex : hint_albedo;` |
| `hint_normal` | 法线纹理提示 | `uniform sampler2D normal_map : hint_normal;` |
| `hint_black` | 黑色值提示 | `uniform sampler2D black_tex : hint_black;` |
| `hint_white` | 白色值提示 | `uniform sampler2D white_tex : hint_white;` |

### 代码示例

```gdshader
shader_type canvas_item;

// 颜色uniform
uniform vec4 hurt_color : source_color;
// 范围uniform
uniform float hurt_intensity : hint_range(0.0, 1.0) = 0.0;
// 带步长的范围uniform
uniform float progress : hint_range(0.0, 1.0, 0.1) = 0.5;
// 纹理uniform
uniform sampler2D light_vector;

void fragment() {
    vec4 color = texture(TEXTURE, UV);
    color = mix(color, hurt_color, hurt_intensity * color.a);
    COLOR = color;
}
```

### GDScript 端设置 Uniform

```gdscript
# 获取 ShaderMaterial
var material = $Sprite2D.material as ShaderMaterial
# 设置 uniform 参数
material.set_shader_parameter("hurt_intensity", 0.5)
material.set_shader_parameter("hurt_color", Color(1, 0, 0))
```

## 内置全局变量

### 数学常量

| 变量 | 描述 | 值 |
|------|------|-----|
| `PI` | 圆周率 | 3.14159265359 |
| `TAU` | 2倍圆周率 | 6.28318530718 |
| `E` | 自然常数 e | 2.71828182846 |
| `ROOT2` | 根号2 | 1.41421356237 |
| `INFINITY` | 无穷大 | 无穷大 |

### 时间相关

| 变量 | 描述 |
|------|------|
| `TIME` | 从游戏开始经过的时间（秒） |
| `FRAME` | 当前帧编号 |

### UV 坐标

| 变量 | 描述 |
|------|------|
| `UV` | 当前像素的 UV 坐标（0.0 ~ 1.0） |

### 代码示例

```gdshader
shader_type canvas_item;

void fragment() {
    // 使用 TIME 创建动画效果
    float wave = sin(UV.y * 10.0 + TIME * 5.0) * 0.1;

    // 使用 UV 创建渐变
    vec4 color = texture(TEXTURE, UV);
    color.rgb *= UV.x; // 水平渐变

    COLOR = color;
}
```

## 各类型内置变量

### canvas_item 内置变量

**顶点着色器 (vertex)**

| 变量 | 描述 |
|------|------|
| `VERTEX` | 顶点位置 |
| `UV` | 顶点 UV 坐标 |
| `COLOR` | 顶点颜色 |

**片段着色器 (fragment)**

| 变量 | 描述 |
|------|------|
| `UV` | 片段 UV 坐标 |
| `COLOR` | 输出颜色 |
| `TEXTURE` | 当前纹理（canvas_item 使用） |
| `TEXTURE_PIXEL_SIZE` | 纹理像素大小 |

### spatial 内置变量

**顶点着色器 (vertex)**

| 变量 | 描述 |
|------|------|
| `VERTEX` | 顶点位置（局部空间） |
| `UV` | 顶点 UV 坐标 |
| `NORMAL` | 顶点法线 |
| `MODEL_MATRIX` | 模型矩阵 |
| `MODEL_NORMAL_MATRIX` | 模型法线矩阵 |
| `VIEW_MATRIX` | 视图矩阵 |
| `INV_VIEW_MATRIX` | 视图矩阵逆矩阵 |

**片段着色器 (fragment)**

| 变量 | 描述 |
|------|------|
| `NORMAL` | 法线 |
| `ALBEDO` | 基础颜色 |
| `METALLIC` | 金属度 |
| `ROUGHNESS` | 粗糙度 |
| `EMISSION` | 自发光 |
| `ALPHA` | 透明度 |

**光照着色器 (light)**

| 变量 | 描述 |
|------|------|
| `LIGHT` | 光照颜色 |
| `LIGHT_POSITION` | 光照位置 |
| `LIGHT_DIRECTION` | 光照方向 |
| `LIGHT_ENERGY` | 光照强度 |

### particles 内置变量

| 变量 | 描述 |
|------|------|
| `VELOCITY` | 粒子速度 |
| `LIFETIME` | 粒子生命周期 |
| `DELTA` | 帧间隔时间 |
| `NUMBER` | 粒子编号 |
| `INDEX` | 粒子索引 |

## 渲染模式（render_mode）

渲染模式用于改变着色器的默认行为，位于 `shader_type` 声明之后。

### canvas_item 渲染模式

| 模式 | 描述 |
|------|------|
| `unshaded` | 禁用光照，直接输出 COLOR |
| `lightless` | 不处理光照 |
| `blend_disabled` | 禁用混合 |
| `blend_add` | 加法混合 |
| `blend_sub` | 减法混合 |
| `blend_mul` | 乘法混合 |
| `cull_disabled` | 禁用背面剔除 |
| `cull_back` | 背面剔除 |
| `cull_front` | 正面剔除 |

### spatial 渲染模式

| 模式 | 描述 |
|------|------|
| `unshaded` | 无阴影 |
| `cull_front` | 正面剔除 |
| `cull_back` | 背面剔除（默认） |
| `cull_disabled` | 禁用剔除 |
| `depth_draw_opaque` | 不透明物体深度绘制 |
| `depth_draw_always` | 总是绘制深度 |
| `depth_draw_never` | 从不绘制深度 |

### particles 渲染模式

| 模式 | 描述 |
|------|------|
| `blend_add` | 加法混合 |
| `blend_sub` | 减法混合 |
| `blend_mul` | 乘法混合 |

### 代码示例

```gdshader
// 2D 无光照着色器
shader_type canvas_item;
render_mode unshaded;

uniform vec4 tint_color : source_color = vec4(1.0);

void fragment() {
    COLOR = texture(TEXTURE, UV) * tint_color;
}

// 3D 双面渲染着色器
shader_type spatial;
render_mode cull_disabled, unshaded;

void fragment() {
    ALBEDO = vec3(1.0, 0.0, 0.0);
}
```

## VisualShader 简介

VisualShader 是 Godot 提供的可视化着色器编辑器，无需编写代码即可创建复杂的着色器效果。

### VisualShader 的优势

- **无需编写代码**：通过节点连接实现功能
- **实时预览**：即时看到效果
- **易于学习**：适合初学者理解 Shader 逻辑
- **调试方便**：可以逐步查看节点输出

### 创建 VisualShader

1. 在节点上创建 `ShaderMaterial`
2. 选择新建「着色器」，类型选择 `VisualShader`
3. 选择模式：`Canvas Item`（2D）或 `spatial`（3D）

### 常用 VisualShader 节点

**2D (Canvas Item)**

- `ColorParameter`：颜色参数节点
- `BooleanParameter`：布尔参数节点
- `TextureParameter`：纹理参数节点
- `FloatParameter`：浮点数参数节点
- `UV`：UV 坐标节点
- `Texture`：纹理采样节点
- `Multiply`：乘法运算节点
- `Mix`：混合节点
- `If`：条件判断节点

### VisualShader 示例

创建一个简单的颜色叠加效果：

1. 添加 `ColorParameter` 节点，命名为 `tint_color`
2. 添加 `TextureParameter` 节点，命名为 `main_tex`
3. 添加 `Multiply` 节点
4. 连接：`tint_color` -> `Multiply` -> `输出 Color`

对应的代码：

```gdshader
shader_type canvas_item;

uniform vec4 tint_color : source_color;
uniform sampler2D main_tex;

void fragment() {
    COLOR = texture(main_tex, UV) * tint_color;
}
```

## 完整示例

### 示例 1：2D 闪烁效果

```gdshader
shader_type canvas_item;

uniform vec4 flash_color : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform float flash_intensity : hint_range(0.0, 1.0) = 0.0;

void fragment() {
    vec4 tex_color = texture(TEXTURE, UV);
    vec4 final_color = mix(tex_color, flash_color, flash_intensity);
    COLOR = final_color;
}
```

### 示例 2：2D 描边效果

```gdshader
shader_type canvas_item;

uniform vec4 outline_color : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float outline_width : hint_range(0.0, 50.0) = 2.0;

void vertex() {
    VERTEX += (UV * 2.0 - 1.0) * outline_width * TEXTURE_PIXEL_SIZE;
}

void fragment() {
    vec4 up = texture(TEXTURE, UV + vec2(0.0, TEXTURE_PIXEL_SIZE.y));
    vec4 down = texture(TEXTURE, UV - vec2(0.0, TEXTURE_PIXEL_SIZE.y));
    vec4 left = texture(TEXTURE, UV - vec2(TEXTURE_PIXEL_SIZE.x, 0.0));
    vec4 right = texture(TEXTURE, UV + vec2(TEXTURE_PIXEL_SIZE.x, 0.0));

    float outline = up.a + down.a + left.a + right.a;
    outline = clamp(outline, 0.0, 1.0);

    vec4 tex_color = texture(TEXTURE, UV);
    COLOR = mix(tex_color, outline_color, outline * (1.0 - tex_color.a));
}
```

### 示例 3：3D 菲涅尔效果

```gdshader
shader_type spatial;

uniform vec4 fresnel_color : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform float fresnel_power : hint_range(0.0, 10.0) = 3.0;

void fragment() {
    float fresnel = pow(1.0 - dot(NORMAL, vec3(0.0, 0.0, 1.0)), fresnel_power);
    ALBEDO = mix(ALBEDO, fresnel_color.rgb, fresnel);
}
```

## 实用技巧

### 从 GDScript 获取/设置 Shader 参数

```gdscript
# 获取 ShaderMaterial
var shader_material = $Sprite2D.material as ShaderMaterial

# 设置参数
shader_material.set_shader_parameter("flash_intensity", 0.5)

# 获取参数
var intensity = shader_material.get_shader_parameter("flash_intensity")
```

### 常用内置函数

```gdshader
// 三角函数
sin(x), cos(x), tan(x)
asin(x), acos(x), atan(x)

// 数学函数
abs(x), floor(x), ceil(x), round(x)
min(x, y), max(x, y), clamp(x, min, max)
mix(x, y, a)  // 线性插值

// 实用函数
step(edge, x)        // 阶梯函数
smoothstep(a, b, x)  // 平滑阶梯
discard              // 丢弃片段
```

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

## 相关教程

- [着色器常用数学](./shader-math) - Shader 编程中的数学基础
- [着色器实现思路](./shader-implementation) - UV 操作、颜色处理、噪声应用等
- [着色器常见案例](./shader-common-cases) - 描边、像素化、灰度、溶解等实战案例
