<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="icon-sparkle">✨</span>
          Godot 4.3 现已发布
          <span class="icon-lightning">⚡</span>
        </div>

        <h1 class="hero-title">
          <div class="title-line-1">Godot中文</div>
          <div class="title-line-2">开发者社群</div>
        </h1>

        <p class="hero-subtitle">
          连接每一位Godot开发者，分享知识、展示作品、共同成长
        </p>

        <div class="hero-actions">
          <button class="btn-primary" @click="$router.push('/article')">
            <el-icon class="btn-icon"><Monitor /></el-icon>
            开始学习
          </button>
          <button class="btn-secondary" @click="$router.push('/project')">
            加入讨论
          </button>
        </div>
      </div>
    </section>

    <!-- 统计数据区域 -->
    <section class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-value">{{ siteStats.userCount ? siteStats.userCount.toLocaleString() : '2,847' }}</div>
          <div class="stat-label">活跃成员</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ siteStats.articleCount ? siteStats.articleCount.toLocaleString() : '156' }}</div>
          <div class="stat-label">教程资源</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ siteStats.projectCount ? siteStats.projectCount.toLocaleString() : '89' }}</div>
          <div class="stat-label">开源项目</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ ((siteStats.articleCount || 0) + (siteStats.projectCount || 0)) || '3,421' }}</div>
          <div class="stat-label">讨论帖子</div>
        </div>
      </div>
    </section>

    <!-- 快速入口区域 -->
    <section class="quick-links-section">
      <div class="section-container">
        <h2 class="section-title">快速入口</h2>
        <div class="links-grid">
          <div class="link-card" @click="$router.push('/article')">
            <div class="link-icon-wrapper bg-blue">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="link-info">
              <h3>教程库</h3>
              <p>从入门到精通</p>
            </div>
          </div>
          <div class="link-card" @click="$router.push('/project')">
            <div class="link-icon-wrapper bg-purple">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="link-info">
              <h3>作品展示</h3>
              <p>发现优秀作品</p>
            </div>
          </div>
          <div class="link-card" @click="$router.push('/article')">
            <div class="link-icon-wrapper bg-green">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="link-info">
              <h3>技术论坛</h3>
              <p>交流开发经验</p>
            </div>
          </div>
          <div class="link-card">
            <div class="link-icon-wrapper bg-orange">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="link-info">
              <h3>活动日历</h3>
              <p>参与线上线下</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 下半部分内容：动态与教程 -->
    <section class="content-section">
      <div class="section-container content-grid">
        <!-- 左侧：最新动态 -->
        <div class="news-column">
          <div class="section-header">
            <h2 class="section-title">最新动态</h2>
            <span class="tag-news">news</span>
          </div>
          
          <div class="news-list">
            <!-- 置顶新闻（静态或混合动态） -->
            <div class="news-item featured">
              <div class="news-content">
                <h3>Godot 4.3 正式发布</h3>
                <p>全新渲染管线、改进的2D光照系统、更强大的GDScript</p>
              </div>
            </div>
            <div class="news-item event">
              <div class="news-content">
                <span class="tag-event">event</span>
                <h3>2024年度游戏开发大赛开启报名</h3>
                <p>总奖金池50万元，面向全球Godot开发者</p>
              </div>
            </div>
            
            <!-- 动态文章列表 -->
            <div v-if="loading" class="loading-state">
              <el-icon class="is-loading"><Loading /></el-icon> 加载中...
            </div>
            <div v-else class="dynamic-news">
              <div 
                v-for="article in articles.slice(0, 3)" 
                :key="article.id" 
                class="news-item"
                @click="$router.push(`/article/${article.articleId}`)"
              >
                <div class="news-content">
                  <h3>{{ article.title }}</h3>
                  <p>{{ article.summary || '查看详情...' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：精选教程 -->
        <div class="tutorial-column">
          <div class="section-header">
            <h2 class="section-title">精选教程</h2>
            <router-link to="/article" class="view-all">查看全部</router-link>
          </div>
          
          <div class="tutorial-list">
            <div class="tutorial-item" @click="$router.push('/article')">
              <div class="tutorial-tag tag-beginner">入门</div>
              <div class="tutorial-info">
                <h3>Godot 4.x 完全入门指南</h3>
                <div class="tutorial-meta">
                  <span class="rating"><el-icon><StarFilled /></el-icon> 4.8</span>
                  <span class="views"><el-icon><View /></el-icon> 12500</span>
                </div>
              </div>
            </div>
            
            <div class="tutorial-item" @click="$router.push('/article')">
              <div class="tutorial-tag tag-intermediate">进阶</div>
              <div class="tutorial-info">
                <h3>2D平台跳跃游戏开发实战</h3>
                <div class="tutorial-meta">
                  <span class="rating"><el-icon><StarFilled /></el-icon> 4.9</span>
                  <span class="views"><el-icon><View /></el-icon> 8900</span>
                </div>
              </div>
            </div>
            
            <div class="tutorial-item" @click="$router.push('/article')">
              <div class="tutorial-tag tag-advanced">高级</div>
              <div class="tutorial-info">
                <h3>高级着色器编程技巧</h3>
                <div class="tutorial-meta">
                  <span class="rating"><el-icon><StarFilled /></el-icon> 4.7</span>
                  <span class="views"><el-icon><View /></el-icon> 5600</span>
                </div>
              </div>
            </div>
            
            <!-- 动态项目/文章填充 -->
            <div 
              v-for="project in projects.slice(0, 2)" 
              :key="project.id" 
              class="tutorial-item dynamic"
              @click="$router.push(`/project/${project.projectId}`)"
            >
              <div class="tutorial-tag tag-dynamic">推荐</div>
              <div class="tutorial-info">
                <h3>{{ project.title }}</h3>
                <div class="tutorial-meta">
                  <span class="rating"><el-icon><StarFilled /></el-icon> 5.0</span>
                  <span class="views"><el-icon><View /></el-icon> 1200+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Monitor, Reading, ChatLineRound, Calendar, 
  Loading, StarFilled, View 
} from '@element-plus/icons-vue'
import { articleApi } from '@/api/article'
import { projectApi } from '@/api/project'
import { statsApi } from '@/api/stats'
import type { ArticleDto } from '@/api/article'
import type { ProjectDto } from '@/api/project'
import type { SiteStatsDto } from '@/api/stats'

const loading = ref(true)
const articles = ref<ArticleDto[]>([])
const projects = ref<ProjectDto[]>([])
const siteStats = ref<SiteStatsDto>({ articleCount: 0, projectCount: 0, userCount: 0, categoryCount: 0 })

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
    const projectRes = await projectApi.getList()
    projects.value = projectRes.data
  } catch (error) {
    console.error('加载项目失败:', error)
  }
}

