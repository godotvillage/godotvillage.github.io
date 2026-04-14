<template>
  <div class="profile-page page-container">
    <div class="profile-header card">
      <div class="avatar-section">
        <el-avatar :size="100">
          {{ authStore.userInfo?.nickname?.charAt(0) || authStore.userInfo?.userName?.charAt(0) }}
        </el-avatar>
        <div class="user-info">
          <h2>{{ authStore.userInfo?.nickname || authStore.userInfo?.userName }}</h2>
          <p class="username">@{{ authStore.userInfo?.userName }}</p>
          <div class="user-badges">
            <el-tag v-for="role in authStore.userInfo?.roles" :key="role.id" size="small">
              {{ role.name }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="profile-tabs">
      <el-tab-pane label="我的文章" name="articles">
        <div v-if="articlesLoading" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        </div>
        <div v-else-if="articles.length === 0" class="empty-state">
          <p>还没有发布文章</p>
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
      </el-tab-pane>

      <el-tab-pane label="我的项目" name="projects">
        <div v-if="projectsLoading" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        </div>
        <div v-else-if="projects.length === 0" class="empty-state">
          <p>还没有创建项目</p>
          <el-button type="primary" @click="$router.push('/project/create')">
            创建第一个项目
          </el-button>
        </div>
        <div v-else class="project-grid">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            @click="$router.push(`/project/${project.projectId}`)"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="账号设置" name="settings">
        <div class="settings-form card">
          <h3>基本信息</h3>
          <el-form :model="settingsForm" label-position="top">
            <el-form-item label="昵称">
              <el-input v-model="settingsForm.nickname" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="settingsForm.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="settingsForm.phoneNumber" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSettings" :loading="saving">
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { articleApi } from '@/api/article'
import { projectApi } from '@/api/project'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import ArticleCard from '@/components/ArticleCard.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import type { ArticleDto } from '@/api/article'
import type { ProjectDto } from '@/api/project'

const authStore = useAuthStore()

const activeTab = ref('articles')
const articlesLoading = ref(false)
const projectsLoading = ref(false)
const saving = ref(false)
const articles = ref<ArticleDto[]>([])
const projects = ref<ProjectDto[]>([])

const settingsForm = reactive({
  nickname: authStore.userInfo?.nickname || '',
  email: authStore.userInfo?.email || '',
  phoneNumber: authStore.userInfo?.phoneNumber || ''
})

onMounted(() => {
  loadMyArticles()
  loadMyProjects()
})

const loadMyArticles = async () => {
  if (!authStore.userInfo?.id) return

  articlesLoading.value = true
  try {
    const res = await articleApi.getList({ authorId: authStore.userInfo.id })
    articles.value = res.data
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    articlesLoading.value = false
  }
}

const loadMyProjects = async () => {
  if (!authStore.userInfo?.userName) return

  projectsLoading.value = true
  try {
    const res = await projectApi.getList({ author: authStore.userInfo.userName })
    projects.value = res.data
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    projectsLoading.value = false
  }
}

const handleSaveSettings = async () => {
  // TODO: 调用用户更新API
  ElMessage.success('设置已保存')
  saving.value = false
}
</script>

<style scoped lang="scss">
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  padding: 32px;
  margin-bottom: 24px;

  .avatar-section {
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
}

.profile-tabs {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
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

  p {
    color: var(--text-secondary);
    margin-bottom: 24px;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.settings-form {
  max-width: 500px;
  padding: 24px;

  h3 {
    font-size: 18px;
    margin-bottom: 24px;
  }
}
</style>
