<template>
  <div class="article-edit-page page-container">
    <div class="page-header">
      <h1 class="page-title">编辑文章</h1>
    </div>

    <div class="article-form card" v-if="form.title">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="输入文章标题"
            size="large"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-input
            v-model="form.tags"
            placeholder="多个标签用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="文章摘要（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <MdEditor
              v-model="form.content"
              :preview="false"
              :toolbars="toolbars"
              placeholder="输入文章内容..."
              @onUploadImg="handleUploadImg"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.allowGuestView">允许游客查看</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button @click="$router.back()">取消</el-button>
          <el-button @click="handleSaveDraft" :loading="loading">
            保存到草稿
          </el-button>
          <el-button
            v-if="articleStatus === 'Draft' || articleStatus === 'Rejected'"
            type="primary"
            @click="handlePublish"
            :loading="publishing"
          >
            发布
          </el-button>
          <el-button
            v-else-if="articleStatus === 'Pending'"
            type="warning"
            disabled
          >
            待审核中
          </el-button>
          <el-button
            v-else-if="articleStatus === 'Published'"
            type="success"
            disabled
          >
            已发布
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { articleApi } from '@/api/article'
import { categoryApi } from '@/api/category'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { CategoryDto } from '@/api/category'

const route = useRoute()
const router = useRouter()

// md-editor 配置
const toolbars = [
  'bold', 'underline', 'italic', 'strikeThrough', 'title',
  'sub', 'sup', 'quote', 'unorderedList', 'orderedList',
  'codeRow', 'code', 'link', 'image', 'table',
  'revoke', 'next', 'save', 'pageFullscreen', 'fullscreen',
  'preview', 'htmlPreview', 'github'
]

const formRef = ref<FormInstance>()
const loading = ref(true)
const publishing = ref(false)
const categories = ref<CategoryDto[]>([])
const articleStatus = ref('')

const form = reactive({
  title: '',
  content: '',
  summary: '',
  categoryId: '',
  tags: '',
  allowGuestView: false
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

const articleId = route.params.id as string

onMounted(async () => {
  await Promise.all([loadArticle(), loadCategories()])
})

const loadArticle = async () => {
  try {
    const res = await articleApi.getById(articleId)
    const article = res.data
    form.title = article.title
    form.content = article.content
    form.summary = article.summary || ''
    form.categoryId = article.categoryId || ''
    form.tags = article.tags || ''
    form.allowGuestView = article.allowGuestView
    articleStatus.value = article.status
  } catch (error) {
    ElMessage.error('加载文章失败')
    router.push('/article')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 图片上传处理
const handleUploadImg = async (files: FileList, callback: (urls: string[]) => void) => {
  const urls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const formData = new FormData()
    formData.append('file', file)
    try {
      // 这里需要替换为实际上传图片的 API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.url) {
        urls.push(data.url)
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败')
    }
  }
  callback(urls)
}

const handleSaveDraft = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await articleApi.update(articleId, {
        title: form.title,
        content: form.content,
        summary: form.summary || undefined,
        categoryId: form.categoryId || undefined,
        tags: form.tags || undefined,
        allowGuestView: form.allowGuestView,
        status: 'Draft'
      })
      ElMessage.success('保存成功')
      router.push(`/article/${articleId}`)
    } catch (error) {
      // 错误已在拦截器处理
    } finally {
      loading.value = false
    }
  })
}

const handlePublish = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    publishing.value = true
    try {
      // 先保存文章
      await articleApi.update(articleId, {
        title: form.title,
        content: form.content,
        summary: form.summary || undefined,
        categoryId: form.categoryId || undefined,
        tags: form.tags || undefined,
        allowGuestView: form.allowGuestView
      })
      // 然后提交审核
      await articleApi.submitForReview(articleId)
      ElMessage.success('已提交审核，等待管理员审批')
      router.push(`/article/${articleId}`)
    } catch (error) {
      // 错误已在拦截器处理
    } finally {
      publishing.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.article-edit-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.article-form {
  padding: 32px;
}

.editor-container {
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  background: var(--card-bg);
  border-radius: 12px;
}
</style>
