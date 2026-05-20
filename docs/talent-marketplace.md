# 人才库功能设计文档

## 概述

为 Godot 新手村论坛新增"人才库"功能，允许用户展示自己的六维技能评分（策划/程序/美术/音乐/组织/资金）、技能标签和自我描述（Markdown），其他用户可以按评分范围或标签筛选浏览人才。

## 用户场景

### 六维能力自评标准

| 等级 | 策划 | 程序 | 美术 | 音乐 | 组织 | 资金 |
|------|------|------|------|------|------|------|
| 0 | 对游戏设计毫无概念 | 完全不会编程 | 没有任何美术基础 | 没有任何乐理知识 | 无项目管理意识 | 没有任何可用资金 |
| 1 | 有模糊的游戏想法 | 了解基础编程概念 | 能使用简单工具 | 了解基础乐理 | 有基础任务清单 | 少量个人资金 |
| 2 | 能写出简短概念文档 | 能使用引擎基础功能 | 能制作简单像素图 | 能制作简单循环BGM | 能制定简单时间表 | 可支撑1-2个月 |
| 3 | 能完成基础GDD | 能独立实现核心玩法 | 能创作风格统一素材 | 能为不同场景配乐 | 使用项目管理工具 | 可完成小型项目 |
| 4 | 能设计完整玩法循环 | 掌握物理/存档/UI框架 | 掌握角色道具设计 | 掌握音效设计 | 能管理2-4人小团队 | 可支撑6-12个月 |
| 5 | 掌握多种设计理论 | 能构建可维护框架 | 能独立完成美术风格 | 能制作完整原声带 | 掌握敏捷开发方法 | 有独立发行预算 |
| 6 | 能输出商业级GDD | 代码架构清晰 | 商业级美术产出 | 自适应音乐系统 | 完善工作流程文档 | 能承担小团队薪酬 |
| 7 | 对游戏性有深刻洞察 | 引擎底层理解 | 多种风格切换自如 | 跨风格创作能力 | 能协调多方资源 | 资金充裕 |
| 8 | 跨类型设计能力强 | 能构建自定义引擎模块 | 概念艺术级水准 | 标志性音乐能力 | 发行级管理能力 | 能吸引外部投资 |
| 9 | 行业高水准 | 行业高水准 | 行业高水准 | 行业高水准 | 行业高水准 | 系列游戏投资能力 |
| 10 | 定义游戏设计新范式 | 引擎级技术能力 | 定义独立游戏视觉标杆 | 文化现象级音乐 | 方法论被行业借鉴 | 财务完全自由 |

评分区间 0-10，步长 0.5。

### 技能标签分类

各分类预设常用标签，用户也可以自定义：

- **策划**: 系统设计、关卡设计、数值策划、叙事设计、玩法创新、UI/UX设计、商业变现
- **程序**: 2D、3D、Godot、Unity、Shader、网络同步、AI、物理模拟、工具开发、编辑器扩展
- **美术**: 像素风、手绘、低多边形、厚涂、美式动漫、萌系、概念设计、3D建模、骨骼动画、帧动画、UI设计、特效
- **音乐**: 主题音乐、背景音乐、音效设计、声乐、人声、电子、管弦、8-bit、氛围音乐
- **组织**: 项目管理、敏捷开发、团队协调、进度跟踪、文档管理、社区运营、远程协作
- **资金**: 为爱发电、小有资产、接受外包、寻求投资、投资方、众筹经验、发行合作

## 前端设计

### 路由

| 路径 | 页面 | 权限 |
|------|------|------|
| `/talent` | 人才列表（含筛选） | 公开 |
| `/talent/my` | 我的档案（表单编辑） | 需登录 |
| `/talent/:id` | 人才详情 | 公开 |

### 左侧菜单

MainLayout 侧边栏新增"人才库"入口，使用 `UserFilled` 图标，位于 GameJam 之前。

### 页面结构

#### 人才列表页 (`TalentList.vue`)

- **筛选区**（可折叠）:
  - 六维分数范围滑块（`el-slider` range 模式，0-10，step 0.5）
  - 标签多选（`el-select` multiple filterable，按分类分组）
  - 关键词搜索（描述内容）
  - 重置 / 搜索按钮
- **卡片网格**: 3 列网格布局展示 `TalentCard`
- **分页**: `el-pagination`
- **状态**: 加载中 / 空数据 / 数据展示

#### 我的档案页 (`TalentMy.vue`)

- **六维能力自评**: 6 个 `el-slider`（0-10，step 0.5，show-input 显示数值）
- **技能标签**: 6 个分类各自一个 `el-select`（multiple + filterable + allow-create）
- **自我描述**: `MdEditor`（md-editor-v3），支持 Markdown + 图片上传
- **操作**: 保存（创建/更新）、删除档案（需二次确认）
- 一个用户只能维护一份档案（无则创建，有则更新）

#### 人才详情页 (`TalentDetail.vue`)

