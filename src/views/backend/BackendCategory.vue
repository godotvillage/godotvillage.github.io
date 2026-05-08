<template>
  <div class="backend-category-page">
    <div class="page-header">
      <h1 class="page-title">分类管理</h1>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <div v-else-if="categories.length === 0" class="empty-state">
      <el-icon :size="64" color="#dcdfe6"><Collection /></el-icon>
      <p>暂无分类</p>
    </div>

    <div v-else class="category-list card">
      <el-table :data="categories" style="width: 100%" row-key="id">
        <el-table-column prop="name" label="名称" min-width="160">
          <template #default="{ row }">
            <span class="category-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="240">
          <template #default="{ row }">
            <span class="category-desc">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="articleCount" label="文章数" width="100" align="center" />
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '添加分类'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="输入分类描述（可选）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" placeholder="数字越小越靠前" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Loading, Collection } from '@element-plus/icons-vue'
import { categoryApi } from '@/api/category'
import type { CategoryDto } from '@/api/category'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const categories = ref<CategoryDto[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  description: '',
  sort: 0
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

onMounted(() => {
  loadCategories()
})

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const openCreateDialog = () => {
  isEdit.value = false
  editingId.value = ''
  form.name = ''
  form.description = ''
  form.sort = 0
  dialogVisible.value = true
}

const openEditDialog = (row: CategoryDto) => {
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  form.description = row.description || ''
  form.sort = row.sort
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value) {
        await categoryApi.update(editingId.value, {
          id: editingId.value,
          name: form.name,
          description: form.description || undefined,
          sort: form.sort
        })
        ElMessage.success('分类已更新')
      } else {
        await categoryApi.create({
          name: form.name,
          description: form.description || undefined,
          sort: form.sort
        })
        ElMessage.success('分类已创建')
      }
      dialogVisible.value = false
      await loadCategories()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDelete = async (row: CategoryDto) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类「${row.name}」吗？${row.articleCount > 0 ? `该分类下有 ${row.articleCount} 篇文章。` : ''}`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await categoryApi.delete(row.id)
    ElMessage.success('分类已删除')
    await loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<style scoped lang="scss">
.backend-category-page {
  max-width: 1400px;
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

.category-list {
  padding: 20px;
}

.category-name {
  font-weight: 600;
  color: var(--text-primary);
}

.category-desc {
  color: var(--text-secondary);
}
</style>
