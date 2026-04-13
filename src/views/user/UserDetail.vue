<template>
  <div class="user-detail-page page-container">
    <div class="user-header card">
      <el-avatar :size="80">
        {{ userData?.userName?.charAt(0) }}
      </el-avatar>
      <div class="user-info">
        <h2>{{ userData?.nickname || userData?.userName }}</h2>
        <p class="username">@{{ userData?.userName }}</p>
        <div class="user-badges">
          <el-tag v-for="role in userData?.roles" :key="role.id" size="small">
            {{ role.name }}
          </el-tag>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="他的文章" name="articles">
        <div v-if="articlesLoading" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        </div>
        <div v-else-if="articles.length === 0" class="empty-state">
          <p>暂无文章</p>
        </div>
        <div v-else class="article-list">
          <ArticleCard
            v-for="article in articles"
            :key="article.id"
            :article="article"
            @click="$router.push(`/article/${article.id}`)"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="他的项目" name="projects">
        <div v-if="projectsLoading" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        </div>
        <div v-else-if="projects.length === 0" class="empty-state">
          <p>暂无项目</p>
        </div>
        <div v-else class="project-grid">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            @click="$router.push(`/project/${project.id}`)"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { articleApi } from '@/api/article'
import { projectApi } from '@/api/project'
import ArticleCard from '@/components/ArticleCard.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import type { ArticleDto } from '@/api/article'
import type { ProjectDto } from '@/api/project'
import type { UserInfo } from '@/api/auth'

const route = useRoute()

const activeTab = ref('articles')
const articlesLoading = ref(false)
const projectsLoading = ref(false)
const articles = ref<ArticleDto[]>([])
const projects = ref<ProjectDto[]>([])
const userData = ref<UserInfo | null>(null)

const userId = route.params.id as string

onMounted(() => {
  // TODO: 加载用户信息
  loadArticles()
  loadProjects()
})

const loadArticles = async () => {
  articlesLoading.value = true
  try {
    const res = await articleApi.getList({ authorId: userId })
    articles.value = res.data
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    articlesLoading.value = false
  }
}

const loadProjects = async () => {
  projectsLoading.value = true
  try {
    // TODO: 需要后端支持按用户查询项目
    const res = await projectApi.getList()
    projects.value = res.data.filter(p => p.author === userData.value?.userName)
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    projectsLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.user-detail-page {
  max-width: 1000px;
  margin: 0 auto;
}

.user-header {
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 24px;

  .user-info {
    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .username {
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .user-badges {
      display: flex;
      gap: 8px;
    }
  }
}

.article-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}
</style>
