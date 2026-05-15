import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
request.interceptors.response.use(
  (response) => {
    // 204 No Content — 无响应体，直接返回成功
    if (response.status === 204) {
      return { success: true, data: null }
    }

    const res = response.data

    // 如果是标准ApiResponse格式
    if (res.hasOwnProperty('success')) {
      if (!res.success) {
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      return res
    }

    return res
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      // 优先使用服务端返回的消息
      const serverMsg = data?.message
      const isLoginPage = router.currentRoute.value.path === '/login'

      switch (status) {
        case 401:
          ElMessage.error(serverMsg || '登录已过期，请重新登录')
          if (!isLoginPage) {
            const authStore = useAuthStore()
            authStore.logout()
            router.push('/login')
          }
          break
        case 403:
          ElMessage.error(serverMsg || '没有权限访问该资源')
          break
        case 404:
          ElMessage.error(serverMsg || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(serverMsg || '服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(serverMsg || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查您的连接')
    }
    return Promise.reject(error)
  }
)

export default request
