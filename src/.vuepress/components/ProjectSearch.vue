<template>
  <div class="project-search">
    <div class="search-header">
      <h3>🔍 项目搜索</h3>
      <p>快速找到你感兴趣的项目</p>
    </div>

    <div class="search-container">
      <div class="search-input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索项目名称、描述或标签..."
          class="search-input"
          @input="performSearch"
        />
        <button @click="clearSearch" class="clear-btn" v-if="searchQuery">
          ✕
        </button>
      </div>

      <div class="search-filters">
        <div class="quick-filters">
          <span class="filter-label">快速筛选：</span>
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            @click="applyQuickFilter(filter)"
            :class="['quick-filter-btn', { active: activeQuickFilter === filter.key }]"
          >
            {{ filter.icon }} {{ filter.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="searchQuery || activeQuickFilter" class="search-results">
      <div class="results-header">
        <h4>
          搜索结果
          <span class="results-count">({{ searchResults.length }} 个项目)</span>
        </h4>
        <button @click="clearAllFilters" class="clear-all-btn">
          清除所有筛选
        </button>
      </div>

      <div v-if="searchResults.length === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h4>没有找到匹配的项目</h4>
        <p>尝试调整搜索关键词或筛选条件</p>
      </div>

      <div v-else class="results-grid">
        <div
          v-for="project in searchResults"
          :key="project.id"
          class="result-card"
          @click="selectProject(project)"
        >
          <div class="result-header">
            <h5 class="result-title" v-html="highlightText(project.title)"></h5>
            <span class="result-status" :class="getStatusClass(project.status)">
              {{ getStatusIcon(project.status) }} {{ project.status }}
            </span>
          </div>

          <div class="result-meta">
            <span v-if="project.category" class="result-category">
              {{ getCategoryIcon(project.category) }} {{ project.category }}
            </span>
            <span class="result-date">{{ formatDate(project.created_time) }}</span>
          </div>

          <p class="result-description" v-html="highlightText(truncateText(project.description || '', 100))"></p>

          <div v-if="project.tags && project.tags.length > 0" class="result-tags">
            <span
              v-for="tag in project.tags.slice(0, 3)"
              :key="tag"
              class="result-tag"
              v-html="highlightText(tag)"
            ></span>
            <span v-if="project.tags.length > 3" class="more-tags">
              +{{ project.tags.length - 3 }}
            </span>
          </div>

          <div class="result-footer">
            <span class="result-author">👤 {{ project.author }}</span>
            <div class="result-actions">
              <button @click.stop="toggleFavorite(project)" class="action-btn">
                {{ project.isFavorite ? '❤️' : '🤍' }}
              </button>
            </div>
          </div>
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
              <span :class="getStatusClass(selectedProject.status)">
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
              <strong>创建者：</strong>
              👤 {{ selectedProject.author }}
            </div>
            <div class="detail-item">
              <strong>创建时间：</strong>
              {{ formatDate(selectedProject.created_time) }}
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
import { ref, computed, onMounted } from 'vue'
import { projectApi } from '../utils/request.ts'

const searchQuery = ref('')
const activeQuickFilter = ref('')
const selectedProject = ref(null)
const projects = ref([])

const quickFilters = [
  { key: 'recent', label: '最近创建', icon: '🆕' },
  { key: 'inProgress', label: '进行中', icon: '🚀' },
  { key: 'completed', label: '已完成', icon: '✅' },
  { key: 'gamedev', label: '游戏开发', icon: '🎮' },
  { key: 'webapp', label: '网站应用', icon: '🌐' }
]

const searchResults = computed(() => {
  let results = projects.value

  // 应用快速筛选
  if (activeQuickFilter.value) {
    switch (activeQuickFilter.value) {
      case 'recent':
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        results = results.filter(p => new Date(p.created_time) > oneWeekAgo)
        break
      case 'inProgress':
        results = results.filter(p => p.status === '进行中')
        break
      case 'completed':
        results = results.filter(p => p.status === '已完成')
        break
      case 'gamedev':
        results = results.filter(p => p.category === '游戏开发' || p.category === '2D' || p.category === '3D')
        break
      case 'webapp':
        results = results.filter(p => p.category === '网站应用')
        break
    }
  }

  // 应用文本搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    results = results.filter(project => {
      const projectName = project.title || ''
      return (
        projectName.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (project.category && project.category.toLowerCase().includes(query)) ||
        (project.author && project.author.toLowerCase().includes(query))
      )
    })
  }

  // 按相关性排序
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    results.sort((a, b) => {
      const aScore = getRelevanceScore(a, query)
      const bScore = getRelevanceScore(b, query)
      return bScore - aScore
    })
  }

  return results
})

