# Godot新手村网站项目

## 简介
Godot新手村网站项目

## 安装启动

### 环境要求
- Node.js 22+ 
- npm 或 yarn 包管理器

### 安装依赖
```bash
# 使用 npm 安装
npm install

# 或使用 yarn 安装
yarn install
```

### 开发模式启动
```bash
# 启动开发服务器
npm run docs:dev

# 或使用 yarn
yarn docs:dev

# 清除缓存后启动（解决缓存问题时使用）
npm run docs:clean-dev
```

开发服务器启动后，通常会在 `http://localhost:8080` 访问网站。

### 构建生产版本
```bash
# 构建静态文件
npm run docs:build

# 或使用 yarn
yarn docs:build
```

构建完成后，静态文件将生成在 `src/.vuepress/dist` 目录中。


### 项目结构说明
```
src/
├── README.md          # 首页
├── intro.md           # 介绍页面
├── demo/              # 演示文档
├── discussion/        # 讨论区
├── discussionList/    # 讨论列表
├── game/              # 游戏相关
│   ├── list.md        # 游戏列表
│   ├── play.md        # 游戏试玩
│   ├── upload.md      # 游戏上传
│   └── README.md
└── gamejam/           # GameJam 活动页
    └── README.md
```

### 技术栈
- VuePress 2.0.0-rc.24
- VuePress Theme Hope 2.0.0-rc.94
- Vue 3.5.17
- Vite 构建工具

## 更新网站

本项目已配置 GitHub Actions 自动部署功能，当代码推送到主分支时会自动构建并部署网站。

### 自动部署流程

1. **提交代码**：将你的更改提交到 Git 仓库
2. **推送到远程仓库**：推送代码到 GitHub
3. **自动构建部署**：GitHub Actions 会自动触发以下流程：
   - 检测到代码推送
   - 自动安装项目依赖
   - 执行构建命令生成静态文件
   - 将构建产物部署到 GitHub Pages
4. **访问更新后的网站**：部署完成后，访问 [https://godotvillage.github.io](https://godotvillage.github.io) 即可看到更新的内容

### 注意事项

- 部署过程通常需要 2-5 分钟完成
- 可以在仓库的 **Actions** 标签页查看部署状态和日志
- 如果部署失败，请检查构建日志中的错误信息
- 确保提交的代码没有语法错误，否则可能导致构建失败

### 手动触发部署
如果需要手动触发部署，可以：
1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择对应的工作流
4. 点击 **Run workflow** 按钮