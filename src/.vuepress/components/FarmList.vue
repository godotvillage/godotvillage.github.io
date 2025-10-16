<template>
  <div class="project-list">
    <div class="list-header">
      <h3>🌾 农场项目展示</h3>
      <div class="stats">
        <span class="stat-item">
          <span class="stat-number">{{ projects.length }}</span>
          <span class="stat-label">总项目数</span>
        </span>
        <span class="stat-item">
          <span class="stat-number">{{ inProgressCount }}</span>
          <span class="stat-label">进行中</span>
        </span>
        <span class="stat-item">
          <span class="stat-number">{{ completedCount }}</span>
          <span class="stat-label">已完成</span>
        </span>
      </div>
    </div>

    <div class="filter-controls">
      <div class="filter-group">
        <label>状态筛选：</label>
        <select v-model="statusFilter">
          <option value="">全部状态</option>
          <option value="进行中">🚀 进行中</option>
          <option value="已完成">✅ 已完成</option>
          <option value="暂停">⏸️ 暂停</option>
          <option value="计划中">📋 计划中</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>分类筛选：</label>
        <select v-model="categoryFilter">
          <option value="">全部分类</option>
          <option value="2D">🎨 2D</option>
          <option value="3D">🎯 3D</option>
        </select>
      </div>

      <div class="filter-group">
        <label>排序方式：</label>
        <select v-model="sortBy">
          <option value="newest">最新创建</option>
          <option value="oldest">最早创建</option>
          <option value="name">项目名称</option>
        </select>
      </div>
    </div>

    <div v-if="filteredProjects.length === 0" class="empty-state">
      <div class="empty-icon">🌱</div>
      <h4>还没有项目哦</h4>
      <p>成为第一个在农场种下创意种子的人吧！</p>
    </div>

    <div v-else class="projects-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
        @click="selectProject(project)"
      >
        <div class="project-content">
          <div class="project-header">
            <h4 class="project-title">{{ project.title }}</h4>
            <div class="project-status" :class="getStatusClass(project.status)">
              {{ getStatusIcon(project.status) }} {{ project.status }}
            </div>
          </div>

          <div class="project-meta">
            <span v-if="project.category" class="project-category">
              {{ getCategoryIcon(project.category) }} {{ project.category }}
            </span>
            <span v-if="project.expectedTime" class="project-time">
              ⏰ {{ project.expectedTime }}
            </span>
          </div>

          <p class="project-description">{{ truncateText(project.description, 120) }}</p>

          <div v-if="project.tags && project.tags.length > 0" class="project-tags">
            <span
              v-for="tag in project.tags.slice(0, 3)"
              :key="tag"
              class="project-tag"
            >
              {{ tag }}
            </span>
            <span v-if="project.tags.length > 3" class="more-tags">
              +{{ project.tags.length - 3 }}
            </span>
          </div>

          <div class="project-footer">
            <span class="project-author">👤 {{ project.author }}</span>
            <span class="project-date">{{ formatDate(project.create_time) }}</span>
          </div>
        </div>

        <div class="project-actions">
          <button @click.stop="toggleStatus(project)" class="action-btn status-btn">
            {{ getNextStatusIcon(project.status) }}
          </button>
        </div>
      </div>
    </div>

    <!-- 项目详情模态框 -->
    <div v-if="selectedProject" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedProject.title }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="project-detail-meta">
            <div class="detail-item">
              <strong>状态：</strong>
              <span class="project-status" :class="getStatusClass(selectedProject.status)">
                {{ getStatusIcon(selectedProject.status) }} {{ selectedProject.status }}
              </span>
            </div>
            <div v-if="selectedProject.category" class="detail-item">
              <strong>分类：</strong>
              {{ getCategoryIcon(selectedProject.category) }} {{ selectedProject.category }}
            </div>
            <div v-if="selectedProject.expectedTime" class="detail-item">
              <strong>预期完成时间：</strong>
              ⏰ {{ selectedProject.expectedTime }}
            </div>
            <div class="detail-item">
              <strong>填写人：</strong>
              👤 {{ selectedProject.author }}
            </div>
            <div class="detail-item">
              <strong>创建时间：</strong>
              {{ formatDate(selectedProject.create_time) }}
            </div>
          </div>

          <div class="detail-description">
            <strong>项目描述：</strong>
            <p>{{ selectedProject.description }}</p>
          </div>

          <div v-if="selectedProject.tags && selectedProject.tags.length > 0" class="detail-tags">
            <strong>标签：</strong>
            <div class="tags-list">
              <span
                v-for="tag in selectedProject.tags"
                :key="tag"
                class="detail-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { projectApi } from '../utils/request.ts'

