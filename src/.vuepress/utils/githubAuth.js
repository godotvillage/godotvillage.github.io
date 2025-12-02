import { baseUrl } from './request'

// GitHub身份验证服务
class GitHubAuthService {
  constructor() {
    this.clientId = 'Ov23lijKGj89a9GItFXq' // 这里需要替换为实际的GitHub OAuth App Client ID
    // this.redirectUri = window.location.origin + '/auth/callback'
    this.redirectUri = window.location.href
    this.storageKey = 'github_user'
    this.tokenKey = 'github_token'
  }

  // 获取当前登录用户
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.storageKey)
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 获取访问令牌
  getAccessToken() {
    return localStorage.getItem(this.tokenKey)
  }

  // 检查是否已登录
  isLoggedIn() {
    return !!this.getCurrentUser() && !!this.getAccessToken()
  }

  // 启动GitHub OAuth登录流程
  login() {
    const state = this.generateState()
    localStorage.setItem('oauth_state', state)
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'read:user user:email',
      state: state,
      allow_signup: 'true'
    })

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  // 处理OAuth回调
  async handleCallback(code, state) {
    try {
      // 验证state参数
      const storedState = localStorage.getItem('oauth_state')
      if (state !== storedState) {
        throw new Error('Invalid state parameter')
      }
      localStorage.removeItem('oauth_state')

      // 这里需要通过后端服务来交换访问令牌
      // 由于GitHub OAuth需要client_secret，不能在前端直接处理
      const response = await fetch(baseUrl + '/auth/github/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      const { access_token } = data.data
      // 获取用户信息
      const userInfo = await this.fetchUserInfo(access_token)
      
      // 保存用户信息和令牌
      localStorage.setItem(this.tokenKey, access_token)
      localStorage.setItem(this.storageKey, JSON.stringify(userInfo))
      
      return userInfo
      // return {}
    } catch (error) {
      console.error('GitHub登录失败:', error)
      throw error
    }
  }

  // 获取GitHub用户信息
  async fetchUserInfo(token) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }

      const userInfo = await response.json()
      return {
        id: userInfo.id,
        login: userInfo.login,
        name: userInfo.name,
        email: userInfo.email,
        avatar_url: userInfo.avatar_url,
        html_url: userInfo.html_url
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登出
  logout() {
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem('oauth_state')
  }

  // 检查用户是否是项目作者
  isProjectAuthor(project, user = null) {
    if (!user) {
      user = this.getCurrentUser()
    }
    if (!user || !project) {
      return false
    }
    // 检查作者字段是否匹配GitHub用户名
    return project.githubUser === user.login
  }

  // 生成随机state参数
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // 模拟登录（用于开发测试）
  mockLogin(username) {
    const mockUser = {
      id: Date.now(),
      login: username,
      name: username,
      email: `${username}@example.com`,
      avatar_url: `https://github.com/${username}.png`,
      html_url: `https://github.com/${username}`
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(mockUser))
    localStorage.setItem(this.tokenKey, 'mock_token_' + Date.now())
    
    return mockUser
  }
}

// 创建单例实例
export const githubAuth = new GitHubAuthService()

// 导出类以便测试
export { GitHubAuthService }