<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <section class="hero">
      <div class="hero-content">
        <h1>欢迎来到 <span class="highlight">Godot新手村</span></h1>
        <p class="hero-subtitle">游戏开发者的聚集地，分享你的创意与作品</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/article/create')">
            <el-icon><Edit /></el-icon>
            发布文章
          </el-button>
          <el-button size="large" @click="$router.push('/project/create')">
            <el-icon><FolderAdd /></el-icon>
            创建项目
          </el-button>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <el-icon :size="32" color="#667eea"><Document /></el-icon>
          <div class="stat-value">{{ stats.articleCount || 0 }}</div>
          <div class="stat-label">篇文章</div>
        </div>
        <div class="stat-card">
          <el-icon :size="32" color="#67c23a"><FolderOpened /></el-icon>
          <div class="stat-value">{{ projectStats.total || 0 }}</div>
          <div class="stat-label">个项目</div>
        </div>
        <div class="stat-card">
          <el-icon :size="32" color="#e6a23c"><User /></el-icon>
          <div class="stat-value">{{ stats.userCount || 0 }}</div>
          <div class="stat-label">位开发者</div>
        </div>
      </div>
    </section>

    <div class="main-container">
      <!-- 最新文章 -->
      <section class="section">
        <div class="section-header">
          <h2><el-icon><Document /></el-icon>最新文章</h2>
          <router-link to="/article" class="more-link">查看更多</router-link>
        </div>
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        </div>
        <div v-else-if="articles.length === 0" class="empty-state">
          <el-icon :size="64" color="#dcdfe6"><Document /></el-icon>
          <p>暂无文章</p>
        </div>
        <div v-else class="article-grid">
          <ArticleCard
            v-for="article in articles.slice(0, 6)"
            :key="article.id"
            :article="article"
            @click="$router.push(`/article/${article.articleId}`)"
          />
        </div>
      </section>

      <!-- 热门项目 -->
      <section class="section">
        <div class="section-header">
          <h2><el-icon><FolderOpened /></el-icon>热门项目</h2>
          <router-link to="/project" class="more-link">查看更多</router-link>
        </div>
        <div v-if="projectLoading" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        </div>
        <div v-else-if="projects.length === 0" class="empty-state">
          <el-icon :size="64" color="#dcdfe6"><FolderOpened /></el-icon>
          <p>暂无项目</p>
        </div>
        <div v-else class="project-grid">
          <ProjectCard
            v-for="project in projects.slice(0, 4)"
            :key="project.id"
            :project="project"
            @click="$router.push(`/project/${project.projectId}`)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Document, FolderOpened, User, Edit, FolderAdd, Loading } from '@element-plus/icons-vue'
import { articleApi } from '@/api/article'
import { projectApi } from '@/api/project'
import ArticleCard from '@/components/ArticleCard.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import type { ArticleDto } from '@/api/article'
import type { ProjectDto } from '@/api/project'

const loading = ref(true)
const projectLoading = ref(true)
const articles = ref<ArticleDto[]>([])
const projects = ref<ProjectDto[]>([])
const stats = ref({ articleCount: 0, userCount: 0 })
const projectStats = ref({ total: 0, active: 0, completed: 0 })

onMounted(async () => {
  await Promise.all([
    loadArticles(),
    loadProjects(),
    loadStats()
  ])
})

const loadArticles = async () => {
  try {
    const res = await articleApi.getList({ includeReactions: true })
    articles.value = res.data
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const loadProjects = async () => {
  try {
    const [projectRes, statsRes] = await Promise.all([
      projectApi.getList(),
      projectApi.getStats()
    ])
    projects.value = projectRes.data
    projectStats.value = statsRes.data
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    projectLoading.value = false
  }
}

const loadStats = async () => {
  // 暂时使用文章数和项目数作为统计
  stats.value = {
    articleCount: articles.value.length,
    userCount: 0
  }
}
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 24px;
  text-align: center;
  color: #fff;

  .hero-content {
    max-width: 800px;
    margin: 0 auto;

    h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 16px;

      .highlight {
        background: linear-gradient(120deg, #fff 0%, #ffd89b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .hero-subtitle {
      font-size: 20px;
      opacity: 0.9;
      margin-bottom: 32px;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 16px;

      .el-button {
        padding: 16px 32px;
        font-size: 16px;
      }
    }
  }
}

.stats-section {
  background: var(--card-bg);
  padding: 32px 24px;
  margin-top: -40px;
  position: relative;
  z-index: 1;
  margin-left: 24px;
  margin-right: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .stats-grid {
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }

  .stat-card {
    text-align: center;
    padding: 20px;

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 12px 0 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.section {
  margin-bottom: 48px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .more-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
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
  background: var(--card-bg);
  border-radius: 12px;

  p {
    margin-top: 16px;
    color: var(--text-secondary);
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: 12px;
}
</style>
