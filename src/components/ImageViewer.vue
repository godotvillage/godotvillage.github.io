<template>
  <Teleport to="body">
    <transition name="viewer-fade">
      <div v-if="visible" class="image-viewer-overlay" @click="close">
        <div class="image-viewer-close" @click="close">
          <el-icon :size="28"><Close /></el-icon>
        </div>
        <img :src="src" :alt="alt" class="image-viewer-img" @click.stop />
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

defineProps<{
  visible: boolean
  src: string
  alt?: string
}>()

const emit = defineEmits<{
  close: []
}>()

function close() {
  emit('close')
}
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.image-viewer-close {
  position: absolute;
  top: 24px;
  right: 24px;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  z-index: 1;
}
.image-viewer-close:hover {
  opacity: 1;
}

.image-viewer-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  cursor: default;
}

.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.25s;
}
.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}
</style>
