---
title: 着色器实现思路
author: 陌上竹
date: 2026-03-23
category:
  - 教程
tag:
  - 着色器
  - 实现思路
---

Shader（着色器）是一种运行在 GPU 上的特殊程序，用于控制渲染管线的各个阶段，实现各种视觉效果。在 Godot 4 中，Shader 编程是一个重要的技能，无论是 2D 还是 3D 项目都能广泛应用。

<!-- more -->

## Shader 编程工作流

从需求到实现的标准工作流：

1. **明确需求** - 确定要实现的视觉效果
2. **选择 Shader 类型** - Canvas Item（2D）、Spatial（3D）或粒子着色器
3. **设计算法** - 确定数学模型和实现思路
4. **编写代码** - 使用 GDScript 风格的 Shader 语言
5. **调试优化** - 测试效果并优化性能

## Shader 类型

Godot 4 主要支持三种 Shader 类型：

| 类型            | 用途    | 应用节点                       |
| ------------- | ----- | -------------------------- |
| `canvas_item` | 2D 渲染 | 2D 精灵、Control 节点、ColorRect |
| `spatial`     | 3D 渲染 | 3D 网格、体积                   |
| `particles`   | 粒子系统 | GPUParticles2D/3D          |

```gdshader
# Canvas Item Shader (2D)
shader_type canvas_item;

# Spatial Shader (3D)
shader_type spatial;

# Particle Shader
shader_type particles;
```

---

## UV 操作模式

UV 坐标是 Shader 编程的基础，用于纹理采样。UV 范围通常为 (0,0) 到 (1,1)。

### 1. 缩放 (Scale)

```gdshader
shader_type canvas_item;

uniform vec2 scale = vec2(2.0, 2.0);
uniform vec2 pivot = vec2(0.5, 0.5);

void vertex() {
    UV -= pivot;
    UV /= scale;
    UV += pivot;
}
```

### 2. 旋转 (Rotate)

```gdshader
shader_type canvas_item;
render_mode unshaded;

uniform float angular_speed = 1.0;
uniform vec2 pivot = vec2(0.5, 0.5);

void vertex() {
    UV -= pivot;
    float rot = TIME * angular_speed;
    UV *= mat2(
        vec2(sin(rot), -cos(rot)),
        vec2(cos(rot), sin(rot))
    );
    UV += pivot;
}
```

### 3. 偏移/滚动 (Offset/Scroll)

```gdshader
shader_type canvas_item;

uniform vec2 scroll_speed = vec2(1, 0.0);

void fragment() {
    vec2 offset_uv = UV + cos(TIME) * scroll_speed;
    COLOR = texture(TEXTURE, offset_uv);
}
```

### 4. 扭曲 (Distortion)

```gdshader
shader_type canvas_item;

uniform float distortion_strength = 0.1;

void fragment() {
    vec2 distorted_uv = UV;
    distorted_uv.x += sin(UV.y * 10.0 + TIME) * distortion_strength;
    distorted_uv.y += cos(UV.x * 10.0 + TIME) * distortion_strength;
    COLOR = texture(TEXTURE, distorted_uv);
}
```

---

## 颜色操作模式

### 1. 灰度处理

```gdshader
shader_type canvas_item;

void fragment() {
    vec4 color = texture(TEXTURE, UV);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    COLOR = vec4(vec3(gray), color.a);
}
```

### 2. 颜色混合

```gdshader
shader_type canvas_item;

uniform vec4 tint_color: source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform float intensity = 0.5;

void fragment() {
    vec4 color = texture(TEXTURE, UV);
    COLOR = mix(color, color * tint_color, intensity);
}
```

### 3. 颜色调整（亮度、对比度、饱和度）

```gdshader
shader_type canvas_item;

uniform float brightness = 0.0;  // -1.0 到 1.0
uniform float contrast = 1.0;    // 0.0 到 2.0
uniform float saturation = 1.0;  // 0.0 到 2.0

void fragment() {
    vec4 color = texture(TEXTURE, UV);

    // 亮度
    color.rgb += brightness;

    // 对比度
    color.rgb = (color.rgb - 0.5) * contrast + 0.5;

    // 饱和度
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, saturation);

    COLOR = color;
}
```

### 4. 流水效果

