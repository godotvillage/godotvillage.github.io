<template>
  <div class="backend-user page-container">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <el-button type="primary" @click="openSendMessageDialog()">发送消息</el-button>
    </div>

    <!-- 用户列表 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <div v-else class="user-table">
      <el-table :data="users" stripe style="width: 100%">
        <el-table-column prop="userName" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150">
          <template #default="{ row }">
            {{ row.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200">
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="文章统计" align="center">
          <el-table-column label="总计" prop="articleCount" width="80" align="center" />
          <el-table-column label="已发布" prop="publishedArticleCount" width="80" align="center" />
          <el-table-column label="待审核" prop="pendingArticleCount" width="80" align="center" />
        </el-table-column>
        <el-table-column prop="projectCount" label="项目数" width="100" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewUserArticles(row)">
              查看文章
            </el-button>
            <el-button type="warning" size="small" link @click="openSendMessageDialog(row)">
              发消息
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 发送消息弹窗 -->
    <el-dialog v-model="dialogVisible" title="发送站内消息" width="500px">
      <el-form :model="messageForm" label-width="80px">
        <el-form-item label="收件人">
          <el-input v-model="messageForm.targetUserName" disabled />
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="messageForm.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="messageForm.content" type="textarea" :rows="4" placeholder="请输入消息内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="sending" @click="handleSendMessage">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { statsApi, type UserStatisticsDto } from '@/api/stats'
import { messageApi, type MessageSendDto } from '@/api/message'

const router = useRouter()

const loading = ref(true)
const users = ref<UserStatisticsDto[]>([])
const dialogVisible = ref(false)
const sending = ref(false)
const messageForm = reactive({
  targetUserId: '',
  targetUserName: '',
  title: '',
  content: ''
})

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await statsApi.getUserStatistics()
    users.value = res.data
  } catch (error) {
    console.error('加载用户统计失败:', error)
  } finally {
    loading.value = false
  }
}

const viewUserArticles = (user: UserStatisticsDto) => {
  router.push({ path: '/article', query: { authorId: user.userId } })
}

const openSendMessageDialog = (user?: UserStatisticsDto) => {
  messageForm.targetUserId = user?.userId || ''
  messageForm.targetUserName = user?.userName || ''
  messageForm.title = ''
  messageForm.content = ''
  dialogVisible.value = true
}

const handleSendMessage = async () => {
  if (!messageForm.title.trim()) {
    ElMessage.warning('请输入消息标题')
    return
  }
  if (!messageForm.content.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  sending.value = true
  try {
    const data: MessageSendDto = {
      targetUserId: messageForm.targetUserId,
      title: messageForm.title,
      content: messageForm.content
    }
    await messageApi.send(data)
    ElMessage.success('发送成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}
</script>

<style scoped lang="scss">
.backend-user {
  .user-table {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 20px;

    :deep(.el-table) {
      --el-table-bg-color: transparent;
      --el-table-tr-bg-color: transparent;
      --el-table-header-bg-color: var(--bg-color);
    }
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  background: var(--card-bg);
  border-radius: 12px;
}
</style>
