<template>
  <div class="article-card card" @click="$emit('click')">
    <div class="article-header">
      <el-tag v-if="article.isTop" type="danger" size="small">置顶</el-tag>
      <el-tag v-if="article.isFeatured" type="warning" size="small">精华</el-tag>
      <el-tag v-if="article.categoryName" size="small">{{ article.categoryName }}</el-tag>
      <el-tag v-if="article.status === 'Draft'" type="info" size="small">草稿</el-tag>
      <el-tag v-if="article.status === 'Pending'" type="warning" size="small">待审核</el-tag>
      <el-tag v-if="article.status === 'Rejected'" type="danger" size="small">已拒绝</el-tag>
    </div>

    <h3 class="article-title">{{ article.title }}</h3>

    <p class="article-summary">{{ computedSummary }}</p>

    <div class="article-footer">
      <div class="article-author">
        <el-avatar :size="24" :src="avatarUrl">
          {{ article.authorName?.charAt(0) }}
        </el-avatar>
        <span class="author-name">{{ article.authorName }}</span>
      </div>

      <div class="article-stats">
        <span class="stat-item">
          <el-icon><View /></el-icon>
          {{ article.viewCount || 0 }}
        </span>
        <span class="stat-item">
          <el-icon><ChatDotRound /></el-icon>
          {{ article.commentCount || 0 }}
        </span>
        <span class="stat-item" v-if="article.reactions">
          <el-icon><Star /></el-icon>
          {{ getTotalReactions(article.reactions) }}
        </span>
      </div>
    </div>

    <div class="article-time">
      <el-icon><Clock /></el-icon>
      {{ formatTime(article.createdTime) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { View, ChatDotRound, Star, Clock } from '@element-plus/icons-vue'
import type { ArticleDto } from '@/api/article'
import { getAvatarUrl } from '@/utils/avatar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

const props = defineProps<{
  article: ArticleDto
}>()

defineEmits<{
  click: []
}>()

const avatarUrl = computed(() => {
  return getAvatarUrl(props.article.authorName)
})

const computedSummary = computed(() => {
  if (props.article.summary) {
    return props.article.summary
  }
  const html = props.article.content || ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').slice(0, 120)
})

const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

const getTotalReactions = (reactions: Record<string, number>) => {
  if (!reactions) return 0
  return Object.values(reactions).reduce((sum, count) => sum + count, 0)
}
</script>

<style scoped lang="scss">
.article-card {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .article-header {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .article-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .article-summary {
    color: var(--text-regular);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .article-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .article-author {
      display: flex;
      align-items: center;
      gap: 8px;

      .author-name {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }

    .article-stats {
      display: flex;
      gap: 12px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--text-secondary);
      }
    }
  }

  .article-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary);
  }
}
</style>
