---
title: 着色器常用数学
author: 陌上竹
date: 2026-03-23
category:
  - 教程
tag:
  - 着色器
  - 数学
---

本文整理了 Godot 4.x 官方文档中的 Shading Language 参考，是游戏开发中 Shader 编程的数学基础汇总。

<!-- more -->

## 1. 基础数学函数

### 1.1 绝对值与取整

#### abs() - 绝对值

返回参数的绝对值。

```gdshader
float abs(float x)
vec2 abs(vec2 x)
vec3 abs(vec3 x)
vec4 abs(vec4 x)
```

**示例**：
```gdshader
void fragment() {
    float value = abs(-5.0);           // 结果: 5.0
    vec2 dir = abs(vec2(-1.0, 2.0));    // 结果: vec2(1.0, 2.0)
}
```

**应用场景**：计算距离、确保值为正、镜像效果。

---

#### floor() - 向下取整

返回小于或等于参数的最大整数。

```gdshader
float floor(float x)
vec2 floor(vec2 x)
```

**示例**：
```gdshader
void fragment() {
    float f = floor(3.7);   // 结果: 3.0
    float g = floor(-2.3);  // 结果: -3.0
}
```

**应用场景**：创建像素化效果、网格对齐、步进动画。

---

#### ceil() - 向上取整

返回大于或等于参数的最小整数。

```gdshader
float ceil(float x)
vec2 ceil(vec2 x)
```

**示例**：
```gdshader
void fragment() {
    float c = ceil(2.1);   // 结果: 3.0
    float d = ceil(-4.8);  // 结果: -4.0
}
```

---

#### round() - 四舍五入

返回最接近参数的整数。

```gdshader
float round(float x)
```

**示例**：
```gdshader
void fragment() {
    float r = round(2.5);  // 结果: 2.0 (Banker's rounding)
    float s = round(2.4);  // 结果: 2.0
}
```

> 注意：Godot 使用 Banker's rounding（银行家舍入），即对 .5 的情况舍入到偶数。

---

#### fract() - 取小数部分

返回参数的小数部分。

```gdshader
float fract(float x)
```

**公式**：`fract(x) = x - floor(x)`

**示例**：
```gdshader
void fragment() {
    float f = fract(3.14159);  // 结果: 0.14159
    float g = fract(-1.5);     // 结果: 0.5
}
```

**应用场景**：创建重复图案、UV动画、环形渐变。

---

### 1.2 极值与限制

#### min() - 最小值

返回两个值中的较小者。

```gdshader
float min(float x, float y)
vec2 min(vec2 x, vec2 y)
```

**示例**：
```gdshader
void fragment() {
    float m = min(3.0, 5.0);  // 结果: 3.0
    vec2 v = min(vec2(1.0, 3.0), vec2(2.0, 0.0)); // 结果: vec2(1.0, 0.0)
}
```

---

#### max() - 最大值

返回两个值中的较大者。

```gdshader
float max(float x, float y)
```

**示例**：
```gdshader
void fragment() {
    float m = max(3.0, 5.0);  // 结果: 5.0
}
```

---

#### clamp() - 限制范围

将值限制在指定范围内。

```gdshader
float clamp(float x, float min_val, float max_val)
```

**公式**：`clamp(x, min, max) = min(max(x, min_val), max_val)`

**示例**：
```gdshader
void fragment() {
    float c = clamp(0.8, 0.0, 1.0);   // 结果: 0.8
    float d = clamp(-0.5, 0.0, 1.0);  // 结果: 0.0
    float e = clamp(2.0, 0.0, 1.0);   // 结果: 1.0
}
```

**应用场景**：颜色插值、强度限制、动画平滑。

---

#### step() - 阶梯函数

如果 `x >= edge` 返回 1.0，否则返回 0.0。

```gdshader
float step(float edge, float x)
```

**示例**：
```gdshader
void fragment() {
    float s = step(0.5, 0.8);  // 结果: 1.0
    float t = step(0.5, 0.3);  // 结果: 0.0
}
```