```gdshader
shader_type canvas_item;

uniform sampler2D light_vector;
uniform float width = 0.08;
uniform vec4 flowlight = vec4(0.3, 0.3, 0.0, 0.3);

void fragment() {
    vec4 color = texture(TEXTURE, UV);
    if (color.a != 0.0) {
        float v = texture(light_vector, UV).r;
        float diff = v - cos(TIME * 0.5);
        if (abs(diff) < width) {
            color = color + mix(flowlight, vec4(0.0), abs(diff) / width);
        }
    }
    COLOR = color;
}
```

---

## 噪声应用

噪声是程序化纹理和视觉效果的核心工具。

### 1. Perlin Noise（柏林噪声）

适用于自然、有机的纹理效果，如云朵、烟雾、地形。

```gdshader
// 简化的 Perlin Noise 实现
float perlin_noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
```

### 2. Voronoi / Worley Noise

适用于细胞状、破碎的纹理效果。

```gdshader
float worley_noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float min_dist = 1.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = fract(sin(dot(i + neighbor, vec2(127.1, 311.7))) * 43758.5453);
            float dist = length(neighbor + point - f);
            min_dist = min(min_dist, dist);
        }
    }
    return min_dist;
}
```

### 3. FBM (Fractal Brownian Motion)

通过叠加多层噪声创建更复杂的自然纹理。

```gdshader
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < octaves; i++) {
        value += amplitude * perlin_noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}
```

---

## 距离场 SDF 的使用

SDF（Signed Distance Field，有符号距离场）是一种强大的 2D 图形表示方法。

### 1. 圆形 SDF

```gdshader
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void fragment() {
    vec2 uv = UV * 2.0 - 1.0;
    float d = sdCircle(uv, 0.5);
    vec3 color = mix(vec3(1.0), vec3(0.0), smoothstep(0.0, 0.01, d));
    COLOR = vec4(color, 1.0);
}
```

### 2. 矩形 SDF

```gdshader
shader_type canvas_item;

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void fragment() {
    vec2 uv = UV * 2.0 - 1.0;
    float d = sdBox(uv, vec2(0.5));
    vec3 color = mix(vec3(1.0), vec3(0.0), smoothstep(0.0, 0.01, d));
    COLOR = vec4(color, 1.0);
}
```

### 3. 圆角矩形

```gdshader
shader_type canvas_item;

uniform float radius : hint_range(0, 0.5) = 0.1;
uniform bool hide_top_left = false;
uniform bool hide_top_right = false;
uniform bool hide_bottom_left = false;
uniform bool hide_bottom_right = false;

void fragment() {
    vec2 uv = UV;
    vec4 color = texture(TEXTURE, uv);

    // 左上角处理
    if (hide_top_left && uv.x < radius && uv.y < radius) {
        vec2 center = vec2(radius, radius);
        float dist = length(uv - center);
        if (dist > radius) {
            color.a = 0.0;
        }
    }

    // 其他角的处理类似...

    COLOR = color;
}
```

### 4. SDF 描边效果

```gdshader
shader_type spatial;
render_mode cull_front, unshaded;

uniform vec4 outline_color : source_color = vec4(1.0, 0.0, 0.0, 1.0);
uniform float grow = 0.05;

void vertex() {
    VERTEX += NORMAL * grow;
}

void fragment() {
    ALBEDO = outline_color.rgb;
}
```

---

## 性能优化技巧

### 1. 减少纹理采样

- **纹理缓存** - 将 `texture(TEXTURE, UV)` 的结果存储到局部变量，避免重复采样
- **单通道多效果** - 在一个 shader 中合并多个效果，而不是使用多个材质

```gdshader
// 错误：多次采样
void fragment() {
    float r = texture(TEXTURE, UV).r;
    float g = texture(TEXTURE, UV + vec2(0.1, 0.0)).g;
    float b = texture(TEXTURE, UV + vec2(0.2, 0.0)).b;
}

// 正确：单次采样
void fragment() {
    vec4 tex = texture(TEXTURE, UV);
    float r = tex.r;
    float g = tex.g;
    float b = tex.b;
}
```

### 2. 避免分支语句

GPU 并行处理的特性使其对分支语句不友好。

```gdshader
// 避免
if (condition) {
    color = a;
} else {
    color = b;
}

// 推荐：使用 step 或 mix
color = mix(a, b, step(threshold, value));
```