const projects = ref([])
const selectedProject = ref(null)
const statusFilter = ref('')
const categoryFilter = ref('')
const sortBy = ref('newest')

const inProgressCount = computed(() => 
  projects.value.filter(p => p.status === '进行中').length
)

const completedCount = computed(() => 
  projects.value.filter(p => p.status === '已完成').length
)

const filteredProjects = computed(() => {
  let filtered = projects.value

  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(p => p.category === categoryFilter.value)
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest':
        return new Date(a.create_time) - new Date(b.create_time)
      case 'name':
        return (a.title).localeCompare(b.title)
      case 'newest':
      default:
        return new Date(b.create_time) - new Date(a.create_time)
    }
  })

  return filtered
})

const loadProjects = async () => {
  try {
    const response = await projectApi.getProjects()
    if (response.success) {
      // 处理API返回的数据格式，统一字段名
      projects.value = response.data.map(project => ({
        ...project,
        name: project.title,
        createdAt: project.create_time
      }))
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
    // 如果API调用失败，回退到localStorage方式
    const stored = localStorage.getItem('farmProjects')
    if (stored) {
      projects.value = JSON.parse(stored)
    }
  }
}

const saveProject = async (project) => {
  try {
    await projectApi.updateProject(project.farm_id, {
      status: project.status
    })
  } catch (error) {
    console.error('更新项目失败:', error)
    // 如果API调用失败，回退到localStorage方式
    localStorage.setItem('farmProjects', JSON.stringify(projects.value))
  }
}

const selectProject = (project) => {
  selectedProject.value = project
  // 防止背景滚动
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedProject.value = null
  // 恢复背景滚动
  document.body.style.overflow = ''
}

const toggleStatus = async (project) => {
  const statusCycle = ['计划中', '进行中', '暂停', '已完成']
  const currentIndex = statusCycle.indexOf(project.status)
  const nextIndex = (currentIndex + 1) % statusCycle.length
  project.status = statusCycle[nextIndex]
  await saveProject(project)
}



const getStatusClass = (status) => {
  const classes = {
    '进行中': 'status-progress',
    '已完成': 'status-completed',
    '暂停': 'status-paused',
    '计划中': 'status-planned'
  }
  return classes[status] || 'status-default'
}

const getStatusIcon = (status) => {
  const icons = {
    '进行中': '🚀',
    '已完成': '✅',
    '暂停': '⏸️',
    '计划中': '📋'
  }
  return icons[status] || '📝'
}

const getNextStatusIcon = (status) => {
  const nextIcons = {
    '计划中': '🚀',
    '进行中': '⏸️',
    '暂停': '✅',
    '已完成': '📋'
  }
  return nextIcons[status] || '🔄'
}

const getCategoryIcon = (category) => {
  const icons = {
    '2D': '🎨',
    '3D': '🎯'
  }
  return icons[category] || '📁'
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleProjectAdded = (event) => {
  loadProjects()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape' && selectedProject.value) {
    closeModal()
  }
}

onMounted(() => {
  loadProjects()
  window.addEventListener('projectAdded', handleProjectAdded)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('projectAdded', handleProjectAdded)
  document.removeEventListener('keydown', handleKeydown)
  // 确保在组件卸载时恢复滚动
  document.body.style.overflow = ''
})
</script>

<style scoped>
.project-list {
  max-width: 1200px;
  margin: 0 auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
}

.list-header h3 {
  margin: 0;
  font-size: 1.5em;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-number {
  font-size: 1.5em;
  font-weight: bold;
}

.stat-label {
  font-size: 0.9em;
  opacity: 0.9;
}

.filter-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  min-width: 120px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.project-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  display: flex;
  align-items: stretch;
  gap: 20px;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  border-color: #27ae60;
}

.project-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.project-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2em;
  flex: 1;
  margin-right: 10px;
}

.project-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  white-space: nowrap;
}

