<template>
  <div class="backend-project-page">
    <div class="page-header">
      <h1 class="page-title">项目管理</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar card">
      <el-select v-model="filters.status" placeholder="项目状态" clearable @change="handleFilter">
        <el-option label="进行中" value="进行中" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已暂停" value="已暂停" />
        <el-option label="已取消" value="已取消" />
      </el-select>

      <el-select v-model="filters.type" placeholder="项目类型" clearable @change="handleFilter">
        <el-option label="游戏" value="游戏" />
        <el-option label="工具" value="工具" />
        <el-option label="插件" value="插件" />
        <el-option label="教程" value="教程" />
        <el-option label="其他" value="其他" />
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

    <!-- 项目列表 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <div v-else-if="projects.length === 0" class="empty-state">
      <el-icon :size="64" color="#dcdfe6"><FolderOpened /></el-icon>
      <p>暂无项目</p>
    </div>

    <div v-else class="project-list card">
      <el-table :data="filteredProjects" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <router-link :to="`/project/${row.projectId}`" class="project-link">
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="100">
          <template #default="{ row }">
            {{ row.progress || 0 }}%
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleView(row)">查看</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FolderOpened, Search, Loading } from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import type { ProjectDto } from '@/api/project'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const loading = ref(true)
const projects = ref<ProjectDto[]>([])
const filters = ref({
  status: '',
  type: '',
  search: ''
})

const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    if (filters.value.status && project.status !== filters.value.status) return false
    if (filters.value.type && project.type !== filters.value.type) return false
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      if (!project.title.toLowerCase().includes(search) &&
          !project.author?.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  })
})

onMounted(() => {
  loadProjects()
})

const loadProjects = async () => {
  loading.value = true
  try {
    const res = await projectApi.getList()
    projects.value = res.data
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  // 筛选在 computed 中处理
}

const getStatusType = (status: string): 'success' | 'primary' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'success' | 'primary' | 'warning' | 'info' | 'danger'> = {
    '进行中': 'success',
    '已完成': 'primary',
    '已暂停': 'warning',
    '已取消': 'info'
  }
  return map[status] || 'info'
}

const handleView = (project: ProjectDto) => {
  router.push(`/project/${project.projectId}`)
}

const handleDelete = async (project: ProjectDto) => {
  try {
    await ElMessageBox.confirm(`确定删除项目「${project.title}」吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await projectApi.delete(project.projectId)
    ElMessage.success('项目已删除')
    loadProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped lang="scss">
.backend-project-page {
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
    width: 140px;
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

.project-list {
  padding: 20px;
}

.project-link {
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
