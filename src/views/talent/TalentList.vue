<template>
  <div class="talent-list-page page-container">
    <div class="page-header">
      <h1 class="page-title">人才库</h1>
      <el-button v-if="authStore.isLoggedIn" type="primary" @click="router.push('/talent/my')">
        <el-icon><Edit /></el-icon>我的档案
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar card">
      <div class="filter-header" @click="showFilters = !showFilters">
        <span class="filter-title">
          <el-icon><Filter /></el-icon>筛选条件
        </span>
        <el-icon class="filter-arrow" :class="{ expanded: showFilters }">
          <ArrowDown />
        </el-icon>
      </div>
      <div v-show="showFilters" class="filter-body">
        <div class="filter-grid">
          <div v-for="dim in DIMENSION_KEYS" :key="dim.key" class="filter-dim">
            <label class="filter-label">{{ dim.label }}</label>
            <el-slider
              v-model="filters[dim.key as keyof ScoreFilters]"
              range
              :min="0"
              :max="10"
              :step="0.5"
              :marks="{ 0: '0', 5: '5', 10: '10' }"
            />
          </div>
        </div>
        <div class="filter-extra">
          <div class="filter-item">
            <label class="filter-label">标签筛选</label>
            <el-select
              v-model="filters.tags"
              multiple
              filterable
              clearable
              placeholder="选择标签筛选"
              style="width: 100%"
            >
              <el-option-group
                v-for="cat in TALENT_CATEGORIES"
                :key="cat.key"
                :label="cat.label"
              >
                <el-option
                  v-for="tag in TALENT_TAG_OPTIONS[cat.key]"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-option-group>
            </el-select>
          </div>
          <div class="filter-item">
            <label class="filter-label">关键词</label>
            <el-input
              v-model="filters.keyword"
              placeholder="搜索描述内容"
              clearable
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        <div class="filter-actions">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <!-- Empty -->
    <div v-else-if="profiles.length === 0" class="empty-state">
      <el-empty description="暂无人才档案" />
    </div>

    <!-- List -->
    <div v-else class="talent-grid">
      <TalentCard
        v-for="profile in profiles"
        :key="profile.id"
        :talent="profile"
        @click="router.push(`/talent/${profile.id}`)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > 0" class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="totalCount"
        layout="prev, pager, next, total"
        @current-change="loadProfiles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Filter, ArrowDown, Loading } from '@element-plus/icons-vue'
import { talentApi } from '@/api/talent'
import type { TalentDto } from '@/api/talent'
import { DIMENSION_KEYS, TALENT_CATEGORIES, TALENT_TAG_OPTIONS } from '@/data/talentTags'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const showFilters = ref(false)
const profiles = ref<TalentDto[]>([])
const totalCount = ref(0)

type ScoreFilters = Record<string, [number, number]>
const filters = reactive({
  designScore: [0, 10] as [number, number],
  programmingScore: [0, 10] as [number, number],
  artScore: [0, 10] as [number, number],
  musicScore: [0, 10] as [number, number],
  organizationScore: [0, 10] as [number, number],
  fundingScore: [0, 10] as [number, number],
  tags: [] as string[],
  keyword: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 12,
})

const buildQuery = () => {
  const dimMap: Record<string, string> = {
    designScore: 'Design',
    programmingScore: 'Programming',
    artScore: 'Art',
    musicScore: 'Music',
    organizationScore: 'Organization',
    fundingScore: 'Funding',
  }
  const params: Record<string, any> = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: 'UpdatedTime',
    sortOrder: 'desc',
  }
  for (const [key, range] of Object.entries(filters)) {
    if (key === 'tags') {
      if (filters.tags.length > 0) {
        params.tags = filters.tags.join(',')
      }
    } else if (key === 'keyword') {
      if (filters.keyword) {
        params.keyword = filters.keyword
      }
    } else {
      const prefix = dimMap[key]
      if (prefix && range[0] > 0) params[`min${prefix}`] = range[0]
      if (prefix && range[1] < 10) params[`max${prefix}`] = range[1]
    }
  }
  return params
}

const loadProfiles = async () => {
  loading.value = true
  try {
    const res = await talentApi.getList(buildQuery())
    profiles.value = res.data.items
    totalCount.value = res.data.totalCount
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadProfiles()
}

const resetFilters = () => {
  for (const key of DIMENSION_KEYS) {
    ;(filters as any)[key.key] = [0, 10]
  }
  filters.tags = []
  filters.keyword = ''
  pagination.page = 1
  loadProfiles()
}

onMounted(() => {
  loadProfiles()
})
</script>

<style scoped lang="scss">
.talent-list-page {
  padding: 24px 32px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.filter-bar {
  margin-bottom: 24px;
  padding: 16px 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.filter-arrow {
  transition: transform 0.2s;
  color: var(--text-secondary);

  &.expanded {
    transform: rotate(180deg);
  }
}

.filter-body {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-secondary);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 24px;
}

.filter-dim {
  .filter-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 4px;
    display: block;
  }

  :deep(.el-slider) {
    padding: 0 4px;
  }
}

.filter-extra {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.filter-item {
  flex: 1;
}

.filter-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  display: block;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
}

.empty-state {
  padding: 80px 0;
}

.talent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 1200px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .talent-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .talent-list-page {
    padding: 16px;
  }
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .filter-extra {
    flex-direction: column;
  }
  .talent-grid {
    grid-template-columns: 1fr;
  }
}
</style>