**应用场景**：创建硬边缘过渡、阈值效果、卡通渲染。

---

### 1.3 插值函数

#### mix() - 线性插值

在两个值之间进行线性插值。

```gdshader
float mix(float x, float y, float alpha)
vec2 mix(vec2 x, vec2 y, float alpha)
```

**公式**：`mix(x, y, a) = x * (1 - a) + y * a`

**参数说明**：
- `x`: 起始值
- `y`: 结束值
- `alpha`: 插值因子，0.0 返回 x，1.0 返回 y

**示例**：
```gdshader
void fragment() {
    vec3 color_start = vec3(1.0, 0.0, 0.0);  // 红色
    vec3 color_end = vec3(0.0, 0.0, 1.0);    // 蓝色
    vec3 blended = mix(color_start, color_end, 0.5); // 紫色
}
```

**应用场景**：颜色渐变、位置插值、动画过渡。

---

#### lerp() - 线性插值

与 `mix()` 功能相同，是 GLSL ES 3.0 的别名。

```gdshader
float lerp(float x, float y, float alpha)
```

---

#### smoothstep() - 平滑插值

使用 Hermite 插值实现平滑过渡。

```gdshader
float smoothstep(float edge0, float edge1, float x)
```

**特性**：
- 当 `x <= edge0` 时返回 0.0
- 当 `x >= edge1` 时返回 1.0
- 在 `edge0` 和 `edge1` 之间进行平滑插值

**公式**：
```
t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
result = t * t * (3.0 - 2.0 * t)
```

**示例**：
```gdshader
void fragment() {
    float s = smoothstep(0.0, 1.0, 0.3);  // 结果: ~0.216
    float t = smoothstep(0.0, 1.0, 0.7);  // 结果: ~0.784
}
```

**应用场景**：抗锯齿边缘、柔和渐变、卡通描边。

---

## 2. 三角函数

### 2.1 基础三角函数

#### sin() - 正弦

返回角度的 sine 值。

```gdshader
float sin(float angle)
```

**参数**：角度（弧度）

**示例**：
```gdshader
void fragment() {
    float s = sin(3.14159 / 2.0);  // 结果: ~1.0
}
```

---

#### cos() - 余弦

返回角度的 cosine 值。

```gdshader
float cos(float angle)
```

**示例**：
```gdshader
void fragment() {
    float c = cos(0.0);  // 结果: 1.0
}
```

---

#### tan() - 正切

返回角度的 tangent 值。

```gdshader
float tan(float angle)
```

---

### 2.2 反三角函数

#### asin() - 反正弦

返回 sine 值为 x 的角度。

```gdshader
float asin(float x)  // 返回范围: [-PI/2, PI/2]
```

---

#### acos() - 反余弦

返回 cosine 值为 x 的角度。

```gdshader
float acos(float x)  // 返回范围: [0, PI]
```

---

#### atan() - 反正切

返回 tangent 值为 y/x 的角度。

```gdshader
float atan(float y, float x)  // 返回范围: [-PI, PI]
```

**示例**：
```gdshader
void fragment() {
    float angle = atan(1.0, 1.0);  // 结果: PI/4 (45度)
}
```

---

### 2.3 实用技巧

#### 创建圆形

```gdshader
shader_type canvas_item;

void fragment() {
    vec2 center = vec2(0.5, 0.5);
    float radius = 0.4;

    // 计算到中心的距离
    float dist = length(UV - center);

    // 使用 step 创建圆形边缘
    float circle = step(radius, dist);

    COLOR = vec4(vec3(circle), 1.0);
}
```

#### 创建环形

```gdshader
void fragment() {
    vec2 center = vec2(0.5, 0.5);
    float inner_radius = 0.2;
    float outer_radius = 0.4;

    float dist = length(UV - center);
    float ring = step(inner_radius, dist) * step(dist, outer_radius);

    COLOR = vec4(vec3(ring), 1.0);
}
```

#### 波浪效果

