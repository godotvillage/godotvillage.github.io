<template>
  <div class="backend-layout">
    <aside class="backend-sidebar">
      <div class="sidebar-header">
        <h2>管理后台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/backend/article" class="nav-item" :class="{ active: route.path.startsWith('/backend/article') }">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </router-link>
        <router-link to="/backend/project" class="nav-item" :class="{ active: route.path.startsWith('/backend/project') }">
          <el-icon><FolderOpened /></el-icon>
          <span>项目管理</span>
        </router-link>
        <router-link to="/backend/user" class="nav-item" :class="{ active: route.path.startsWith('/backend/user') }">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>
      </nav>
    </aside>
    <main class="backend-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Document, FolderOpened, User } from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style scoped lang="scss">
.backend-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

.backend-sidebar {
  width: 240px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  padding: 20px 0;

  .sidebar-header {
    padding: 0 20px 20px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 20px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 12px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;

      &:hover {
        background: var(--bg-color);
        color: var(--text-primary);
      }

      &.active {
        background: var(--primary-color);
        color: #fff;
      }

      .badge {
        margin-left: auto;
      }
    }
  }
}

.backend-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
