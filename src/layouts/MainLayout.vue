<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <router-link to="/" class="logo">
            <el-icon :size="28"><Grid /></el-icon>
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

          <!-- 登录状态 -->
          <template v-if="authStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="user-info">
                <el-avatar :size="36" :src="avatarUrl">
                  {{ authStore.userInfo?.nickname || authStore.userInfo?.userName?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ authStore.userInfo?.nickname || authStore.userInfo?.userName }}</span>
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
                  <el-dropdown-item command="my-messages">
                    <el-icon><ChatDotRound /></el-icon>我的消息
                    <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge" />
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
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="https://godotengine.org" target="_blank">Godot Engine</a>
          <span class="divider">|</span>
          <a href="https://github.com/godotvillage" target="_blank">GitHub</a>
          <span class="divider">|</span>
          <span>© 2024 Godot新手村</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, House, Document, FolderOpened, User, ArrowDown, SwitchButton, Grid, ChatDotRound, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { messageApi } from '@/api/message'
import { ElMessage } from 'element-plus'

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

const avatarUrl = authStore.userInfo?.email
  ? `https://api.dicebear.com/7.x/initials/svg?seed=${authStore.userInfo.nickname || authStore.userInfo.userName}`
  : ''

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
    case 'my-messages':
      router.push('/user/messages')
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
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    height: var(--header-height);
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--primary-color);

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .nav-menu {
    display: flex;
    gap: 8px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-regular);
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background: var(--bg-color);
        color: var(--primary-color);
      }

      &.active {
        background: #ecf5ff;
        color: var(--primary-color);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .search-input {
      width: 200px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: var(--bg-color);
      }

      .username {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 24px 0;
}

.footer {
  background: var(--card-bg);
  border-top: 1px solid var(--border-light);
  padding: 24px 0;
  margin-top: auto;

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    text-align: center;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--text-secondary);

    a {
      color: var(--text-secondary);
      text-decoration: none;

      &:hover {
        color: var(--primary-color);
      }
    }

    .divider {
      color: var(--border-color);
    }
  }
}
</style>