```gdshader
void fragment() {
    float wave = sin(UV.y * 10.0 + TIME * 2.0) * 0.1 + 0.5;
    COLOR = vec4(vec3(wave), 1.0);
}
```

---

## 3. 向量运算

### 3.1 点乘 (Dot Product)

#### dot()

计算两个向量的点积。

```gdshader
float dot(vec2 x, vec2 y)
float dot(vec3 x, vec3 y)
float dot(vec4 x, vec4 y)
```

**公式**：
- 2D: `dot(a, b) = a.x * b.x + a.y * b.y`
- 3D: `dot(a, b) = a.x * b.x + a.y * b.y + a.z * b.z`

**几何意义**：
- `dot(v1, v2) = |v1| * |v2| * cos(theta)`
- 当返回值为 0 时，两向量垂直
- 当返回值 > 0 时，两向量夹角小于 90 度
- 当返回值 < 0 时，两向量夹角大于 90 度

**示例**：
```gdshader
void fragment() {
    vec2 a = vec2(1.0, 0.0);
    vec2 b = vec2(0.707, 0.707);
    float d = dot(a, b);  // 结果: ~0.707
}
```

**应用场景**：
- 判断方向（正面/背面）
- 光照计算（漫反射）
- 向量投影

---

### 3.2 叉乘 (Cross Product)

#### cross()

计算两个向量的叉积（仅 3D 向量）。

```gdshader
vec3 cross(vec3 x, vec3 y)
```

**公式**：
```
cross(a, b) = vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
)
```

**几何意义**：
- 返回一个与两向量垂直的新向量
- 方向遵循右手定则
- 大小：`|cross| = |a| * |b| * sin(theta)`

**示例**：
```gdshader
void fragment() {
    vec3 right = vec3(1.0, 0.0, 0.0);
    vec3 forward = vec3(0.0, 0.0, 1.0);
    vec3 up = cross(right, forward);  // 结果: vec3(0.0, 1.0, 0.0)
}
```

**应用场景**：
- 计算法线
- 确定方向转向
- 3D 空间中的垂直向量

---

### 3.3 长度与归一化

#### length()

计算向量的长度（模）。

```gdshader
float length(vec2 v)
float length(vec3 v)
float length(vec4 v)
```

**公式**：`length(v) = sqrt(v.x * v.x + v.y * v.y + ...)`

**示例**：
```gdshader
void fragment() {
    float len = length(vec2(3.0, 4.0));  // 结果: 5.0
}
```

---

#### normalize()

返回方向相同但长度为 1 的单位向量。

```gdshader
vec2 normalize(vec2 v)
vec3 normalize(vec3 v)
```

**公式**：`normalize(v) = v / length(v)`

**示例**：
```gdshader
void fragment() {
    vec2 dir = normalize(vec2(3.0, 4.0));  // 结果: vec2(0.6, 0.8)
}
```

> 注意：不要对零向量使用 normalize，会导致除零错误。

**安全版本**：
```gdshader
vec2 safe_normalize(vec2 v) {
    float len = length(v);
    return len > 0.0 ? v / len : vec2(0.0);
}
```

---

### 3.4 距离

#### distance()

计算两点之间的距离。

```gdshader
float distance(vec2 a, vec2 b)
float distance(vec3 a, vec3 b)
```

**公式**：`distance(a, b) = length(a - b)`

**示例**：
```gdshader
void fragment() {
    float dist = distance(vec2(0.0, 0.0), vec2(3.0, 4.0));  // 结果: 5.0
}
```

---

### 3.5 其他向量函数

#### reflect() - 反射

```gdshader
vec2 reflect(vec2 I, vec2 N)  // I: 入射方向, N: 法线
vec3 reflect(vec3 I, vec3 N)
```

**公式**：`reflect(I, N) = I - 2.0 * dot(N, I) * N`

