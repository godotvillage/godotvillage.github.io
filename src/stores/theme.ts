import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', () => {
  const stored = (localStorage.getItem('theme') as Theme) || 'dark'
  const theme = ref<Theme>(stored)

  function applyTheme(t: Theme) {
    const el = document.documentElement
    el.setAttribute('data-theme', t)
    if (t === 'dark') {
      el.classList.add('dark')
    } else {
      el.classList.remove('dark')
    }
  }

  applyTheme(theme.value)

  watch(theme, (t) => {
    applyTheme(t)
    localStorage.setItem('theme', t)
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
})
