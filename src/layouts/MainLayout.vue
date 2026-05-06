<template>
  <div class="app-layout">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <router-link to="/" class="logo">
        <el-icon :size="24" color="#667eea"><Grid /></el-icon>
        <span class="logo-text">Godot新手村</span>
      </router-link>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/article" class="nav-item" :class="{ active: $route.path.startsWith('/article') }">
          <el-icon><Document /></el-icon>
          <span>文章</span>
        </router-link>
        <router-link to="/project" class="nav-item" :class="{ active: $route.path.startsWith('/project') }">
          <el-icon><FolderOpened /></el-icon>
          <span>项目</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧主内容区 -->
    <div class="main-wrapper">
      <!-- 顶部操作栏 -->
      <header class="top-header">
        <div class="header-left"></div>
        <div class="header-right">
          <!-- 搜索 -->
          <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            class="search-input"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />

          <!-- 消息通知 -->
          <div class="notification-icon" @click="router.push('/user/messages')">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
          </div>

          <!-- 登录状态 -->
          <template v-if="authStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="avatarUrl">
                  {{ authStore.userInfo?.nickname || authStore.userInfo?.userName?.charAt(0) }}
                </el-avatar>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="my-articles">
                    <el-icon><Document /></el-icon>我的文章
                  </el-dropdown-item>
                  <el-dropdown-item command="my-projects">
                    <el-icon><FolderOpened /></el-icon>我的项目
                  </el-dropdown-item>
                  <el-dropdown-item v-if="authStore.isAdmin" divided command="backend">
                    <el-icon><Setting /></el-icon>进入后台
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- 底部 -->
      <footer class="footer">
        <div class="footer-links">
          <a href="https://godotengine.org" target="_blank">Godot Engine</a>
          <span class="divider">|</span>
          <a href="https://github.com/godotvillage" target="_blank">GitHub</a>
          <span class="divider">|</span>
          <span>© 2024 Godot新手村</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, House, Document, FolderOpened, User, ArrowDown, SwitchButton, Grid, Bell, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { messageApi } from '@/api/message'
import { ElMessage } from 'element-plus'
import { getAvatarUrl } from '@/utils/avatar'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const unreadCount = ref(0)

const loadUnreadCount = async () => {
  if (!authStore.isLoggedIn) return
  try {
    const res = await messageApi.getUnreadCount()
    unreadCount.value = res.data
  } catch (error) {
    console.error('加载未读消息失败:', error)
  }
}

onMounted(() => {
  loadUnreadCount()
})

const avatarUrl = computed(() => {
  return getAvatarUrl(authStore.userInfo?.nickname || authStore.userInfo?.userName || authStore.userInfo?.email)
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/article', query: { search: searchQuery.value } })
  }
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'my-articles':
      router.push({ path: '/article', query: { authorId: authStore.userInfo?.id } })
      break
    case 'my-projects':
      router.push({ path: '/project', query: { author: authStore.userInfo?.userName } })
      break
    case 'backend':
      router.push('/backend/article')
      break
    case 'logout':
      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
}

.sidebar {
  width: 240px;
  background-color: #0B1120;
  border-right: 1px solid var(--color-secondary);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    text-decoration: none;
    
    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text);
    }
  }

  .nav-menu {
    flex: 1;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      text-decoration: none;
      color: #94A3B8;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        color: var(--color-text);
        background-color: rgba(255, 255, 255, 0.05);
      }

      &.active {
        color: var(--color-text);
        background-color: var(--color-secondary);
      }
    }
  }
}

.main-wrapper {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-header {
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  position: sticky;
  top: 0;
  z-index: 900;
  backdrop-filter: blur(8px);

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .search-input {
      width: 240px;
      
      :deep(.el-input__wrapper) {
        background-color: var(--color-secondary);
        box-shadow: none;
        border-radius: 20px;
        
        &.is-focus {
          box-shadow: 0 0 0 1px var(--color-primary) inset;
        }
        
        .el-input__inner {
          color: var(--color-text);
        }
      }
    }

    .notification-icon {
      cursor: pointer;
      color: #94A3B8;
      display: flex;
      align-items: center;
      transition: color 0.2s;

      &:hover {
        color: var(--color-text);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #94A3B8;
      transition: color 0.2s;

      &:hover {
        color: var(--color-text);
      }
    }
  }
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.footer {
  padding: 24px;
  border-top: 1px solid var(--color-secondary);
  margin-top: 40px;

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: #64748B;

    a {
      color: #64748B;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--color-text);
      }
    }

    .divider {
      color: var(--color-secondary);
    }
  }
}

/* 响应式处理 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-wrapper {
    margin-left: 0;
  }
}
</style>
