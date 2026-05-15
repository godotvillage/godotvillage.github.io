<template>
  <div class="app-layout">
    <!-- 移动端遮罩 -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- 左侧导航栏 -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <router-link to="/" class="logo">
        <el-icon :size="24" color="#667eea"><Grid /></el-icon>
        <span class="logo-text">Godot新手村</span>
      </router-link>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/mascot" class="nav-item" :class="{ active: $route.path.startsWith('/mascot') }">
          <el-icon><MagicStick /></el-icon>
          <span>看板娘</span>
        </router-link>
        <router-link to="/article" class="nav-item" :class="{ active: $route.path.startsWith('/article') }">
          <el-icon><Document /></el-icon>
          <span>文章</span>
        </router-link>
        <router-link to="/tutorial" class="nav-item" :class="{ active: $route.path.startsWith('/tutorial') }">
          <el-icon><Reading /></el-icon>
          <span>教程</span>
        </router-link>
        <router-link to="/project" class="nav-item" :class="{ active: $route.path.startsWith('/project') }">
          <el-icon><FolderOpened /></el-icon>
          <span>项目</span>
        </router-link>
        <router-link to="/assetweb" class="nav-item" :class="{ active: $route.path.startsWith('/assetweb') }">
          <el-icon><Collection /></el-icon>
          <span>资源网站</span>
        </router-link>
        <router-link to="/gamejam" class="nav-item" :class="{ active: $route.path.startsWith('/gamejam') }">
          <el-icon><Trophy /></el-icon>
          <span>GameJam</span>
        </router-link>
        <router-link to="/friendlink" class="nav-item" :class="{ active: $route.path.startsWith('/friendlink') }">
          <el-icon><Link /></el-icon>
          <span>友链</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧主内容区 -->
    <div class="main-wrapper">
      <!-- 顶部操作栏 -->
      <header class="top-header">
        <div class="header-left">
          <div class="hamburger" @click="sidebarOpen = !sidebarOpen">
            <el-icon :size="22"><Expand /></el-icon>
          </div>
        </div>
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

          <!-- 主题切换 -->
          <div class="theme-toggle" @click="themeStore.toggleTheme()" :title="themeStore.theme === 'dark' ? '切换亮色主题' : '切换暗色主题'">
            <el-icon :size="20" v-if="themeStore.theme === 'dark'"><Sunny /></el-icon>
            <el-icon :size="20" v-else><Moon /></el-icon>
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
          <transition name="fade">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, House, Document, Reading, FolderOpened, User, ArrowDown, SwitchButton, Grid, Bell, Setting, Trophy, Link, Collection, Sunny, Moon, MagicStick, Expand } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { messageApi } from '@/api/message'
import { ElMessage } from 'element-plus'
import { getAvatarUrl } from '@/utils/avatar'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const sidebarOpen = ref(false)
const searchQuery = ref('')
const unreadCount = ref(0)

// 移动端切换页面后自动关闭侧边栏
watch(
  () => router.currentRoute.value,
  () => {
    sidebarOpen.value = false
  }
)

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
      router.push({ path: '/project', query: { author: authStore.userInfo?.nickname || authStore.userInfo?.userName } })
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
  background-color: var(--color-background);
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
      color: var(--text-regular);
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        color: var(--color-text);
        background-color: var(--color-secondary);
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
      color: var(--text-regular);
      display: flex;
      align-items: center;
      transition: color 0.2s;

      .badge {
        display: flex;
        align-items: center;
      }

      &:hover {
        color: var(--color-text);
      }
    }

    .theme-toggle {
      cursor: pointer;
      color: var(--text-regular);
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
      color: var(--text-regular);
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
    color: var(--text-secondary);

    a {
      color: var(--text-secondary);
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

.hamburger {
  display: none;
  cursor: pointer;
  color: var(--text-regular);
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: var(--color-text);
    background-color: var(--color-secondary);
  }
}

.sidebar-overlay {
  display: none;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 999;
  }

  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }

  .main-wrapper {
    margin-left: 0;
    overflow-x: hidden;
  }

  .top-header {
    padding: 0 16px;

    .header-right {
      gap: 12px;

      .search-input {
        width: 140px;
      }
    }
  }
}
</style>