.status-progress { background: #3498db; color: white; }
.status-completed { background: #27ae60; color: white; }
.status-paused { background: #f39c12; color: white; }
.status-planned { background: #9b59b6; color: white; }
.status-default { background: #95a5a6; color: white; }

.project-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.9em;
  color: #7f8c8d;
}

.project-category,
.project-time {
  display: flex;
  align-items: center;
  gap: 5px;
}

.project-description {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 15px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.project-tag {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
}

.more-tags {
  background: #bdc3c7;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85em;
  color: #95a5a6;
  border-top: 1px solid #ecf0f1;
  padding-top: 15px;
}

.project-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-width: 50px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-actions {
  opacity: 1;
}

.action-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  font-size: 1.4em;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.action-btn:hover {
  background: #27ae60;
  border-color: #27ae60;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}



/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #95a5a6;
  padding: 5px;
  line-height: 1;
}

.close-btn:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 25px;
}

.project-detail-meta {
  display: grid;
  gap: 15px;
  margin-bottom: 25px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-item strong {
  min-width: 120px;
  color: #2c3e50;
}

.detail-description {
  margin-bottom: 25px;
}

.detail-description strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 10px;
}

.detail-description p {
  line-height: 1.6;
  color: #34495e;
  margin: 0;
}

.detail-tags strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag {
  background: #27ae60;
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .stats {
    justify-content: center;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .project-card {
    flex-direction: column;
    gap: 15px;
  }
  
  .project-content {
    order: 1;
  }
  
  .project-actions {
    order: 2;
    flex-direction: row;
    justify-content: center;
    opacity: 1;
    min-width: auto;
    padding-top: 10px;
    border-top: 1px solid #ecf0f1;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2em;
  }
  
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
    padding-top: 20px;
  }
  
  .modal-content {
    margin: 0;
    max-height: 90vh;
    width: 100%;
    max-width: none;
  }
}

/* 暗色模式样式 */
[data-theme='dark'] {
  .list-container {
    background: var(--vp-c-bg);
    color: var(--vp-c-text);
  }

  .list-header {
    background: linear-gradient(135deg, #3dd68c 0%, #349469 100%);
    color: var(--vp-c-text);
  }

  .filter-controls {
    background: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-border);
  }

  .filter-group label {
    color: var(--vp-c-text);
  }

  .filter-group select {
    background: white;
    color: #000000;
    border: 2px solid var(--vp-c-border);
  }

  .filter-group select:focus {
    border-color: var(--vp-c-accent);
    outline: none;
  }

  .filter-group select option {
    background: white;
    color: #000000;
  }

  .stats-card {
    background: var(--vp-c-bg-elv);
    border: 2px solid var(--vp-c-border);
    color: var(--vp-c-text);
  }

  .stats-card:hover {
    border-color: var(--vp-c-accent);
  }

  .project-card {
    background: var(--vp-c-bg-elv);
    border: 2px solid var(--vp-c-border);
    color: var(--vp-c-text);
  }

  .project-card:hover {
    border-color: var(--vp-c-accent);
    box-shadow: 0 10px 30px var(--vp-c-shadow);
  }

  .project-title {
    color: var(--vp-c-text);
  }

  .project-meta {
    color: var(--vp-c-text-mute);
  }

  .project-description {
    color: var(--vp-c-text-mute);
  }

  .project-tag {
    background: var(--vp-c-control);
    color: var(--vp-c-text);
  }

  .more-tags {
    background: var(--vp-c-control-hover);
    color: var(--vp-c-text);
  }

  .project-footer {
    color: var(--vp-c-text-subtle);
    border-top: 1px solid var(--vp-c-divider);
  }

  .action-btn {
    background: var(--vp-c-control);
    border: 2px solid var(--vp-c-border);
    color: var(--vp-c-text-mute);
  }

  .action-btn:hover {
    background: var(--vp-c-accent);
    border-color: var(--vp-c-accent);
    color: white;
    box-shadow: 0 4px 12px var(--vp-c-accent-soft);
  }

  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }

  .modal-content {
    background: var(--vp-c-bg-elv);
    color: var(--vp-c-text);
  }

  .modal-header {
    border-bottom: 1px solid var(--vp-c-divider);
  }

  .modal-header h3 {
    color: var(--vp-c-text);
  }

  .close-btn {
    color: var(--vp-c-text-mute);
  }

  .close-btn:hover {
    color: var(--vp-c-accent);
  }

  .project-detail-meta {
    color: var(--vp-c-text);
  }

  .detail-item strong {
    color: var(--vp-c-text);
  }

  .detail-description strong {
    color: var(--vp-c-text);
  }

  .detail-description p {
    color: var(--vp-c-text-mute);
  }

  .detail-tag {
    background: var(--vp-c-accent);
    color: white;
  }
}
</style>