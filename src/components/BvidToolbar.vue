<template>
  <NormalToolbar title="插入B站视频" @onClick="handleClick">
    <svg
      class="md-editor-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polygon points="10,8 16,12 10,16" />
    </svg>
  </NormalToolbar>
</template>

<script setup lang="ts">
import { NormalToolbar } from 'md-editor-v3'
import { useBvidInsert } from '@/composables/useBvidInsert'

const insertBvid = useBvidInsert()

function handleClick() {
  insertBvid()
}
</script>
