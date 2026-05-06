import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('accessToken'))

  const isLoggedIn = computed(() => !!token.value)

  const isAdmin = computed(() => {
    if (!userInfo.value) return false
    return userInfo.value.roles.some(role => role.name === 'Admin')
  })

  // 从 localStorage 恢复用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo)
    } catch {
      localStorage.removeItem('userInfo')
    }
  }

  function setAuth(accessToken: string, info: UserInfo) {
    token.value = accessToken
    userInfo.value = info
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
  }

  function hasPermission(permission: string): boolean {
    if (!userInfo.value) return false
    return userInfo.value.permissions.includes(permission)
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isAdmin,
    setAuth,
    logout,
    hasPermission
  }
})
