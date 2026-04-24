<template>
  <div class="article-list-page page-container">
    <div class="page-header">
      <h1 class="page-title">文章</h1>
      <el-button type="primary" @click="$router.push('/article/create')">
        <el-icon><Edit /></el-icon>
        发布文章
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar card">
      <el-select
        v-model="filters.categoryId"
        placeholder="全部分类"
        clearable
        @change="handleFilter"
      >
        <el-option
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        />
      </el-select>

      <el-select
        v-model="filters.status"
        placeholder="文章状态"
        clearable
        @change="handleFilter"
      >
        <el-option label="已发布" value="Published" />
        <el-option label="草稿" value="Draft" />
        <el-option label="待审核" value="PendingReview" />
      </el-select>

      <el-input
        v-model="filters.search"
        placeholder="搜索文章标题..."
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
      <el-button type="primary" @click="$router.push('/article/create')">
        发布第一篇文章
      </el-button>
    </div>

    <div v-else class="article-list">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        @click="$router.push(`/article/${article.articleId}`)"
      />
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Edit, Search, Document, Loading } from '@element-plus/icons-vue'
import { articleApi } from '@/api/article'
import { categoryApi } from '@/api/category'
import ArticleCard from '@/components/ArticleCard.vue'
import type { ArticleDto } from '@/api/article'
import type { CategoryDto } from '@/api/category'

const route = useRoute()

const loading = ref(true)
const articles = ref<ArticleDto[]>([])
const categories = ref<CategoryDto[]>([])
const total = ref(0)

const filters = reactive({
  categoryId: '',
  status: '',
  search: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20
})

onMounted(() => {
  loadCategories()
  loadArticles()

  // 从 URL 参数恢复筛选条件
  if (route.query.categoryId) {
    filters.categoryId = route.query.categoryId as string
  }
  if (route.query.authorId) {
    // 作者筛选 - 通过 authorId
  }
  if (route.query.search) {
    filters.search = route.query.search as string
  }
})

watch(() => route.query, () => {
  if (route.query.categoryId) {
    filters.categoryId = route.query.categoryId as string
  }
  if (route.query.search) {
    filters.search = route.query.search as string
  }
  loadArticles()
}, { deep: true })

const loadCategories = async () => {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadArticles = async () => {
  loading.value = true
  try {
    const params: any = {
      includeReactions: true
    }

    if (filters.categoryId) params.categoryId = filters.categoryId
    if (filters.status) params.status = filters.status
    if (route.query.authorId) params.authorId = route.query.authorId

    const res = await articleApi.getList(params)

    // 客户端搜索过滤
    if (filters.search) {
      articles.value = res.data.filter(a =>
        a.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    } else {
      articles.value = res.data
    }

    total.value = articles.value.length
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  pagination.page = 1
  loadArticles()
}

const handleSizeChange = () => {
  loadArticles()
}

const handlePageChange = () => {
  loadArticles()
}
</script>

<style scoped lang="scss">
.article-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 90%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;
  flex-wrap: wrap;

  .el-select {
    width: 160px;
  }

  .el-input {
    width: 240px;
  }
}

.article-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--card-bg);
  border-radius: 12px;

  p {
    margin: 16px 0 24px;
    color: var(--text-secondary);
    font-size: 16px;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  background: var(--card-bg);
  border-radius: 12px;
}
</style>
