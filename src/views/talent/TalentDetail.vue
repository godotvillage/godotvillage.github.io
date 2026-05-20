<template>
  <div class="talent-detail-page page-container" v-loading="loading">
    <template v-if="profile">
      <!-- 头部 -->
      <div class="detail-header card">
        <el-avatar :size="64" :src="avatarUrl">
          {{ profile.nickname || profile.userName?.charAt(0) }}
        </el-avatar>
        <div class="header-info">
          <h1 class="header-name">{{ profile.nickname || profile.userName }}</h1>
          <span class="header-time">
            更新于 {{ dayjs(profile.updatedTime || profile.createdTime).format('YYYY-MM-DD HH:mm') }}
          </span>
        </div>
      </div>

      <!-- 雷达图 + 分数 -->
      <div class="detail-body">
        <div class="card chart-card">
          <h3 class="card-title">七维能力图</h3>
          <TalentRadarChart :scores="radarScores" />
        </div>

        <div class="card scores-card">
          <h3 class="card-title">能力评分</h3>
          <div class="scores-list">
            <div v-for="dim in DIMENSION_KEYS" :key="dim.key" class="score-row">
              <span class="score-label">{{ dim.label }}</span>
              <el-progress
                :percentage="(profile[dim.key as keyof typeof profile] as number) * 10"
                :stroke-width="8"
                color="var(--color-primary)"
              />
              <span class="score-num">{{ profile[dim.key as keyof typeof profile] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      <div class="card tags-card" v-if="groupedTags.length > 0">
        <h3 class="card-title">技能标签</h3>
        <div v-for="group in groupedTags" :key="group.category" class="tag-group">
          <span class="tag-category">{{ group.category }}</span>
          <div class="tag-items">
            <el-tag v-for="tag in group.tags" :key="tag" type="info">{{ tag }}</el-tag>
          </div>
        </div>
      </div>

      <!-- Markdown 描述 -->
      <div class="card desc-card" v-if="profile.description">
        <h3 class="card-title">自我介绍</h3>
        <div class="markdown-body" v-html="renderedDescription"></div>
      </div>
    </template>

    <div v-else-if="!loading" class="empty-state">
      <el-empty description="档案不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { talentApi } from '@/api/talent'
import type { TalentDto } from '@/api/talent'
import { DIMENSION_KEYS } from '@/data/talentTags'
import { getAvatarUrl } from '@/utils/avatar'
import { marked } from 'marked'
import dayjs from 'dayjs'

const route = useRoute()
const loading = ref(true)
const profile = ref<TalentDto | null>(null)

const avatarUrl = computed(() => getAvatarUrl(profile.value?.nickname || profile.value?.userName))

const radarScores = computed(() => {
  if (!profile.value) return {}
  const scores: Record<string, number> = {}
  for (const dim of DIMENSION_KEYS) {
    scores[dim.key] = (profile.value as any)[dim.key] ?? 0
  }
  return scores
})

const groupedTags = computed(() => {
  if (!profile.value?.tags) return []
  const groups: Record<string, string[]> = {}
  for (const t of profile.value.tags) {
    if (!groups[t.category]) groups[t.category] = []
    groups[t.category].push(t.tag)
  }
  return Object.entries(groups).map(([category, tags]) => ({ category, tags }))
})

const renderedDescription = computed(() => {
  if (!profile.value?.description) return ''
  return marked(profile.value.description) as string
})

onMounted(async () => {
  try {
    const id = route.params.id as string
    const res = await talentApi.getById(id)
    profile.value = res.data
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.talent-detail-page {
  padding: 24px 32px;
  max-width: 900px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  margin-bottom: 24px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.header-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.detail-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
}

.chart-card,
.scores-card {
  padding: 24px;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 10px;

  .score-label {
    font-size: 14px;
    color: var(--text-secondary);
    width: 56px;
    flex-shrink: 0;
  }

  .score-num {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    width: 28px;
    text-align: right;
    flex-shrink: 0;
  }

  :deep(.el-progress) {
    flex: 1;
  }
}

.tags-card {
  padding: 24px;
  margin-bottom: 24px;
}

.tag-group {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
}

.tag-category {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 12px;
  vertical-align: middle;
}

.tag-items {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  vertical-align: middle;
}

.desc-card {
  padding: 24px;
}

.markdown-body {
  color: var(--color-text);
  line-height: 1.8;
  font-size: 15px;

  :deep(h1), :deep(h2), :deep(h3) {
    color: var(--color-text);
    margin: 16px 0 8px;
  }

  :deep(p) {
    margin: 8px 0;
  }

  :deep(a) {
    color: var(--color-primary);
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
  }

  :deep(code) {
    background: var(--color-secondary);
    padding: 2px 6px;
    border-radius: 4px;
  }

  :deep(pre) {
    background: var(--color-secondary);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
  }
}

.empty-state {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .talent-detail-page {
    padding: 16px;
  }
  .detail-body {
    grid-template-columns: 1fr;
  }
}
</style>