const loadStats = async () => {
  try {
    const res = await statsApi.getSiteStats()
    siteStats.value = res.data
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  color: var(--color-text);
  padding-bottom: 64px;
}

/* 共有容器样式 */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 100px 24px 80px;
  text-align: center;
  overflow: hidden;
  
  .hero-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60vw;
    height: 60vw;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0) 70%);
    z-index: 0;
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    color: #94A3B8;
    margin-bottom: 32px;
    backdrop-filter: blur(4px);
    
    .icon-sparkle { color: #60A5FA; }
    .icon-lightning { color: #FBBF24; }
  }

  .hero-title {
    font-family: var(--font-heading);
    font-size: 72px;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -0.02em;

    .title-line-1 {
      color: #F8FAFC;
      font-weight: 700;
    }

    .title-line-2 {
      font-weight: 700;
      background: linear-gradient(135deg, #60A5FA 0%, #D946EF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .hero-subtitle {
    font-size: 18px;
    color: #94A3B8;
    max-width: 600px;
    margin-bottom: 40px;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 16px;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 16px;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      
      .btn-icon {
        font-size: 18px;
      }
    }

    .btn-primary {
      background-color: #3B82F6;
      color: white;
      
      &:hover {
        background-color: #2563EB;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
    }

    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.05);
      color: #F8FAFC;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }
    }
  }
}

/* Stats Section */
.stats-section {
  padding: 24px 0 64px;
  
  .stats-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
  }

  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #F8FAFC;
      font-family: var(--font-heading);
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #64748B;
      font-weight: 500;
    }
  }
}

/* Quick Links Section */
.quick-links-section {
  margin-bottom: 64px;

  .links-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .link-card {
    background-color: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #273549;
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .link-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;

      &.bg-blue { background: linear-gradient(135deg, #60A5FA, #3B82F6); }
      &.bg-purple { background: linear-gradient(135deg, #A78BFA, #8B5CF6); }
      &.bg-green { background: linear-gradient(135deg, #34D399, #10B981); }
      &.bg-orange { background: linear-gradient(135deg, #FBBF24, #F59E0B); }
    }

    .link-info {
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #F8FAFC;
        margin-bottom: 4px;
      }
      p {
        font-size: 13px;
        color: #94A3B8;
      }
    }
  }
}

/* Content Section (News & Tutorials) */
.content-section {
  .content-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 40px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;

    .section-title {
      margin-bottom: 0;
    }

    .tag-news {
      background-color: rgba(59, 130, 246, 0.2);
      color: #60A5FA;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .view-all {
      margin-left: auto;
      color: #94A3B8;
      font-size: 14px;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #60A5FA;
      }
    }
  }

  .news-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .news-item {
      background-color: #1E293B;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #273549;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #F8FAFC;
      }

      p {
        font-size: 14px;
        color: #94A3B8;
        line-height: 1.5;
      }

      &.featured {
        border-left: 4px solid #3B82F6;
      }

      .tag-event {
        display: inline-block;
        background-color: rgba(217, 70, 239, 0.2);
        color: #D946EF;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
    }
  }

  .tutorial-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .tutorial-item {
      display: flex;
      gap: 16px;
      background-color: #1E293B;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #273549;
      }

      .tutorial-tag {
        width: 48px;
        height: 48px;
        flex-shrink: 0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        color: white;

        &.tag-beginner { background-color: #10B981; }
        &.tag-intermediate { background-color: #3B82F6; }
        &.tag-advanced { background-color: #8B5CF6; }
        &.tag-dynamic { background-color: #F59E0B; }
      }

      .tutorial-info {
        flex: 1;

        h3 {
          font-size: 15px;
          font-weight: 600;
          color: #F8FAFC;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .tutorial-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #64748B;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .rating {
            color: #FBBF24;
          }
        }
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .hero-section {
    .hero-title {
      font-size: 56px;
    }
  }

  .quick-links-section .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-section .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 60px 20px 40px;
    
    .hero-title {
      font-size: 40px;
    }
  }

  .stats-section .stats-container {
    gap: 32px;
    justify-content: center;
    
    .stat-item {
      width: 40%;
    }
  }

  .quick-links-section .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