- **用户信息**: 头像、昵称、更新时间
- **雷达图**: `TalentRadarChart`（ECharts 雷达图，支持亮/暗主题）
- **评分明细**: 六维进度条列表
- **标签展示**: 按分类分组 `el-tag`
- **自我介绍**: Markdown 渲染（使用 `marked`）

### 组件

#### TalentCard.vue

- 显示头像、昵称、更新时间
- 六维评分小进度条（2 列网格）
- 标签摘要（最多展示 5 个，超出显示 +N）
- 点击跳转详情页
- hover 浮起效果

#### TalentRadarChart.vue

- 基于 ECharts 雷达图
- 接收 `scores: Record<string, number>`（6 个维度的分值）
- 监听 `themeStore.theme` 自动切换亮/暗配色
- 响应窗口 resize

### 数据文件

`src/data/talentTags.ts`:
- `TALENT_CATEGORIES`: 六维分类定义
- `TALENT_TAG_OPTIONS`: 各分类预设标签
- `DIMENSION_KEYS`: 维度字段映射

### API 模块

`src/api/talent.ts`:

```
GET    /api/talent       →  列表（公开，支持筛选/分页/排序）
GET    /api/talent/{id}  →  详情（公开）
GET    /api/talent/my    →  我的档案（需登录）
POST   /api/talent       →  创建/更新（需登录，upsert 模式）
DELETE /api/talent       →  删除（需登录，软删除）
```

查询参数 `TalentQueryDto`:
- 分页: `page`, `pageSize`
- 排序: `sortBy`, `sortOrder`（默认按 UpdatedTime 倒序）
- 分数范围: `minDesign`, `maxDesign`, `minProgramming`, `maxProgramming` 等（共 12 个）
- 标签: `tags`（逗号分隔字符串）
- 关键词: `keyword`（搜索描述内容）

## 后端设计

### 数据模型

#### TalentProfile

| 字段 | 类型 | 说明 |
|------|------|------|
| Id | Guid | 主键 |
| UserId | Guid | FK → AppUser，唯一索引 |
| DesignScore | decimal(3,1) | 策划评分 0-10 |
| ProgrammingScore | decimal(3,1) | 程序评分 0-10 |
| ArtScore | decimal(3,1) | 美术评分 0-10 |
| MusicScore | decimal(3,1) | 音乐评分 0-10 |
| OrganizationScore | decimal(3,1) | 组织评分 0-10 |
| FundingScore | decimal(3,1) | 资金评分 0-10 |
| Description | longtext | Markdown 自我描述 |
| CreatedTime | datetime | 创建时间 |
| UpdatedTime | datetime | 更新时间 |
| IsDeleted | bool | 软删除标记 |

#### TalentTag

| 字段 | 类型 | 说明 |
|------|------|------|
| Id | Guid | 主键 |
| TalentProfileId | Guid | FK → TalentProfile |
| Category | varchar(50) | 分类: 策划/程序/美术/音乐/组织/资金 |
| Tag | varchar(100) | 标签文本 |

### 服务层

`TalentService` 实现 `ITalentService`:
- 注入 `ApplicationDbContext` + `ICurrentUserProvider`
- `GetListAsync`: 动态构建查询条件，支持多维分数范围、标签 JOIN 筛选、关键词模糊搜索
- `CreateOrUpdateAsync`: 先查是否存在 UserId 匹配的档案，有则更新（删旧标签重建），无则新建
- `GetMyProfileAsync`: 从 JWT 取当前 UserId 查询

### 文件清单

```
# 后端
GodotVillageBackend.Domain/Entities/TalentProfile.cs
GodotVillageBackend.Domain/Entities/TalentTag.cs
GodotVillageBackend.Application.Contract/Dtos/Talent/TalentDto.cs
GodotVillageBackend.Application.Contract/IServices/ITalentService.cs
GodotVillageBackend.Application/Services/TalentService.cs
GodotVillageBackend.API/Controllers/TalentController.cs
GodotVillageBackend.EntityFrameworkCore/ApplicationDbContext.cs  (修改)

# 前端
src/api/talent.ts
src/data/talentTags.ts
src/components/TalentCard.vue
src/components/TalentRadarChart.vue
src/views/talent/TalentList.vue
src/views/talent/TalentMy.vue
src/views/talent/TalentDetail.vue
src/router/index.ts              (修改)
src/layouts/MainLayout.vue       (修改)
```

## 验证步骤

1. 启动后端，确认 `GET /api/talent` 返回空列表
2. 启动前端，访问 `/talent` 查看列表页（空状态）
3. 登录后进入 `/talent/my` 填写档案并保存
4. 返回列表页确认新档案出现
5. 使用筛选器测试分数范围和标签筛选
6. 点击卡片进入 `/talent/:id` 详情页检查雷达图、标签分组、Markdown 渲染
7. 修改档案测试更新逻辑（upsert）
8. 未登录访问 `/talent/my` 验证重定向到登录页
9. 移动端测试响应式布局