const loadProjects = async () => {
  try {
    const response = await projectApi.getProjects()
    if (response.success) {
      // 处理API返回的数据格式，统一字段名
      projects.value = response.data.map(project => ({
        ...project,
        name: project.title,
        createdAt: project.created_time
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

const performSearch = () => {
  // 搜索时清除快速筛选
  if (searchQuery.value.trim()) {
    activeQuickFilter.value = ''
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const applyQuickFilter = (filter) => {
  if (activeQuickFilter.value === filter.key) {
    activeQuickFilter.value = ''
  } else {
    activeQuickFilter.value = filter.key
    searchQuery.value = ''
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  activeQuickFilter.value = ''
}

const applySuggestion = (suggestion) => {
  searchQuery.value = suggestion
  performSearch()
}

const selectProject = (project) => {
  selectedProject.value = project
}

const closeModal = () => {
  selectedProject.value = null
}

const toggleFavorite = async (project) => {
  project.isFavorite = !project.isFavorite
  
  try {
    // 这里可以调用API更新收藏状态，如果后端支持的话
    // await projectApi.updateProject(project.project_id || project.id, { isFavorite: project.isFavorite })
    
    // 暂时保存到localStorage作为本地状态
    localStorage.setItem('farmProjects', JSON.stringify(projects.value))
  } catch (error) {
    console.error('更新收藏状态失败:', error)
    // 恢复状态
    project.isFavorite = !project.isFavorite
  }
}

const getRelevanceScore = (project, query) => {
  let score = 0
  
  const projectName = project.title || ''
  
  // 项目名称匹配权重最高
  if (projectName.toLowerCase().includes(query)) {
    score += 10
    if (projectName.toLowerCase().startsWith(query)) {
      score += 5
    }
  }
  
  // 描述匹配
  if (project.description && project.description.toLowerCase().includes(query)) {
    score += 5
  }
  
  // 标签匹配
  if (project.tags && project.tags.some(tag => tag.toLowerCase().includes(query))) {
    score += 3
  }
  
  // 分类匹配
  if (project.category && project.category.toLowerCase().includes(query)) {
    score += 2
  }
  
  return score
}

const highlightText = (text) => {
  if (!searchQuery.value.trim()) return text
  
  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
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

const getCategoryIcon = (category) => {
  const icons = {
    '游戏开发': '🎮',
    '网站应用': '🌐',
    '移动应用': '📱',
    '工具软件': '🔧',
    '学习项目': '📚',
    '开源贡献': '🤝',
    '其他': '🎯'
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

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.project-search {
  max-width: 1000px;
  margin: 0 auto;
}

.search-header {
  text-align: center;
  margin-bottom: 30px;
}

.search-header h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.5em;
}

.search-header p {
  color: #7f8c8d;
  font-size: 1.1em;
}

.search-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-sizing: border-box;
  overflow: hidden;
}

.search-input-group {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.search-input {
  width: 100%;
  max-width: 100%;
  padding: 15px 50px 15px 20px;
  border: none;
  border-radius: 25px;
  font-size: 1.1em;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  box-sizing: border-box;
  display: block;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.clear-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2em;
  color: #95a5a6;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #ecf0f1;
  color: #e74c3c;
}

.search-filters {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  box-sizing: border-box;
}

.quick-filters {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

.filter-label {
  color: white;
  font-weight: 600;
  white-space: nowrap;
  margin-bottom: 8px;
  width: 100%;
  display: block;
}

.quick-filter-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85em;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;
}

.quick-filter-btn:hover {
  background: rgba(255,255,255,0.3);
  border-color: rgba(255,255,255,0.5);
}

.quick-filter-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

.search-results {
  margin-bottom: 30px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.results-header h4 {
  margin: 0;
  color: #2c3e50;
}

.results-count {
  color: #7f8c8d;
  font-weight: normal;
}

.clear-all-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  background: #c0392b;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.no-results-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 3px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.result-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1em;
  flex: 1;
  margin-right: 10px;
}

.result-status {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 600;
  white-space: nowrap;
}

.status-progress { background: #3498db; color: white; }
.status-completed { background: #27ae60; color: white; }
.status-paused { background: #f39c12; color: white; }
.status-planned { background: #9b59b6; color: white; }
.status-default { background: #95a5a6; color: white; }

.result-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.85em;
  color: #7f8c8d;
}

.result-category {
  display: flex;
  align-items: center;
  gap: 5px;
}

.result-description {
  color: #34495e;
  line-height: 1.5;
  margin-bottom: 12px;
  font-size: 0.95em;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.result-tag {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75em;
}

.more-tags {
  background: #bdc3c7;
  color: white;
  padding: 3px 6px;
  border-radius: 10px;
  font-size: 0.75em;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  color: #95a5a6;
  border-top: 1px solid #ecf0f1;
  padding-top: 12px;
}

.result-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.1em;
  cursor: pointer;
  padding: 3px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.2);
}

.search-suggestions {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
}

.search-suggestions h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.suggestion-item:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.suggestion-icon {
  font-size: 1.5em;
}

.suggestion-text {
  color: #2c3e50;
  font-weight: 500;
}

/* 高亮样式 */
:deep(mark) {
  background: #f1c40f;
  color: #2c3e50;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
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
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
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
  .search-container {
    padding: 15px;
    margin: 0 -5px 20px -5px;
  }
  
  .search-input {
    padding: 12px 45px 12px 15px;
    font-size: 1em;
  }
  
  .clear-btn {
    right: 12px;
    font-size: 1.1em;
  }
  
  .quick-filters {
    gap: 6px;
  }
  
  .filter-label {
    margin-bottom: 10px;
    font-size: 0.9em;
  }
  
  .quick-filter-btn {
    padding: 6px 10px;
    font-size: 0.8em;
    border-radius: 15px;
  }
  
  .results-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 10px;
    max-height: 90vh;
  }
}

@media (max-width: 480px) {
  .search-container {
    padding: 12px;
    margin: 0 -8px 15px -8px;
  }
  
  .search-input {
    padding: 10px 40px 10px 12px;
    font-size: 0.95em;
  }
  
  .quick-filter-btn {
    padding: 5px 8px;
    font-size: 0.75em;
    min-width: auto;
  }
}

/* 暗色模式样式 */
[data-theme='dark'] {
  .search-container {
    background: var(--vp-c-bg);
    color: var(--vp-c-text);
  }

  .search-header {
    background: linear-gradient(135deg, #3dd68c 0%, #349469 100%);
    color: var(--vp-c-text);
  }

  .search-header h2 {
    color: var(--vp-c-text);
  }

  .search-header p {
    color: var(--vp-c-text-mute);
  }

  .search-form {
    background: var(--vp-c-bg-elv);
  }

  .search-input-group {
    background: var(--vp-c-bg);
    border: 2px solid var(--vp-c-border);
  }

  .search-input-group:focus-within {
    border-color: var(--vp-c-accent);
  }

  .search-input {
    background: transparent;
    color: var(--vp-c-text);
  }

  .search-input::placeholder {
    color: var(--vp-c-text-subtle);
  }

  .clear-btn {
    color: var(--vp-c-text-mute);
  }

  .clear-btn:hover {
    color: var(--vp-c-accent);
  }

  .quick-filters {
    background: var(--vp-c-bg-elv);
  }

  .quick-filter-btn {
    background: var(--vp-c-control);
    color: var(--vp-c-text);
    border: 1px solid var(--vp-c-border);
  }

  .quick-filter-btn:hover {
    background: var(--vp-c-control-hover);
    border-color: var(--vp-c-accent);
  }

  .quick-filter-btn.active {
    background: var(--vp-c-accent);
    color: white;
    border-color: var(--vp-c-accent);
  }

  .search-results {
    background: var(--vp-c-bg);
  }

  .results-header {
    color: var(--vp-c-text);
  }

  .result-item {
    background: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-border);
    color: var(--vp-c-text);
  }

  .result-item:hover {
    border-color: var(--vp-c-accent);
    box-shadow: 0 4px 12px var(--vp-c-shadow);
  }

  .result-title {
    color: var(--vp-c-text);
  }

  .result-meta {
    color: var(--vp-c-text-mute);
  }

  .result-description {
    color: var(--vp-c-text-mute);
  }

  .result-tags .tag {
    background: var(--vp-c-control);
    color: var(--vp-c-text);
  }

  .no-results {
    color: var(--vp-c-text-mute);
  }

  .status-progress { background: #3dd68c; color: white; }
  .status-completed { background: #3aa675; color: white; }
  .status-paused { background: #f39c12; color: white; }
  .status-planned { background: #9b59b6; color: white; }
  .status-default { background: var(--vp-c-control); color: var(--vp-c-text); }
}
</style>