import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const src = ref('')
const alt = ref('')

export function useImageViewer() {
  function show(imgSrc: string, imgAlt?: string) {
    src.value = imgSrc
    alt.value = imgAlt || ''
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && visible.value) {
      close()
    }
  }

  function onClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName !== 'IMG') return

    // 跳过标记为不可放大的图片
    if (target.hasAttribute('data-no-zoom')) return

    // 跳过链接内的图片（如看板娘入口）
    if (target.closest('a')) return

    // 跳过用户头像（el-avatar 内部 <img>）
    if (target.closest('.el-avatar')) return

    const img = target as HTMLImageElement
    if (img.src) {
      show(img.src, img.alt)
    }
  }

  onMounted(() => {
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('keydown', onKeydown)
  })

  return { visible, src, alt, show, close }
}