**示例**：
```gdshader
void fragment() {
    vec3 I = vec3(1.0, -1.0, 0.0);   // 入射方向
    vec3 N = vec3(0.0, 1.0, 0.0);    // 法线
    vec3 R = reflect(I, N);          // 反射方向
}
```

---

#### refract() - 折射

```gdshader
vec3 refract(vec3 I, vec3 N, float eta)
```

**参数**：`eta = n1 / n2`（折射率比值）

---

## 4. 矩阵运算基础

### 4.1 矩阵类型

Godot Shader 中的矩阵类型：

```gdshader
mat2  // 2x2 矩阵
mat3  // 3x3 矩阵
mat4  // 4x4 矩阵
```

### 4.2 矩阵乘法

```gdshader
mat2 result = mat2 * mat2
vec2 result = mat2 * vec2
```

### 4.3 常用矩阵

#### 单位矩阵

```gdshader
mat2 identity = mat2(1.0, 0.0, 0.0, 1.0);
mat3 identity = mat3(1.0);
mat4 identity = mat4(1.0);
```

#### 旋转矩阵

```gdshader
// 2D 旋转
mat2 rotation(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}
```

#### 缩放矩阵

```gdshader
// 2D 缩放
mat2 scale(vec2 s) {
    return mat2(s.x, 0.0, 0.0, s.y);
}
```

### 4.4 变换函数

#### transform() - 向量变换

```gdshader
vec3 transformed = transform(mat4, vec3)
```

---

## 5. 噪声函数

### 5.1 随机数

#### 1D 随机

```gdshader
float random(float x) {
    return fract(sin(x) * 43758.5453);
}

void fragment() {
    float r = random(1.0);  // 0.0~1.0 之间的随机值
}
```

#### 2D 随机

```gdshader
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
```

### 5.2 值噪声 (Value Noise)

```gdshader
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // 四个角的随机值
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // 平滑插值
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void fragment() {
    float n = noise(UV * 10.0);
    COLOR = vec4(vec3(n), 1.0);
}
```

### 5.3 梯度噪声 (Gradient Noise)

```gdshader
vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gradient_noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
```

### 5.4 FBM (分形布朗运动)

```gdshader
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}

void fragment() {
    float pattern = fbm(UV * 4.0);
    COLOR = vec4(vec3(pattern), 1.0);
}
```

**参数说明**：
- `octaves`: 叠加的噪声层数（通常 4-6）
- `amplitude`: 振幅，每层递减
- `frequency`: 频率，每层倍增

**应用场景**：
- 地形生成
- 云朵效果
- 纹理混合
- 艺术化渲染

---

## 6. 空间变换

### 6.1 坐标系统

#### 世界坐标 (World Space)

物体在游戏世界中的绝对位置。

#### 局部坐标 (Local Space)

相对于父节点的相对位置。

#### UV 坐标 (UV Space)

2D 纹理上的像素位置，范围通常为 [0, 1]。

```gdshader
void fragment() {
    // UV 从左下角 (0,0) 到右上角 (1,1)
    vec2 uv = UV;

    // 居中后的 UV，范围 [-0.5, 0.5]
    vec2 centered = UV - 0.5;
}
```

### 6.2 坐标变换函数

#### 缩放 UV

```gdshader
void fragment() {
    vec2 scaled_uv = UV * 2.0;  // 放大 2 倍
}
```

#### 偏移 UV

```gdshader
void fragment() {
    vec2 offset_uv = UV + vec2(0.1, 0.2);  // 偏移
}
```

#### 旋转 UV

```gdshader
void fragment() {
    float angle = TIME;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotated_uv = rotation * (UV - 0.5) + 0.5;
}
```

### 6.3 3D 空间变换

```gdshader
// 在顶点着色器中使用
void vertex() {
    // 模型到世界
    vec4 world_pos = MODEL_MATRIX * vec4(VERTEX, 1.0);

    // 世界到视图
    vec4 view_pos = VIEW_MATRIX * world_pos;

    // 投影
    vec4 clip_pos = PROJECTION_MATRIX * view_pos;
}
```

---

## 7. 实用数学技巧

