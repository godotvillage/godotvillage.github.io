<template>
  <div class="article-create-page page-container">
    <div class="page-header">
      <h1 class="page-title">发布文章</h1>
    </div>

    <div class="article-form card">
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
          <el-button type="primary" @click="handlePublish" :loading="loading">
            发布文章
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { articleApi } from '@/api/article'
import { categoryApi } from '@/api/category'
import { ElMessage } from 'element-plus'
import request from '@/api/request'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { CategoryDto } from '@/api/category'

const router = useRouter()

// md-editor 配置
const toolbars: ToolbarNames[] = [
  'bold', 'underline', 'italic', 'strikeThrough', 'title',
  'sub', 'sup', 'quote', 'unorderedList', 'orderedList',
  'codeRow', 'code', 'link', 'image', 'table',
  'revoke', 'next', 'save', 'pageFullscreen', 'fullscreen',
  'preview', 'htmlPreview', 'github'
]

const formRef = ref<FormInstance>()
const loading = ref(false)
const categories = ref<CategoryDto[]>([])

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
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { max: 200, message: '标题不能超过200个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

onMounted(() => {
  loadCategories()
})

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
      const response: any = await request.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const url = response.data?.url || response.url || (response.data && typeof response.data === 'string' ? response.data : null)
      if (url) {
        urls.push(url)
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      // ElMessage.error 已经在 request 拦截器中处理
    }
  }
  callback(urls)
}

const handlePublish = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await articleApi.create({
        title: form.title,
        content: form.content,
        summary: form.summary || undefined,
        categoryId: form.categoryId || undefined,
        tags: form.tags || undefined,
        allowGuestView: form.allowGuestView
      })
      ElMessage.success('文章发布成功')
      router.push('/article')
    } catch (error) {
      // 错误已在拦截器处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.article-create-page {
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
</style>
