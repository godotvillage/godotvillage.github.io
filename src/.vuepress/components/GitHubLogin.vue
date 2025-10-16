<template>
  <div class="github-login">
    <!-- 已登录状态 -->
    <div v-if="isLoggedIn" class="user-info">
      <img :src="currentUser.avatar_url" :alt="currentUser.login" class="user-avatar" />
      <div class="user-details">
        <span class="user-name">{{ currentUser.name || currentUser.login }}</span>
        <span class="user-login">@{{ currentUser.login }}</span>
      </div>
      <div class="user-actions">
        <button @click="logout" class="logout-btn" title="登出">
          🚪
        </button>
      </div>
    </div>

    <!-- 未登录状态 -->
    <div v-else class="login-prompt">
      <button @click="login" class="login-btn">
        <svg class="github-icon" viewBox="0 0 16 16" width="16" height="16">
          <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        使用 GitHub 登录
      </button>
      
      <!-- 开发模式下的模拟登录 -->
      <!-- <div v-if="isDevelopment" class="dev-login">
        <hr class="divider" />
        <p class="dev-note">开发模式 - 模拟登录</p>
        <div class="mock-login-form">
          <input 
            v-model="mockUsername" 
            placeholder="输入GitHub用户名" 
            class="mock-input"
            @keyup.enter="mockLogin"
          />
          <button @click="mockLogin" class="mock-login-btn">模拟登录</button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { githubAuth } from '../utils/githubAuth'

export default {
  name: 'GitHubLogin',
  data() {
    return {
      currentUser: null,
      mockUsername: '',
      isDevelopment: process.env.NODE_ENV === 'development'
    }
  },
  computed: {
    isLoggedIn() {
      return !!this.currentUser
    }
  },
  mounted() {
    // 检查URL中是否有OAuth回调参数
    this.handleOAuthCallback()
    
    this.loadUserInfo()
    
    // 监听存储变化，以便在其他标签页登录时同步状态
    window.addEventListener('storage', this.handleStorageChange)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
  },
  methods: {
    async handleOAuthCallback() {
      // 获取URL参数
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      
      // 如果URL中有code和state参数，说明是OAuth回调
      if (code && state) {
        // 清理URL参数，避免刷新页面时重复处理
        const newUrl = window.location.pathname + window.location.hash
        window.history.replaceState({}, document.title, newUrl)
        try {
          // 调用githubAuth.handleCallback处理回调
          const user = await githubAuth.handleCallback(code, state)
          this.currentUser = user
          this.$emit('login', user)
        } catch (error) {
          console.error('OAuth回调处理失败:', error)
          this.$emit('error', 'GitHub登录失败，请重试')
          
          // 清理URL参数
          const newUrl = window.location.pathname + window.location.hash
          window.history.replaceState({}, document.title, newUrl)
        }
      }
    },

    loadUserInfo() {
      this.currentUser = githubAuth.getCurrentUser()
    },

    login() {
      try {
        githubAuth.login()
      } catch (error) {
        console.error('登录失败:', error)
        this.$emit('error', '登录失败，请重试')
      }
    },

    logout() {
      try {
        githubAuth.logout()
        this.currentUser = null
        this.$emit('logout')
      } catch (error) {
        console.error('登出失败:', error)
      }
    },

    mockLogin() {
      if (!this.mockUsername.trim()) {
        alert('请输入GitHub用户名')
        return
      }

      try {
        const user = githubAuth.mockLogin(this.mockUsername.trim())
        this.currentUser = user
        this.mockUsername = ''
        this.$emit('login', user)
      } catch (error) {
        console.error('模拟登录失败:', error)
        this.$emit('error', '模拟登录失败')
      }
    },

    handleStorageChange(event) {
      if (event.key === 'github_user') {
        this.loadUserInfo()
      }
    }
  }
}
</script>

<style scoped>
.github-login {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 用户信息显示 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
  border: 1px solid var(--vp-c-divider, #e1e4e8);
  border-radius: 6px;
  font-size: 14px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider, #e1e4e8);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: var(--vp-c-text-1, #24292f);
  line-height: 1;
}

.user-login {
  font-size: 12px;
  color: var(--vp-c-text-2, #656d76);
  line-height: 1;
}

.user-actions {
  margin-left: 8px;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--vp-c-text-2, #656d76);
  transition: all 0.2s;
}

.logout-btn:hover {
  background: var(--vp-c-bg-mute, #f6f8fa);
  color: var(--vp-c-text-1, #24292f);
}

/* 登录按钮 */
.login-prompt {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--vp-c-accent-bg, #2ea44f);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background: var(--vp-c-accent-hover, #2c974b);
}

.github-icon {
  flex-shrink: 0;
}

/* 开发模式模拟登录 */
.dev-login {
  padding-top: 12px;
}

.divider {
  border: none;
  border-top: 1px solid var(--vp-c-divider, #e1e4e8);
  margin: 0 0 12px 0;
}

.dev-note {
  font-size: 12px;
  color: var(--vp-c-text-2, #656d76);
  margin: 0 0 8px 0;
  text-align: center;
}

.mock-login-form {
  display: flex;
  gap: 8px;
}

.mock-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider, #e1e4e8);
  border-radius: 4px;
  font-size: 12px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, #24292f);
}

.mock-login-btn {
  padding: 6px 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
  border: 1px solid var(--vp-c-divider, #e1e4e8);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--vp-c-text-1, #24292f);
  transition: all 0.2s;
}

.mock-login-btn:hover {
  background: var(--vp-c-bg-mute, #f6f8fa);
}

/* 暗色模式适配 */
[data-theme='dark'] .user-info {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

[data-theme='dark'] .user-avatar {
  border-color: var(--vp-c-divider);
}

[data-theme='dark'] .user-name {
  color: var(--vp-c-text-1);
}

[data-theme='dark'] .user-login {
  color: var(--vp-c-text-2);
}

[data-theme='dark'] .logout-btn {
  color: var(--vp-c-text-2);
}

[data-theme='dark'] .logout-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

[data-theme='dark'] .login-btn {
  background: var(--vp-c-accent-bg);
}

[data-theme='dark'] .login-btn:hover {
  background: var(--vp-c-accent-hover);
}

[data-theme='dark'] .dev-note {
  color: var(--vp-c-text-2);
}

[data-theme='dark'] .mock-input {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

[data-theme='dark'] .mock-login-btn {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

[data-theme='dark'] .mock-login-btn:hover {
  background: var(--vp-c-bg-mute);
}

[data-theme='dark'] .divider {
  border-color: var(--vp-c-divider);
}
</style>