### 7.1 使用 sin/cos 创建圆形

```gdshader
shader_type canvas_item;

void fragment() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = UV - center;

    // 使用 atan 和 sin/cos 创建圆
    float angle = atan(pos.y, pos.x);
    float radius = 0.3 + sin(angle * 6.0) * 0.05;

    float circle = 1.0 - smoothstep(radius, radius + 0.01, length(pos));

    COLOR = vec4(vec3(circle), 1.0);
}
```

### 7.2 使用 mod 创建重复图案

#### 网格图案

```gdshader
void fragment() {
    vec2 tiled = fract(UV * 10.0);
    float grid = step(0.95, tiled.x) + step(0.95, tiled.y);
    COLOR = vec4(vec3(grid), 1.0);
}
```

#### 砖墙图案

```gdshader
void fragment() {
    vec2 brick = UV * vec2(6.0, 12.0);
    brick.x += step(1.0, mod(brick.y, 2.0)) * 0.5;
    brick = fract(brick);

    float pattern = step(0.05, brick.x) * step(0.05, brick.y);
    COLOR = vec4(vec3(pattern), 1.0);
}
```

### 7.3 极坐标变换

```gdshader
void fragment() {
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = UV - center;

    // 转换为极坐标
    float radius = length(delta);
    float angle = atan(delta.y, delta.x);

    // 归一化角度到 [0, 1]
    angle = (angle + 3.14159) / (2.0 * 3.14159);

    // 使用极坐标创建效果
    float pattern = sin(angle * 20.0) * sin(radius * 30.0);

    COLOR = vec4(vec3(pattern * 0.5 + 0.5), 1.0);
}
```

### 7.4 平滑边缘

```gdshader
void fragment() {
    vec2 center = vec2(0.5, 0.5);
    float radius = 0.4;

    float dist = length(UV - center);

    // 抗锯齿边缘
    float alpha = 1.0 - smoothstep(radius - 0.01, radius + 0.01, dist);

    COLOR = vec4(1.0, 0.5, 0.0, alpha);
}
```

### 7.5 条纹动画

```gdshader
void fragment() {
    float stripe = sin(UV.y * 20.0 + TIME * 5.0);
    stripe = stripe * 0.5 + 0.5;  // 归一化到 [0, 1]

    COLOR = vec4(vec3(stripe), 1.0);
}
```

### 7.6 脉冲效果

```gdshader
void fragment() {
    float pulse = sin(TIME * 3.0) * 0.5 + 0.5;

    vec2 center = vec2(0.5, 0.5);
    float dist = length(UV - center);

    // 脉冲扩散效果
    float wave = sin(dist * 20.0 - TIME * 5.0) * 0.5 + 0.5;
    float alpha = smoothstep(pulse, pulse - 0.1, wave);

    COLOR = vec4(vec3(alpha), 1.0);
}
```

### 7.7 颜色通道分离

```gdshader
void fragment() {
    float offset = sin(TIME * 2.0) * 0.02;

    float r = texture(TEXTURE, UV + vec2(offset, 0.0)).r;
    float g = texture(TEXTURE, UV).g;
    float b = texture(TEXTURE, UV - vec2(offset, 0.0)).b;

    COLOR = vec4(r, g, b, 1.0);
}
```

---

## 附录：常用常量

```gdshader
const float PI = 3.14159265359;        // 圆周率
const float TAU = 6.28318530718;       // 2 * PI
const float DEG_TO_RAD = PI / 180.0;   // 度转弧度
const float RAD_TO_DEG = 180.0 / PI;   // 弧度转度
const float SQRT2 = 1.41421356237;     // 平方根 2
const float INF = 1e10;                // 无穷大
```

---

## 相关教程

- [着色器简介](./intro) - Shader 基础概念与语法
- [着色器实现思路](./shader-implementation) - UV 操作、颜色处理、噪声应用等
- [着色器常见案例](./shader-common-cases) - 描边、像素化、灰度、溶解等实战案例
