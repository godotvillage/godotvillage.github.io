---
title: 着色器常见案例
author: 陌上竹
date: 2026-03-23
category:
  - 教程
tag:
  - 着色器
  - 实战案例
---

本文整理了 Godot 4 中常见的 Shader 特效案例，涵盖描边、像素化、灰度、溶解、水波、模糊、发光的实现。

<!-- more -->

## 1. 描边着色器（轮廓检测）

### 效果描述

为精灵或字体添加外轮廓效果，常用于 UI 元素、选中状态或卡通风格的描边效果。

### 实现思路

- 在原图的基础上，对上下左右四个方向进行像素采样
- 将采样结果混合到透明区域形成描边
- 使用 `mix` 函数根据原图 alpha 值决定显示描边还是原图

### 核心代码

```gdshader
shader_type canvas_item;

uniform float outline_width = 1.0;
uniform vec4 outline_color: source_color = vec4(1, 0, 0, 1);

void fragment() {
    vec2 uv = UV;
    // 上下左右四个方向偏移采样
    vec2 uv_up = uv + vec2(0, TEXTURE_PIXEL_SIZE.y) * outline_width;
    vec2 uv_down = uv + vec2(0, -TEXTURE_PIXEL_SIZE.y) * outline_width;
    vec2 uv_left = uv + vec2(TEXTURE_PIXEL_SIZE.x, 0) * outline_width;
    vec2 uv_right = uv + vec2(-TEXTURE_PIXEL_SIZE.x, 0) * outline_width;

    // 采样四个方向的像素
    vec4 color_up = texture(TEXTURE, uv_up);
    vec4 color_down = texture(TEXTURE, uv_down);
    vec4 color_left = texture(TEXTURE, uv_left);
    vec4 color_right = texture(TEXTURE, uv_right);

    // 合并描边颜色
    vec4 outline = color_down + color_up + color_left + color_right;
    outline.rgb = outline_color.rgb;

    // 获取原始颜色
    vec4 original_color = texture(TEXTURE, UV);

    // 根据 alpha 混合：透明区域显示描边，不透明区域显示原图
    COLOR = mix(outline, original_color, original_color.a);
}
```

---

## 2. 像素化着色器

### 效果描述

将画面处理成像素风格，模拟复古游戏的视觉效果。

### 实现思路

- 根据指定的像素大小，计算每个像素块内的坐标
- 将 UV 坐标向下取整，实现像素对齐
- 通过调整像素块大小控制像素化程度

### 核心代码

```gdshader
shader_type canvas_item;

uniform float pixel_size = 4.0;  // 像素块大小

void fragment() {
    // 计算像素化后的 UV
    vec2 uv = floor(UV * pixel_size) / pixel_size;
    COLOR = texture(TEXTURE, uv);
}
```

---

## 3. 灰度/复古色着色器

### 效果描述

将图片转换为灰度图或带有复古色调，常用于实现老照片、怀旧风格或特殊滤镜效果。

### 实现思路

- 使用 Luma 公式（亮度公式）将 RGB 转换为灰度值
- 灰度系数：`gray = R * 0.299 + G * 0.587 + B * 0.114`
- 保留原始 alpha 通道以支持透明背景

### 核心代码

```gdshader
shader_type canvas_item;

void fragment() {
    vec4 color = texture(TEXTURE, UV);
    // Luma 公式计算灰度
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    COLOR = vec4(vec3(gray), color.a);
}
```

---

## 4. 溶解/燃烧效果

### 效果描述

实现物体逐渐溶解消失的效果，常用于角色死亡、物体销毁等场景。溶解边缘带有燃烧的色泽。

### 实现思路

- 使用噪声纹理作为溶解遮罩
- 通过 `dissolve_value` 控制溶解进度
- 使用 `smoothstep` 创建边缘过渡效果
- 在溶解边界混合燃烧颜色

### 核心代码

