<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
  <ImageViewer :visible="viewer.visible.value" :src="viewer.src.value" :alt="viewer.alt.value" @close="viewer.close" />
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useThemeStore } from '@/stores/theme'
import { useImageViewer } from '@/composables/useImageViewer'
import ImageViewer from '@/components/ImageViewer.vue'

useThemeStore()
const viewer = useImageViewer()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  min-height: 100vh;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
}

#app {
  width: 100%;
  min-height: 100vh;
}

[data-theme="dark"] {

/* md-editor-v3 暗黑主题样式 */
.md-editor,
.md-editor-dark {
  --md-color: #f8fafc;
  --md-bk-color: #1e293b;
  --md-border-color: #334155;
  --md-scrollbar-thumb-color: #475569;
  --md-color-hover: #e2e8f0;
  --md-hover-color: #334155;
  --md-bk-hover-color: #334155;
  --md-theme-base-color: #f8fafc;
  --md-theme-bg-color-inset: #1e293b;
  --md-border-active-color: #22c55e;
  --md-scrollbar-bg-color: #0f172a;
  background-color: #1e293b;
  color: #f8fafc;
}

.md-editor .md-editor-toolbar,
.md-editor-dark .md-editor-toolbar {
  background-color: #1e293b !important;
  border-bottom: 1px solid #334155;
}

.md-editor .md-editor-toolbar-item,
.md-editor-dark .md-editor-toolbar-item {
  color: #94a3b8 !important;
}

.md-editor .md-editor-toolbar-item:hover,
.md-editor-dark .md-editor-toolbar-item:hover {
  color: #f8fafc !important;
  background-color: #334155 !important;
}

.md-editor .md-editor-content,
.md-editor-dark .md-editor-content {
  background-color: #1e293b !important;
}

.md-editor .md-editor-input,
.md-editor-dark .md-editor-input {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  caret-color: #f8fafc;
}

.md-editor .md-editor-preview,
.md-editor-dark .md-editor-preview {
  background-color: #1e293b !important;
}

.md-editor .md-editor-footer,
.md-editor-dark .md-editor-footer {
  background-color: #1e293b !important;
  border-top: 1px solid #334155;
}

.md-editor textarea,
.md-editor-dark textarea {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}

.md-editor .md-editor-edit-input,
.md-editor-dark .md-editor-edit-input {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}

/* 修复工具栏下拉菜单 */
.md-editor .md-editor-toolbar-dropdown,
.md-editor-dark .md-editor-toolbar-dropdown {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.md-editor .md-editor-toolbar-dropdown-item,
.md-editor-dark .md-editor-toolbar-dropdown-item {
  color: #f8fafc !important;
}

.md-editor .md-editor-toolbar-dropdown-item:hover,
.md-editor-dark .md-editor-toolbar-dropdown-item:hover {
  background-color: #334155 !important;
}

/* 修复预览区域 */
.md-editor .md-editor-preview-wrapper,
.md-editor-dark .md-editor-preview-wrapper {
  background-color: #1e293b !important;
}

/* 修复代码块 */
.md-editor pre,
.md-editor-dark pre {
  background-color: #0f172a !important;
  border: 1px solid #334155;
}

.md-editor code,
.md-editor-dark code {
  background-color: #0f172a !important;
  color: #f8fafc !important;
}

/* 修复表格 */
.md-editor table,
.md-editor-dark table {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.md-editor th,
.md-editor-dark th {
  background-color: #0f172a !important;
  color: #f8fafc !important;
  border-color: #334155 !important;
}

.md-editor td,
.md-editor-dark td {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  border-color: #334155 !important;
}

/* 修复输入框占位符 */
.md-editor .md-editor-input::placeholder,
.md-editor-dark .md-editor-input::placeholder {
  color: #64748b !important;
}

/* 修复引用块 */
.md-editor blockquote,
.md-editor-dark blockquote {
  background-color: #0f172a !important;
  border-left-color: #22c55e !important;
  color: #94a3b8 !important;
}

/* 修复列表 */
.md-editor li,
.md-editor-dark li {
  color: #f8fafc !important;
}

/* 修复链接 */
.md-editor a,
.md-editor-dark a {
  color: #22c55e !important;
}

.md-editor a:hover,
.md-editor-dark a:hover {
  color: #16a34a !important;
}

}
</style>