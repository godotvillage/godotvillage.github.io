# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Godot新手村论坛 - 基于 Vue 3 + TypeScript 的中文社区论坛，面向 Godot 游戏引擎开发者。

## 开发命令

```bash
npm install          # 安装依赖
npm run dev         # 启动开发服务器 (端口 3000)
npm run build       # 类型检查 + 生产构建
npm run preview     # 预览生产构建
npm run lint        # ESLint 检查并自动修复
```

**API 代理配置**: 开发环境下 `/api` 请求代理到 `http://localhost:5123`

## 技术栈

- **前端框架**: Vue 3.4 + Composition API + TypeScript 5.4
- **构建工具**: Vite 5.1
- **UI 组件库**: Element Plus 2.5 (自动导入)
- **状态管理**: Pinia
- **路由**: Vue Router 4.3
- **HTTP 客户端**: Axios
- **编辑器**: md-editor-v3 (Markdown), @vueup/vue-quill (富文本)
- **日期处理**: dayjs
- **样式**: SCSS + CSS 自定义属性

## 架构

```
src/
├── api/           # API 请求模块 (基于 Axios)
├── assets/styles/ # 全局 SCSS 样式
├── components/    # 可复用组件
├── layouts/       # 页面布局 (MainLayout, BackendLayout)
├── router/        # Vue Router 配置及路由守卫
├── stores/        # Pinia 状态管理
└── views/         # 页面组件 (按功能模块组织)
```

### API 设计

- RESTful 风格，基础路径通过 `VITE_API_BASE_URL` 配置 (默认 `/api`)
- 认证方式: JWT Bearer Token，存储于 `localStorage.accessToken`
- 响应格式: `{ success: boolean, message: string, data: any }`
- 请求/响应拦截器位于 `src/api/request.ts`

### 权限控制

- 角色: 普通用户 / Admin
- 权限标记: `hasPermission(permission)` 方法
- 管理员路由位于 `/backend` 路径下
- 路由元信息 `requiresAuth` / `requiresAdmin` 控制访问

### 自动导入

- Vue, Vue Router, Pinia 自动导入
- Element Plus 组件自动导入
- 类型声明文件: `src/auto-imports.d.ts`, `src/components.d.ts`

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/api/request.ts` | Axios 实例，拦截器配置 |
| `src/stores/auth.ts` | 认证状态、用户信息、权限管理 |
| `src/router/index.ts` | 路由配置、导航守卫 |
| `src/main.ts` | 应用入口，Element Plus 图标注册 |
| `vite.config.ts` | Vite 配置、路径别名、API 代理 |
| `.env` | 环境变量 (API 基础路径) |
