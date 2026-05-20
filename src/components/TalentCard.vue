<template>
  <div class="talent-card card" @click="$emit('click')">
    <div class="talent-header">
      <el-avatar :size="40" :src="avatarUrl">
        {{ talent.nickname || talent.userName?.charAt(0) }}
      </el-avatar>
      <div class="talent-info">
        <span class="talent-name">{{ talent.nickname || talent.userName }}</span>
        <span class="talent-time">{{ formatTime(talent.updatedTime || talent.createdTime) }}</span>
      </div>
    </div>

    <div class="talent-chart">
      <TalentRadarChart :scores="radarScores" :size="200" />
    </div>

    <div class="talent-tags" v-if="displayTags.length > 0">
      <el-tag
        v-for="tag in displayTags.slice(0, 5)"
        :key="tag.tag"
        size="small"
        type="info"
      >
        {{ tag.tag }}
      </el-tag>
      <el-tag v-if="displayTags.length > 5" size="small" type="info">
        +{{ displayTags.length - 5 }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TalentDto } from '@/api/talent'
import { DIMENSION_KEYS } from '@/data/talentTags'
import { getAvatarUrl } from '@/utils/avatar'
import dayjs from 'dayjs'

const props = defineProps<{
  talent: TalentDto
}>()

defineEmits<{
  click: []
}>()

const avatarUrl = computed(() => getAvatarUrl(props.talent.nickname || props.talent.userName))

const radarScores = computed(() => {
  const scores: Record<string, number> = {}
  for (const dim of DIMENSION_KEYS) {
    scores[dim.key] = (props.talent as any)[dim.key] ?? 0
  }
  return scores
})

const displayTags = computed(() => props.talent.tags || [])

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD')
}
</script>

<style scoped lang="scss">
.talent-card {
  cursor: pointer;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.talent-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.talent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.talent-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.talent-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.talent-chart {
  margin-bottom: 8px;
}

.talent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
