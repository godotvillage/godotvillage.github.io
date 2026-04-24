<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
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
  background-color: #0f172a;
  color: #f8fafc;
}

#app {
  width: 100%;
  min-height: 100vh;
}

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

/* 修复可能残留的白色背景 */
/* 表格 */
.el-table {
  background-color: transparent !important;
  color: #f8fafc !important;
  --el-table-header-bg-color: #0f172a;
  --el-table-header-text-color: #f8fafc;
  --el-table-row-hover-bg-color: #334155;
  --el-table-border-color: #334155;
  --el-table-tr-bg-color: transparent;
  --el-table-header-cell-bg-color: #0f172a;
  --el-table-cell-bg-color: transparent;
}

.el-table th.el-table__cell {
  background-color: #0f172a !important;
  color: #f8fafc !important;
  font-weight: 600;
  border-bottom: 1px solid #334155 !important;
}

.el-table__header {
  background-color: #0f172a !important;
}

.el-table__body tr:hover > td.el-table__cell {
  background-color: #334155 !important;
}

.el-table__body td.el-table__cell {
  background-color: transparent !important;
  border-bottom: 1px solid #334155 !important;
}

.el-table__empty-text {
  color: #64748b !important;
}

.el-table--striped .el-table__body tr:hover > td.el-table__cell {
  background-color: #334155 !important;
}

.el-dialog {
  background-color: #1e293b !important;
  border: 1px solid #334155;
}

.el-dialog__header {
  border-bottom: 1px solid #334155;
}

.el-dialog__body {
  color: #f8fafc;
}

.el-dialog__title {
  color: #f8fafc;
}

.el-input__wrapper {
  background-color: #0f172a !important;
  border-color: #334155 !important;
}

.el-input__inner {
  color: #f8fafc !important;
}

.el-input__wrapper:hover {
  border-color: #475569 !important;
}

.el-input__wrapper.is-focus {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2) !important;
}

.el-textarea__inner {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

.el-textarea__inner:hover {
  border-color: #475569 !important;
}

.el-textarea__inner:focus {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2) !important;
}

.el-select__wrapper {
  background-color: #0f172a !important;
  border-color: #334155 !important;
}

.el-select__wrapper:hover {
  border-color: #475569 !important;
}

