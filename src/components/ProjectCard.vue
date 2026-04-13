<template>
  <div class="project-card card" @click="$emit('click')">
    <div class="project-header">
      <h3 class="project-title">{{ project.title }}</h3>
      <el-tag :type="getStatusType(project.status)" size="small">
        {{ project.status }}
      </el-tag>
    </div>

    <div class="project-author">
      <el-icon><User /></el-icon>
      {{ project.author }}
    </div>

    <p class="project-desc">{{ project.description || '暂无描述' }}</p>

    <div class="project-progress">
      <div class="progress-header">
        <span>进度</span>
        <span>{{ project.progress || 0 }}%</span>
      </div>
      <el-progress
        :percentage="project.progress || 0"
        :stroke-width="6"
        :show-text="false"
      />
    </div>

    <div class="project-tags" v-if="project.tags?.length">
      <el-tag
        v-for="tag in project.tags.slice(0, 3)"
        :key="tag"
        size="small"
        effect="plain"
      >
        {{ tag }}
      </el-tag>
      <el-tag v-if="project.tags.length > 3" size="small" effect="plain">
        +{{ project.tags.length - 3 }}
      </el-tag>
    </div>

    <div class="project-footer">
      <div class="project-badges">
        <span v-if="project.isOpenSource" class="badge">
          <el-icon><Unlock /></el-icon>开源
        </span>
        <span v-if="project.needHelp" class="badge help">
          <el-icon><QuestionFilled /></el-icon>需要帮助
        </span>
        <span v-if="project.allowCollaboration" class="badge">
          <el-icon><Plus /></el-icon>可协作
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Unlock, QuestionFilled, Plus } from '@element-plus/icons-vue'
import type { ProjectDto } from '@/api/project'

defineProps<{
  project: ProjectDto
}>()

defineEmits<{
  click: []
}>()

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '进行中': 'success',
    '已完成': 'primary',
    '已暂停': 'warning',
    '已取消': 'info'
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped lang="scss">
.project-card {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 12px;

    .project-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .project-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .project-desc {
    font-size: 14px;
    color: var(--text-regular);
    line-height: 1.5;
    margin-bottom: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .project-progress {
    margin-bottom: 12px;

    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
  }

  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .project-footer {
    .project-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        padding: 2px 8px;
        background: #f0f9eb;
        color: #67c23a;
        border-radius: 4px;

        &.help {
          background: #fef0f0;
          color: #f56c6c;
        }
      }
    }
  }
}
</style>
