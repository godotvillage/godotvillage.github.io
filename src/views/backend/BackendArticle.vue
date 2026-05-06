<template>
  <div class="backend-article-page">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar card">
      <el-select v-model="filters.status" placeholder="文章状态" clearable @change="handleFilter">
        <el-option label="待审核" value="Pending" />
        <el-option label="已发布" value="Published" />
        <el-option label="已拒绝" value="Rejected" />
        <el-option label="草稿" value="Draft" />
      </el-select>

      <el-input
        v-model="filters.search"
        placeholder="搜索标题或作者..."
        clearable
        @clear="handleFilter"
        @keyup.enter="handleFilter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 文章列表 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <div v-else-if="articles.length === 0" class="empty-state">
      <el-icon :size="64" color="#dcdfe6"><Document /></el-icon>
      <p>暂无文章</p>
    </div>

    <div v-else class="article-list card">
      <el-table :data="filteredArticles" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <router-link :to="`/article/${row.articleId}`" class="article-link">
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleView(row)">查看</el-button>
            <template v-if="row.status === 'Pending'">
              <el-button type="success" size="small" link @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" size="small" link @click="handleReject(row)">拒绝</el-button>
            </template>
            <el-button v-if="row.status === 'Published'" type="warning" size="small" link @click="handleUnpublish(row)">取消发布</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝文章" width="500px">
      <el-form :model="rejectForm" label-position="top">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Search, Loading } from '@element-plus/icons-vue'
import { articleApi } from '@/api/article'
import type { ArticleDto } from '@/api/article'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const loading = ref(true)
const articles = ref<ArticleDto[]>([])
const filters = ref({
  status: '',
  search: ''
})
const rejectDialogVisible = ref(false)
const rejectForm = ref({
  reason: '',
  articleId: ''
})

const filteredArticles = computed(() => {
  return articles.value.filter(article => {
    if (filters.value.status && article.status !== filters.value.status) return false
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      if (!article.title.toLowerCase().includes(search) &&
          !article.authorName?.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  })
})

onMounted(() => {
  loadArticles()
})

const loadArticles = async () => {
  loading.value = true
  try {
    const res = await articleApi.getList({ includeReactions: false })
    articles.value = res.data
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  // 筛选在 computed 中处理
}

const getStatusType = (status: string): 'success' | 'primary' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'success' | 'primary' | 'warning' | 'info' | 'danger'> = {
    'Draft': 'info',
    'Pending': 'warning',
    'Published': 'success',
    'Rejected': 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'Draft': '草稿',
    'Pending': '待审核',
    'Published': '已发布',
    'Rejected': '已拒绝'
  }
  return textMap[status] || status
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const handleView = (article: ArticleDto) => {
  router.push(`/article/${article.articleId}`)
}

const handleApprove = async (article: ArticleDto) => {
  try {
    await ElMessageBox.confirm(`确定通过文章「${article.title}」吗？`, '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await articleApi.approve(article.articleId)
    ElMessage.success('文章已通过')
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = (article: ArticleDto) => {
  rejectForm.value.articleId = article.articleId
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  try {
    await articleApi.reject(rejectForm.value.articleId, { reason: rejectForm.value.reason })
    ElMessage.success('已拒绝该文章')
    rejectDialogVisible.value = false
    loadArticles()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleUnpublish = async (article: ArticleDto) => {
  try {
    await ElMessageBox.confirm(`确定取消发布文章「${article.title}」吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await articleApi.update(article.articleId, { allowGuestView: false } as any)
    ElMessage.success('已取消发布')
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}
</script>

<style scoped lang="scss">
.backend-article-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;

  .el-select {
    width: 160px;
  }

  .el-input {
    width: 260px;
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

.article-list {
  padding: 20px;
}

.article-link {
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
