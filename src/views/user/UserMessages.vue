<template>
  <div class="user-messages-page page-container">
    <div class="page-header">
      <h1 class="page-title">我的消息</h1>
      <el-button v-if="hasUnread" type="primary" link @click="handleMarkAllAsRead">全部标为已读</el-button>
    </div>

    <!-- 消息列表 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <div v-else-if="messages.length === 0" class="empty-state">
      <el-icon :size="64" color="#dcdfe6"><ChatDotRound /></el-icon>
      <p>暂无消息</p>
    </div>

    <div v-else class="message-list">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item card"
        :class="{ unread: !message.isRead }"
        @click="handleRead(message)"
      >
        <div class="message-icon">
          <el-icon :size="24" :color="getTypeColor(message.type)">
            <component :is="getTypeIcon(message.type)" />
          </el-icon>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-title">{{ message.title }}</span>
            <span class="message-time">{{ formatTime(message.createdTime) }}</span>
          </div>
          <div class="message-body">{{ message.content }}</div>
          <div v-if="message.relatedId" class="message-action">
            <el-button type="primary" size="small" link @click.stop="goToRelated(message)">
              查看详情
            </el-button>
          </div>
        </div>
        <div v-if="!message.isRead" class="unread-badge">
          <span class="dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound, Loading } from '@element-plus/icons-vue'
import { messageApi, type MessageDto } from '@/api/message'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(true)
const messages = ref<MessageDto[]>([])

const hasUnread = computed(() => messages.value.some(m => !m.isRead))

onMounted(() => {
  loadMessages()
})

const loadMessages = async () => {
  loading.value = true
  try {
    const res = await messageApi.getList()
    messages.value = res.data
  } catch (error) {
    console.error('加载消息失败:', error)
  } finally {
    loading.value = false
  }
}

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'ArticleApproved': 'CircleCheck',
    'ArticleRejected': 'CircleClose',
    'ProjectApproved': 'CircleCheck',
    'ProjectRejected': 'CircleClose',
    'System': 'Bell'
  }
  return iconMap[type] || 'Bell'
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'ArticleApproved': '#67c23a',
    'ArticleRejected': '#f56c6c',
    'ProjectApproved': '#67c23a',
    'ProjectRejected': '#f56c6c',
    'System': '#409eff'
  }
  return colorMap[type] || '#409eff'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const handleRead = async (message: MessageDto) => {
  if (!message.isRead) {
    await messageApi.markAsRead(message.id)
    message.isRead = true
  }
}

const handleMarkAllAsRead = async () => {
  try {
    await messageApi.markAllAsRead()
    messages.value.forEach(m => m.isRead = true)
    ElMessage.success('已全部标为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const goToRelated = (message: MessageDto) => {
  if (!message.relatedId) return

  if (message.type.includes('Article')) {
    router.push(`/article/${message.relatedId}`)
  } else if (message.type.includes('Project')) {
    router.push(`/project/${message.relatedId}`)
  }
}
</script>

<style scoped lang="scss">
.user-messages-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: var(--card-bg);
  border-radius: 12px;

  p {
    margin-top: 16px;
    color: var(--text-secondary);
  }
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-color);
  }

  &.unread {
    background: #ecf5ff;

    &:hover {
      background: #d9ecff;
    }
  }

  .message-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color);
    border-radius: 50%;
  }

  .message-content {
    flex: 1;
    min-width: 0;

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .message-title {
        font-weight: 600;
        color: var(--text-primary);
      }

      .message-time {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }

    .message-body {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .message-action {
      margin-top: 12px;
    }
  }

  .unread-badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .dot {
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
    }
  }
}
</style>