### 3. 合理使用精度

```gdshader
// 高精度用于位置计算
highp vec3 world_position;

// 低精度用于颜色和临时计算
lowp float temp;

// 中等精度（默认）
mediump vec2 uv;
```

### 4. MultiMesh 实例优化

对于需要渲染大量相同物体的场景（如草地、粒子），使用 MultiMesh：

```gdscript
# GDScript
var multimesh = MultiMesh.new()
multimesh.mesh = preload("res://grass.mesh")
multimesh.instance_count = 1000

# 设置每个实例的变换
for i in range(1000):
    var transform = Transform3D()
    transform.origin = Vector3(randf() * 100, 0, randf() * 100)
    multimesh.set_instance_transform(i, transform)
```

### 5. 其他优化建议

| 优化项 | 说明 |
|--------|------|
| 减少 uniform 数量 | uniform 变量在 CPU 和 GPU 间传输有开销 |
| 使用 Constants | 编译时常量比 uniform 更快 |
| 避免动态分支 | 使用 `step()`、`smoothstep()` 等数学函数替代 `if` |
| 纹理格式 | 使用合适的纹理压缩格式（ETC2、ASTC） |
| 减少 overdraw | 合理设置渲染队列，避免不必要的透明叠加 |

---

## Shader 调试方法

### 1. 简单调试技巧

```gdshader
// 临时输出中间值到屏幕
void fragment() {
    vec4 color = texture(TEXTURE, UV);
    float debug_value = some_calculation;
    COLOR = vec4(debug_value, 0.0, 0.0, 1.0);  // 红色通道显示调试值
}
```

### 2. 使用 Monitor 调试

在 Godot 编辑器中使用 **Debugger > Monitor** 面板：
- 观察 `fps`、`draw_calls` 指标
- 检查材质数量和渲染状态

### 3. 逐步注释法

将 shader 代码分段落注释，逐步取消注释定位问题：

```gdshader
void fragment() {
    vec4 color = texture(TEXTURE, UV);
    // COLOR = color; return;  // 逐步取消注释调试

    color.r *= 1.2;
    // COLOR = color; return;

    color.g *= 0.8;
    // COLOR = color; return;

    COLOR = color;
}
```

### 4. 外部工具

- **RenderDoc** - GPU 帧分析工具
- **NSight Graphics** - NVIDIA 显卡调试工具

---

## 从代码版到 VisualShader 的转换

Godot 提供 VisualShader 编辑器，适合不熟悉代码的开发者。

### 转换方法

1. **手动转换** - 根据代码逻辑在 VisualShader 编辑器中连接对应节点

2. **VisualShader 节点对应关系**：

| 代码 Shader | VisualShader 节点 |
|------------|------------------|
| `texture(TEXTURE, UV)` | Texture |
| `TIME` | Time |
| `sin()` / `cos()` | ScalarOp (选择对应运算) |
| `mix(a, b, c)` | Mix |
| `step(a, b)` | ScalarOp > Step |
| `smoothstep(a, b, c)` | ScalarOp > Smoothstep |

### VisualShader 优势

- 可视化节点编辑，所见即所得
- 内置常用节点库
- 易于分享和复用

### VisualShader 局限

- 复杂算法实现繁琐
- 代码更灵活、性能更好

---

## 常见应用场景

| 场景 | 推荐技术 |
|------|----------|
| 2D 精灵特效 | Canvas Item Shader |
| UI 效果 | Canvas Item Shader |
| 地形生成 | FBM + Perlin Noise |
| 水面效果 | Sine Wave + Noise |
| 描边/轮廓 | Normal Expansion 或 SDF |
| 溶解效果 | Noise + Alpha Cutoff |
| 雾效 | Depth Buffer + Noise |

---

## 参考资源

- [Godot Shaders 社区库](https://godotshaders.com/)
- [Godot 官方文档 - Shading Language](https://docs.godotengine.org/)
- [ShaderToy - 学习 Shader 的优秀资源](https://www.shadertoy.com/)

---

## 相关教程

- [着色器简介](./intro) - Shader 基础概念与语法
- [着色器常用数学](./shader-math) - Shader 编程中的数学基础
- [着色器常见案例](./shader-common-cases) - 描边、像素化、灰度、溶解等实战案例