```gdshader
shader_type canvas_item;

uniform sampler2D dissolve_texture: source_color;
uniform float dissolve_value: hint_range(0, 1) = 1.0;
uniform float burn_size: hint_range(0.0, 1.0, 0.01) = 0.1;
uniform vec4 burn_color: source_color = vec4(1.0, 0.3, 0.0, 1.0);

void fragment() {
    vec4 main_texture = texture(TEXTURE, UV);
    vec4 noise_texture = texture(dissolve_texture, UV);

    // 计算燃烧边缘过渡
    float burn_size_step = burn_size * step(0.001, dissolve_value) * step(dissolve_value, 0.999);
    float threshold = smoothstep(noise_texture.x - burn_size_step, noise_texture.x, dissolve_value);
    float border = smoothstep(noise_texture.x, noise_texture.x + burn_size_step, dissolve_value);

    // 应用溶解 alpha 和燃烧颜色
    COLOR.a *= threshold;
    COLOR.rgb = mix(burn_color.rgb, main_texture.rgb, border);
}
```

### 使用说明

1. 创建 `NoiseTexture2D` 作为 `dissolve_texture`
2. 使用 "Simplex Smooth" 噪声类型
3. 调整 `dissolve_value`（0 = 完全溶解，1 = 未溶解）控制进度

---

## 5. 水波/折射效果

### 效果描述

模拟水面的波纹效果，包含波动和扭曲效果。

### 实现思路

- 使用噪声纹理驱动波纹动画
- 通过 `cos(TIME)` 生成随时间变化的波动
- 对 UV 坐标添加扰动实现折射效果
- 结合多方向波纹叠加

### 核心代码

```gdshader
shader_type canvas_item;

uniform sampler2D noise_tex;
uniform float speed = 0.25;      // 波纹速度
uniform float strength = 0.02;    // 波纹强度
uniform vec4 tint_color: source_color = vec4(1.0, 1.0, 1.0, 1.0);

void fragment() {
    vec2 uv = UV;

    // 生成波纹扰动
    float noise = texture(noise_tex, uv + vec2(TIME * speed, 0.0)).r;
    float noise2 = texture(noise_tex, uv + vec2(0.0, TIME * speed * 0.5)).r;

    // 扰动 UV 实现折射
    vec2 offset = vec2(
        cos(TIME * speed + uv.y * 10.0) * strength,
        sin(TIME * speed + uv.x * 10.0) * strength
    ) * (noise + noise2);

    vec4 color = texture(TEXTURE, uv + offset);
    COLOR = color * tint_color;
}
```

---

## 6. 模糊效果

### 效果描述

对图像进行模糊处理，常用于景深效果、UI 毛玻璃效果或运动模糊。

### 实现思路

- 对当前像素及其周围像素进行加权平均
- 使用高斯分布权重，中心像素权重最大
- 通过调整模糊半径控制模糊程度

### 核心代码

```gdshader
shader_type canvas_item;

uniform float blur_radius = 2.0;  // 模糊半径
uniform vec2 blur_direction = vec2(1.0, 0.0);  // 模糊方向

const float MATRIX[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void fragment() {
    vec2 uv = UV;
    vec2 texel_size = TEXTURE_PIXEL_SIZE;

    // 采样中心像素
    vec3 result = texture(TEXTURE, uv).rgb * MATRIX[0];

    // 采样周围像素（高斯权重）
    for (int i = 1; i < 5; i++) {
        float offset = float(i) * blur_radius;
        result += texture(TEXTURE, uv + texel_size * offset * blur_direction).rgb * MATRIX[i];
        result += texture(TEXTURE, uv - texel_size * offset * blur_direction).rgb * MATRIX[i];
    }

    vec4 original = texture(TEXTURE, uv);
    COLOR = vec4(result, original.a);
}
```

---

## 7. 发光/光晕效果

### 效果描述

为图像添加发光效果，常用于霓虹灯、魔法特效或 UI 高亮显示。

### 实现思路

- 采样中心像素及其周围像素
- 将采样结果叠加到原始颜色上
- 通过 `mix` 函数控制发光强度

### 核心代码

```gdshader
shader_type canvas_item;

uniform float glow_intensity = 0.5;  // 发光强度
uniform float glow_radius = 3.0;    // 发光半径

void fragment() {
    vec2 uv = UV;
    vec2 texel = TEXTURE_PIXEL_SIZE * glow_radius;

    // 采样中心
    vec4 color = texture(TEXTURE, uv);

    // 采样周围像素并叠加
    vec3 glow = vec3(0.0);
    for (float x = -2.0; x <= 2.0; x += 1.0) {
        for (float y = -2.0; y <= 2.0; y += 1.0) {
            vec2 offset = vec2(x, y) * texel;
            glow += texture(TEXTURE, uv + offset).rgb;
        }
    }
    glow /= 25.0;

    // 混合发光效果
    COLOR = color + vec4(glow * glow_intensity, 0.0);
}
```

