<template>
  <div class="project-list-page page-container">
    <div class="page-header">
      <h1 class="page-title">项目</h1>
      <el-button type="primary" @click="$router.push('/project/create')">
        <el-icon><FolderAdd /></el-icon>
        创建项目
      </el-button>
    </div>

    <!-- 统计数据 -->
    <div class="stats-bar card">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">全部项目</span>
      </div>
      <div class="stat-item">
        <span class="stat-value active">{{ stats.active }}</span>
        <span class="stat-label">进行中</span>
      </div>
      <div class="stat-item">
        <span class="stat-value completed">{{ stats.completed }}</span>
        <span class="stat-label">已完成</span>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar card">
      <el-select v-model="filters.type" placeholder="项目类型" clearable @change="handleFilter">
        <el-option label="游戏" value="游戏" />
        <el-option label="工具" value="工具" />
        <el-option label="插件" value="插件" />
        <el-option label="教程" value="教程" />
        <el-option label="其他" value="其他" />
      </el-select>

      <el-select v-model="filters.status" placeholder="项目状态" clearable @change="handleFilter">
        <el-option label="进行中" value="进行中" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已暂停" value="已暂停" />
        <el-option label="已取消" value="已取消" />
      </el-select>

      <el-input
        v-model="filters.search"
        placeholder="搜索项目..."
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

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <el-icon :size="64" color="#dcdfe6"><FolderOpened /></el-icon>
      <p>暂无项目</p>
      <el-button type="primary" @click="$router.push('/project/create')">
        创建第一个项目
      </el-button>
    </div>

    <div v-else class="project-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @click="$router.push(`/project/${project.projectId}`)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { FolderAdd, Search, FolderOpened, Loading } from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import ProjectCard from '@/components/ProjectCard.vue'
import type { ProjectDto, ProjectStatsDto } from '@/api/project'

const route = useRoute()

const loading = ref(true)
const projects = ref<ProjectDto[]>([])
const stats = ref<ProjectStatsDto>({ total: 0, active: 0, completed: 0 })

const filters = reactive({
  type: '',
  status: '',
  search: ''
})

const filteredProjects = computed(() => {
  return projects.value.filter(p => {
    if (filters.type && p.type !== filters.type) return false
    if (filters.status && p.status !== filters.status) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      if (!p.title.toLowerCase().includes(search) &&
          !p.description?.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  })
})

onMounted(async () => {
  await loadProjects()

  // 从 URL 参数恢复筛选条件
  if (route.query.type) filters.type = route.query.type as string
  if (route.query.status) filters.status = route.query.status as string
  if (route.query.author) filters.search = route.query.author as string
})

const loadProjects = async () => {
  loading.value = true
  try {
    const [projectRes, statsRes] = await Promise.all([
      projectApi.getList(),
      projectApi.getStats()
    ])
    projects.value = projectRes.data
    stats.value = statsRes.data
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  // 筛选是客户端的，过滤在 computed 中处理
}
</script>

<style scoped lang="scss">
.project-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 24px;
  margin-bottom: 24px;

  .stat-item {
    text-align: center;

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      display: block;

      &.active {
        color: #67c23a;
      }

      &.completed {
        color: #409eff;
      }
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;
  flex-wrap: wrap;

  .el-select {
    width: 140px;
  }

  .el-input {
    width: 220px;
  }
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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