.el-select-dropdown {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.el-select-dropdown__item {
  color: #f8fafc !important;
}

.el-select-dropdown__item:hover {
  background-color: #334155 !important;
}

.el-select-dropdown__item.is-selected {
  background-color: #22c55e !important;
  color: #0f172a !important;
}

.el-form-item__label {
  color: #f8fafc !important;
}

.el-checkbox__label {
  color: #f8fafc !important;
}

.el-tag {
  border-color: #334155 !important;
}

.el-button--primary {
  --el-button-bg-color: #22c55e;
  --el-button-border-color: #22c55e;
  --el-button-hover-bg-color: #16a34a;
  --el-button-hover-border-color: #16a34a;
  --el-button-text-color: #0f172a;
}

.el-message-box {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.el-message-box__title {
  color: #f8fafc !important;
}

.el-message-box__content {
  color: #94a3b8 !important;
}

.el-picker-panel {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

.el-date-picker__header {
  color: #f8fafc !important;
}

.el-pagination {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: #1e293b;
  --el-pagination-hover-color: #22c55e;
}

.el-pagination button {
  background-color: #1e293b !important;
  color: #94a3b8 !important;
}

.el-pagination .el-pager li {
  background-color: #1e293b !important;
  color: #94a3b8 !important;
}

.el-pagination .el-pager li:hover {
  color: #f8fafc !important;
}

.el-pagination .el-pager li.is-active {
  background-color: #22c55e !important;
  color: #0f172a !important;
}

.el-dropdown-menu {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.el-dropdown-menu__item {
  color: #f8fafc !important;
}

.el-dropdown-menu__item:hover {
  background-color: #334155 !important;
}

.el-avatar {
  background-color: #334155 !important;
  color: #f8fafc !important;
}

/* Tooltip 和 Popover */
.el-popper,
.el-popover {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

.el-popper__arrow::before {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.el-tooltip__popper {
  background-color: #1e293b !important;
}

/* Popconfirm 气泡确认框 */
.el-popconfirm {
  --el-popconfirm-padding: 16px;
}

.el-popconfirm__main {
  color: #f8fafc;
}

/* Backtop 回到顶部 */
.el-backtop {
  background-color: #1e293b !important;
  color: #94a3b8 !important;
}

.el-backtop:hover {
  background-color: #334155 !important;
}

/* Loading 加载 */
.el-loading-mask {
  background-color: rgba(15, 23, 42, 0.8) !important;
}

.el-loading-spinner {
  color: #22c55e !important;
}

/* Message 消息提示 */
.el-message {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

/* Notification 通知 */
.el-notification {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.el-notification__title {
  color: #f8fafc !important;
}

.el-notification__content {
  color: #94a3b8 !important;
}

/* Drawer 抽屉 */
.el-drawer {
  background-color: #1e293b !important;
}

.el-drawer__header {
  border-bottom: 1px solid #334155;
  color: #f8fafc !important;
}

/* Table 表格强化样式 */
.el-table {
  background-color: transparent !important;
  color: #f8fafc !important;
}

.el-table__header {
  background-color: #0f172a !important;
}

.el-table__header-cell {
  background-color: #0f172a !important;
  color: #f8fafc !important;
  font-weight: 600;
  border-bottom: 1px solid #334155 !important;
}

.el-table__body tr {
  background-color: transparent !important;
}

.el-table__body tr:hover > td {
  background-color: #334155 !important;
}

.el-table__body td {
  border-bottom: 1px solid #334155 !important;
}

.el-table__empty-text {
  color: #64748b !important;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #334155 !important;
}

/* 分页组件 */
.el-pagination__total {
  color: #94a3b8 !important;
}

.el-pagination__jump {
  color: #94a3b8 !important;
}

/* Form 表单 */
.el-form-item__label {
  color: #f8fafc !important;
}

.el-form-item__error {
  color: #ef4444 !important;
}

/* Breadcrumb 面包屑 */
.el-breadcrumb {
  color: #64748b !important;
}

.el-breadcrumb__inner {
  color: #94a3b8 !important;
}

.el-breadcrumb__inner:hover {
  color: #f8fafc !important;
}

.el-breadcrumb__separator {
  color: #475569 !important;
}

/* Steps 步骤条 */
.el-steps {
  --el-step-border-color: #334155;
  --el-step-bg-color: #1e293b;
}

.el-step__title {
  color: #94a3b8 !important;
}

.el-step__description {
  color: #64748b !important;
}

/* Tabs 标签页 */
.el-tabs__item {
  color: #94a3b8 !important;
}

.el-tabs__item:hover {
  color: #f8fafc !important;
}

.el-tabs__item.is-active {
  color: #22c55e !important;
}

.el-tabs__active-bar {
  background-color: #22c55e !important;
}

/* Timeline 时间线 */
.el-timeline-item__content {
  color: #f8fafc !important;
}

.el-timeline-item__timestamp {
  color: #64748b !important;
}

/* Calendar 日历 */
.el-calendar {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

.el-calendar__header {
  border-bottom-color: #334155 !important;
}

.el-calendar__title {
  color: #f8fafc !important;
}

.el-calendar-table td {
  color: #94a3b8 !important;
}

.el-calendar-table td.is-selected {
  background-color: #22c55e !important;
  color: #0f172a !important;
}

/* Card 卡片 */
.el-card {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

/* Descriptions 描述列表 */
.el-descriptions {
  --el-descriptions-table-border: 1px solid #334155;
}

.el-descriptions__label {
  background-color: #0f172a !important;
  color: #f8fafc !important;
}

.el-descriptions__value {
  background-color: #1e293b !important;
  color: #94a3b8 !important;
}

/* Image 图片 */
.el-image__placeholder {
  background-color: #1e293b !important;
}

.el-image__error {
  background-color: #1e293b !important;
  color: #64748b !important;
}

/* Badge 徽章 */
.el-badge__content {
  background-color: #ef4444 !important;
}

/* Skeleton 骨架屏 */
.el-skeleton {
  --el-skeleton-color: #334155;
  --el-skeleton-to-color: #475569;
}
</style>