### 流光效果（发光变体）

```gdshader
shader_type canvas_item;

uniform sampler2D light_vector;      // 流光引导图
uniform float width = 0.08;          // 流光宽度
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

## 8. 卡通渲染（Cel Shading）

### 效果描述

模拟卡通/动漫风格的渲染效果，通过离散的色调过渡创造手绘感。

### 实现思路

- 将光照强度离散化为多个阶梯
- 使用 `step` 或 `smoothstep` 创建色调边界
- 可选添加描边效果增强卡通感

### 核心代码

```gdshader
shader_type canvas_item;

uniform float levels = 3.0;  // 色调层级数
uniform vec4 light_color: source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform vec4 shadow_color: source_color = vec4(0.2, 0.2, 0.3, 1.0);

void fragment() {
    vec4 color = texture(TEXTURE, UV);

    // 简化光照计算（实际使用时替换为真实光照）
    float light = dot(color.rgb, vec3(0.33));

    // 离散化为多个层级
    light = floor(light * levels) / levels;

    // 根据光照层级混合颜色
    COLOR = mix(shadow_color, color * light_color, light);
}
```

---

## 9. 噪声纹理应用

### 效果描述

程序化生成各种自然效果，如云朵、烟雾、地形等。

### 实现思路

- 使用 Simplex 噪声或 Perlin 噪声
- 通过 fBM（分形布朗运动）叠加多层噪声
- 调整频率和振幅控制细节

### 核心代码

```gdshader
shader_type canvas_item;

uniform int octaves = 4;
uniform float frequency = 1.0;
uniform float amplitude = 0.5;
uniform float persistence = 0.5;

// 随机值
float rand(vec2 coord) {
    return fract(sin(dot(coord, vec2(56, 78))) * 1000.0);
}

// 噪声函数
float noise(vec2 coord) {
    vec2 i = floor(coord);
    vec2 f = fract(coord);

    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    vec2 cubic = f * f * (3.0 - 2.0 * f);
    return mix(a, b, cubic.x) + (c - a) * cubic.y * (1.0 - cubic.x) + (d - b) * cubic.x * cubic.y;
}

// fBM 分形布朗运动
float fbm(vec2 coord) {
    float value = 0.0;
    float scale = 0.5;

    for (int i = 0; i < octaves; i++) {
        value += noise(coord) * scale;
        coord *= 2.0;
        scale *= persistence;
    }

    return value;
}

void fragment() {
    vec2 uv = UV * frequency;
    float n = fbm(uv);
    COLOR = vec4(vec3(n), 1.0);
}
```

---

## 10. 混合模式（Blend Modes）

### 效果描述

实现 Photoshop 风格的混合模式，如正片叠底、滤色、叠加等。

### 实现思路

- 根据混合模式类型使用不同的数学公式
- 常见模式：Multiply（正片叠底）、Screen（滤色）、Overlay（叠加）

### 核心代码

```gdshader
shader_type canvas_item;

uniform sampler2D blend_texture: source_color;
uniform float opacity: hint_range(0.0, 1.0) = 1.0;
uniform int blend_mode = 0;  // 0=Multiply, 1=Screen, 2=Overlay

vec3 multiply(vec3 base, vec3 blend) {
    return base * blend;
}

vec3 screen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
}

vec3 overlay(vec3 base, vec3 blend) {
    return mix(
        2.0 * base * blend,
        1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
        step(0.5, base)
    );
}

void fragment() {
    vec4 base = texture(TEXTURE, UV);
    vec4 blend = texture(blend_texture, UV);

    vec3 result;
    if (blend_mode == 0) {
        result = multiply(base.rgb, blend.rgb);
    } else if (blend_mode == 1) {
        result = screen(base.rgb, blend.rgb);
    } else {
        result = overlay(base.rgb, blend.rgb);
    }

    COLOR = vec4(mix(base.rgb, result, opacity * blend.a), base.a);
}
```

---

## 相关教程

- [着色器简介](./intro) - Shader 基础概念与语法
- [着色器常用数学](./shader-math) - Shader 编程中的数学基础
- [着色器实现思路](./shader-implementation) - UV 操作、颜色处理、噪声应用等
