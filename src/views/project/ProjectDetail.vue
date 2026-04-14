<template>
  <div class="project-detail-page">
    <div class="project-container" v-if="project">
      <!-- 项目头部 -->
      <header class="project-header card">
        <div class="header-top">
          <div class="header-tags">
            <el-tag :type="getStatusType(project.status)" size="large">
              {{ project.status }}
            </el-tag>
            <el-tag size="large" effect="plain">{{ project.type }}</el-tag>
          </div>
          <div class="header-actions" v-if="isOwner">
            <el-button @click="$router.push(`/project/${project.projectId}/edit`)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>

        <h1 class="project-title">{{ project.title }}</h1>

        <div class="project-meta">
          <span class="meta-item">
            <el-icon><User /></el-icon>
            {{ project.author }}
          </span>
          <span class="meta-item" v-if="project.githubUser">
            <el-icon><Link /></el-icon>
            @{{ project.githubUser }}
          </span>
          <span class="meta-item" v-if="project.contact">
            <el-icon><Message /></el-icon>
            {{ project.contact }}
          </span>
        </div>

        <div class="project-progress">
          <div class="progress-header">
            <span>项目进度</span>
            <span class="progress-value">{{ project.progress || 0 }}%</span>
          </div>
          <el-progress :percentage="project.progress || 0" :stroke-width="10" />
        </div>

        <p class="project-desc">{{ project.description || '暂无描述' }}</p>

        <div class="project-tags" v-if="project.tags?.length">
          <el-tag
            v-for="tag in project.tags"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div class="project-badges">
          <span v-if="project.isOpenSource" class="badge">
            <el-icon><Unlock /></el-icon>开源项目
          </span>
          <span v-if="project.needHelp" class="badge help">
            <el-icon><QuestionFilled /></el-icon>需要帮助
          </span>
          <span v-if="project.allowCollaboration" class="badge">
            <el-icon><Plus /></el-icon>可协作开发
          </span>
        </div>

        <div class="project-links" v-if="project.repository || project.demoUrl">
          <a
            v-if="project.repository"
            :href="project.repository"
            target="_blank"
            class="project-link"
          >
            <el-icon><Link /></el-icon>
            源代码
          </a>
          <a
            v-if="project.demoUrl"
            :href="project.demoUrl"
            target="_blank"
            class="project-link"
          >
            <el-icon><View /></el-icon>
            在线体验
          </a>
        </div>
      </header>

      <!-- 项目更新 -->
      <section class="project-updates card">
        <div class="section-header">
          <h3><el-icon><Timer /></el-icon>更新日志</h3>
          <el-button v-if="authStore.isLoggedIn" type="primary" size="small" @click="showAddUpdate">
            <el-icon><Plus /></el-icon>
            添加更新
          </el-button>
        </div>

        <div v-if="updates.length === 0" class="empty-updates">
          暂无更新日志
        </div>

        <div v-else class="updates-timeline">
          <div v-for="update in updates" :key="update.id" class="update-item">
            <div class="update-marker"></div>
            <div class="update-content">
              <div class="update-header">
                <span class="update-date">{{ formatDate(update.updateDate) }}</span>
                <span v-if="update.progress" class="update-progress">
                  进度: {{ update.progress }}%
                </span>
              </div>
              <p class="update-text">{{ update.content }}</p>
              <span class="update-time">{{ formatTime(update.createdTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 添加更新表单 -->
        <el-dialog v-model="showUpdateDialog" title="添加项目更新" width="500px">
          <el-form :model="updateForm" label-position="top">
            <el-form-item label="更新内容">
              <el-input
                v-model="updateForm.content"
                type="textarea"
                :rows="4"
                placeholder="描述这次更新..."
              />
            </el-form-item>
            <el-form-item label="进度 (0-100)">
              <el-slider v-model="updateForm.progress" :min="0" :max="100" show-input />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showUpdateDialog = false">取消</el-button>
            <el-button type="primary" @click="handleAddUpdate" :loading="updateLoading">
              发布更新
            </el-button>
          </template>
        </el-dialog>
      </section>
    </div>

    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <div v-else class="empty-state">
      <p>项目不存在或已被删除</p>
      <el-button type="primary" @click="$router.push('/project')">
        返回项目列表
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Edit, Delete, User, Link, Message, Unlock, QuestionFilled,
  Plus, View, Timer, Loading
} from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import type { ProjectDto, ProjectUpdateDto } from '@/api/project'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const project = ref<ProjectDto | null>(null)
const updates = ref<ProjectUpdateDto[]>([])
const showUpdateDialog = ref(false)
const updateLoading = ref(false)

const updateForm = reactive({
  content: '',
  progress: 0
})

const projectId = computed(() => route.params.id as string)

const isOwner = computed(() => {
  return authStore.userInfo?.userName === project.value?.author
})

onMounted(() => {
  loadProject()
})

const loadProject = async () => {
  loading.value = true
  try {
    const res = await projectApi.getById(projectId.value)
    project.value = res.data

    const updatesRes = await projectApi.getUpdates(projectId.value)
    updates.value = updatesRes.data
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '进行中': 'success',
    '已完成': 'primary',
    '已暂停': 'warning',
    '已取消': 'info'
  }
  return statusMap[status] || 'info'
}

const showAddUpdate = () => {
  updateForm.content = ''
  updateForm.progress = project.value?.progress || 0
  showUpdateDialog.value = true
}

const handleAddUpdate = async () => {
  if (!updateForm.content.trim()) {
    ElMessage.warning('请输入更新内容')
    return
  }

  updateLoading.value = true
  try {
    await projectApi.addUpdate(projectId.value, {
      content: updateForm.content,
      progress: updateForm.progress
    })
    ElMessage.success('更新发布成功')
    showUpdateDialog.value = false
    await loadProject()
  } catch (error) {
    // 错误已在拦截器处理
  } finally {
    updateLoading.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await projectApi.delete(projectId.value)
    ElMessage.success('删除成功')
    router.push('/project')
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器处理
    }
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}
</script>

<style scoped lang="scss">
.project-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.project-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-header {
  padding: 32px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .header-tags {
      display: flex;
      gap: 8px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .project-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .project-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      font-size: 14px;
    }
  }

  .project-progress {
    margin-bottom: 20px;

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--text-secondary);

      .progress-value {
        font-weight: 600;
        color: var(--primary-color);
      }
    }
  }

  .project-desc {
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .project-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .project-badges {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #f0f9eb;
      color: #67c23a;
      border-radius: 6px;
      font-size: 13px;

      &.help {
        background: #fef0f0;
        color: #f56c6c;
      }
    }
  }

  .project-links {
    display: flex;
    gap: 16px;

    .project-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--primary-color);
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.project-updates {
  padding: 24px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
    }
  }

  .empty-updates {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
  }

  .updates-timeline {
    position: relative;
    padding-left: 24px;

    &::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      background: var(--border-color);
    }

    .update-item {
      position: relative;
      padding-bottom: 24px;

      &:last-child {
        padding-bottom: 0;
      }

      .update-marker {
        position: absolute;
        left: -24px;
        top: -4px;
        width: 12px;
        height: 12px;
        background: var(--primary-color);
        border-radius: 50%;
        border: 2px solid var(--card-bg);
      }

      .update-content {
        background: var(--bg-color);
        border-radius: 8px;
        padding: 16px;

        .update-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .update-date {
            font-weight: 600;
            color: var(--text-primary);
          }

          .update-progress {
            font-size: 13px;
            color: var(--primary-color);
          }
        }

        .update-text {
          color: var(--text-primary);
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .update-time {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--card-bg);
  border-radius: 12px;

  p {
    margin-bottom: 24px;
    color: var(--text-secondary);
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
