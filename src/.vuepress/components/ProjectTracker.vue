<template>
  <div class="project-tracker">
    <!-- 头部操作区 -->
    <div class="tracker-header">
      <div class="header-left">
        <h3>🚀 群友项目跟踪</h3>
        <div class="stats">
          <span class="stat-item">
            <span class="stat-number">{{ projects.length }}</span>
            <span class="stat-label">总项目数</span>
          </span>
          <span class="stat-item">
            <span class="stat-number">{{ activeProjects }}</span>
            <span class="stat-label">进行中</span>
          </span>
          <span class="stat-item">
            <span class="stat-number">{{ completedProjects }}</span>
            <span class="stat-label">已完成</span>
          </span>
        </div>
      </div>
      <div class="header-right">
        <GitHubLogin 
          @login="handleUserLogin"
          @logout="handleUserLogout"
          @error="handleAuthError"
        />
        <button 
          class="btn-primary" 
          @click="showCreateModal = true"
          :disabled="!isLoggedIn"
          :title="isLoggedIn ? '创建新项目' : '请先登录GitHub'"
        >
          ➕ 创建新项目
        </button>
      </div>
    </div>

    <!-- 筛选和搜索区 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="filter-group">
          <label>🔍 搜索项目：</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="输入项目名称或作者..."
            class="search-input"
          />
        </div>
        
        <div class="filter-group">
          <label>📊 状态筛选：</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">全部状态</option>
            <option value="planning">📋 计划中</option>
            <option value="development">🚀 开发中</option>
            <option value="testing">🧪 测试中</option>
            <option value="completed">✅ 已完成</option>
            <option value="paused">⏸️ 暂停</option>
          </select>
        </div>

        <div class="filter-group">
          <label>🎯 类型筛选：</label>
          <select v-model="typeFilter" class="filter-select">
            <option value="">全部类型</option>
            <option value="2D">🎨 2D游戏</option>
            <option value="3D">🎯 3D游戏</option>
            <option value="tool">🔧 工具/插件</option>
            <option value="demo">🎮 演示项目</option>
          </select>
        </div>

        <div class="filter-group">
          <label>📅 排序方式：</label>
          <select v-model="sortBy" class="filter-select">
            <option value="newest">最新创建</option>
            <option value="updated">最近更新</option>
            <option value="name">项目名称</option>
            <option value="progress">完成度</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div v-if="filteredProjects.length === 0" class="empty-state">
      <div class="empty-icon">🌱</div>
      <h4>{{ searchQuery || statusFilter || typeFilter ? '没有找到匹配的项目' : '还没有项目哦' }}</h4>
      <p>{{ searchQuery || statusFilter || typeFilter ? '试试调整筛选条件' : '成为第一个分享项目的群友吧！' }}</p>
    </div>

    <div v-else class="projects-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
        @click="selectProject(project)"
      >
        <div class="project-header">
          <div class="project-title-section">
            <h4 class="project-title">{{ project.title }}</h4>
            <div class="project-status" :class="getStatusClass(project.status)">
              {{ getStatusIcon(project.status) }} {{ getStatusText(project.status) }}
            </div>
          </div>
          <div class="project-actions">
            <button 
              v-if="canEditProject(project)"
              class="btn-icon" 
              @click.stop="editProject(project)"
              title="编辑项目"
            >
              ✏️
            </button>
            <button 
              v-if="canEditProject(project)"
              class="btn-icon" 
              @click.stop="addUpdate(project)"
              title="添加更新"
            >
              📝
            </button>
          </div>
        </div>

        <div class="project-meta">
          <span class="project-type">
            {{ getTypeIcon(project.type) }} {{ project.type }}
          </span>
          <span class="project-author">👤 {{ project.author }}</span>
          <span class="project-date">📅 {{ formatDate(project.createdAt) }}</span>
        </div>

        <p class="project-description">{{ truncateText(project.description, 120) }}</p>

        <!-- 进度条 -->
        <div class="progress-section">
          <div class="progress-label">
            <span>完成度</span>
            <span class="progress-percent">{{ project.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: project.progress + '%' }"
              :class="getProgressClass(project.progress)"
            ></div>
          </div>
        </div>

        <!-- 标签 -->
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

        <!-- 最近更新 -->
        <div v-if="project.lastUpdate" class="last-update">
          <span class="update-icon">🔄</span>
          <span class="update-text">{{ formatDate(project.lastUpdate.date) }}: {{ project.lastUpdate.content }}</span>
        </div>
      </div>
    </div>

    <!-- 创建项目弹窗 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>🚀 创建新项目</h3>
          <button class="modal-close" @click="closeCreateModal">✕</button>
        </div>
        
        <!-- 分类选择器（参考论坛实现） -->
        <div class="category-selector">
          <div class="category-tabs">
            <div 
              v-for="category in projectCategories" 
              :key="category.id"
              class="category-tab"
              :class="{ active: newProject.categoryId === category.id }"
              @click="selectProjectCategory(category.id)"
            >
              <span v-html="category.emojiHTML" class="category-emoji"></span>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
          <div v-if="!newProject.categoryId" class="category-hint">
            💡 请先选择项目分类
          </div>
        </div>

        <form @submit.prevent="createProject" class="project-form">
          <div class="form-group">
            <label for="title">项目名称 *</label>
            <input 
              id="title"
              v-model="newProject.title" 
              type="text" 
              required 
              placeholder="输入项目名称..."
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="author">作者 *</label>
              <input 
                id="author"
                v-model="newProject.author" 
                type="text" 
                required 
                placeholder="输入你的昵称..."
              />
            </div>

            <div class="form-group">
              <label for="contact">联系方式</label>
              <input 
                id="contact"
                v-model="newProject.contact" 
                type="text" 
                placeholder="QQ、微信、邮箱等..."
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="type">项目类型 *</label>
              <select id="type" v-model="newProject.type" required>
                <option value="">选择类型</option>
                <option value="2D">🎨 2D游戏</option>
                <option value="3D">🎯 3D游戏</option>
                <option value="tool">🔧 工具/插件</option>
                <option value="demo">🎮 演示项目</option>
                <option value="tutorial">📚 教程项目</option>
                <option value="asset">🎭 资源包</option>
              </select>
            </div>

            <div class="form-group">
              <label for="status">当前状态 *</label>
              <select id="status" v-model="newProject.status" required>
                <option value="">选择状态</option>
                <option value="planning">📋 计划中</option>
                <option value="development">🚀 开发中</option>
                <option value="testing">🧪 测试中</option>
                <option value="completed">✅ 已完成</option>
                <option value="paused">⏸️ 暂停</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description">项目描述 *</label>
            <textarea 
              id="description"
              v-model="newProject.description" 
              required 
              placeholder="详细描述你的项目，包括玩法、特色、目标等..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="progress">完成度 (%)</label>
              <input 
                id="progress"
                v-model.number="newProject.progress" 
                type="number" 
                min="0" 
                max="100" 
                placeholder="0-100"
              />
            </div>

            <div class="form-group">
              <label for="expectedTime">预计完成时间</label>
              <input 
                id="expectedTime"
                v-model="newProject.expectedTime" 
                type="date"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="tags">标签 (用逗号分隔)</label>
            <input 
              id="tags"
              v-model="newProject.tagsInput" 
              type="text" 
              placeholder="例如: RPG, 像素风, 单人, 开源..."
            />
            <div class="tag-suggestions">
              <span class="suggestion-label">常用标签：</span>
              <span 
                v-for="tag in commonTags" 
                :key="tag"
                class="tag-suggestion"
                @click="addTag(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="repository">代码仓库</label>
              <input 
                id="repository"
                v-model="newProject.repository" 
                type="url" 
                placeholder="https://github.com/..."
              />
            </div>

            <div class="form-group">
              <label for="demoUrl">演示链接</label>
              <input 
                id="demoUrl"
                v-model="newProject.demoUrl" 
                type="url" 
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="form-group">
            <label for="teamMembers">团队成员 (可选)</label>
            <textarea 
              id="teamMembers"
              v-model="newProject.teamMembers" 
              placeholder="列出团队成员及其分工，例如：张三(程序)、李四(美术)..."
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="recruitmentInfo">招募信息 (可选)</label>
            <textarea 
              id="recruitmentInfo"
              v-model="newProject.recruitmentInfo" 
              placeholder="如果需要招募成员，请描述需要的技能和联系方式..."
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="newProject.isOpenSource"
                />
                <span class="checkmark"></span>
                开源项目
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="newProject.needHelp"
                />
                <span class="checkmark"></span>
                寻求帮助
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="newProject.allowCollaboration"
                />
                <span class="checkmark"></span>
                欢迎协作
              </label>
            </div>
          </div>

          <div v-if="createError" class="error-message">
            ❌ {{ createError }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeCreateModal">
              取消
            </button>
            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="!newProject.categoryId || createLoading"
            >
              {{ createLoading ? '创建中...' : '创建项目' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 项目详情弹窗 -->
    <div v-if="selectedProject" class="modal-overlay" @click="closeProjectDetail">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedProject.title }}</h3>
          <div class="modal-actions">
            <button 
              v-if="canEditProject(selectedProject)"
              class="btn-icon" 
              @click="editProject(selectedProject)" 
              title="编辑项目"
            >
              ✏️
            </button>
            <button 
              v-if="canEditProject(selectedProject)"
              class="btn-icon" 
              @click="addUpdate(selectedProject)" 
              title="添加更新"
            >
              📝
            </button>
            <button class="modal-close" @click="closeProjectDetail">✕</button>
          </div>
        </div>
        
        <div class="project-detail">
          <div class="detail-header">
            <div class="detail-meta">
              <span class="project-status" :class="getStatusClass(selectedProject.status)">
                {{ getStatusIcon(selectedProject.status) }} {{ getStatusText(selectedProject.status) }}
              </span>
              <span class="project-type">
                {{ getTypeIcon(selectedProject.type) }} {{ selectedProject.type }}
              </span>
              <span class="project-author">👤 {{ selectedProject.author }}</span>
              <span class="project-date">📅 {{ formatDate(selectedProject.createdAt) }}</span>
            </div>
            
            <div class="progress-section">
              <div class="progress-label">
                <span>完成度</span>
                <span class="progress-percent">{{ selectedProject.progress }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: selectedProject.progress + '%' }"
                  :class="getProgressClass(selectedProject.progress)"
                ></div>
              </div>
            </div>
          </div>

          <div class="detail-content">
            <div class="detail-section">
              <h4>📝 项目描述</h4>
              <p>{{ selectedProject.description }}</p>
            </div>

            <div v-if="selectedProject.tags && selectedProject.tags.length > 0" class="detail-section">
              <h4>🏷️ 标签</h4>
              <div class="project-tags">
                <span
                  v-for="tag in selectedProject.tags"
                  :key="tag"
                  class="project-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div v-if="selectedProject.repository" class="detail-section">
              <h4>💻 代码仓库</h4>
              <a :href="selectedProject.repository" target="_blank" class="repository-link">
                {{ selectedProject.repository }}
              </a>
            </div>

            <div v-if="selectedProject.updates && selectedProject.updates.length > 0" class="detail-section">
              <h4>📈 项目更新</h4>
              <div class="updates-timeline">
                <div
                  v-for="update in selectedProject.updates"
                  :key="update.id"
                  class="update-item"
                >
                  <div class="update-date">{{ formatDate(update.date) }}</div>
                  <div class="update-content">{{ update.content }}</div>
                  <div v-if="update.progress !== undefined" class="update-progress">
                    进度更新: {{ update.progress }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑项目弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✏️ 编辑项目</h3>
          <button class="modal-close" @click="closeEditModal">✕</button>
        </div>
        <form @submit.prevent="updateProject" class="project-form">
          <div class="form-group">
            <label for="edit-title">项目名称 *</label>
            <input 
              id="edit-title"
              v-model="editingProject.title" 
              type="text" 
              required 
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-type">项目类型 *</label>
              <select id="edit-type" v-model="editingProject.type" required>
                <option value="2D">🎨 2D游戏</option>
                <option value="3D">🎯 3D游戏</option>
                <option value="tool">🔧 工具/插件</option>
                <option value="demo">🎮 演示项目</option>
              </select>
            </div>

            <div class="form-group">
              <label for="edit-status">当前状态 *</label>
              <select id="edit-status" v-model="editingProject.status" required>
                <option value="planning">📋 计划中</option>
                <option value="development">🚀 开发中</option>
                <option value="testing">🧪 测试中</option>
                <option value="completed">✅ 已完成</option>
                <option value="paused">⏸️ 暂停</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="edit-description">项目描述 *</label>
            <textarea 
              id="edit-description"
              v-model="editingProject.description" 
              required 
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="edit-progress">完成度 (%)</label>
            <input 
              id="edit-progress"
              v-model.number="editingProject.progress" 
              type="number" 
              min="0" 
              max="100" 
            />
          </div>

          <div class="form-group">
            <label for="edit-tags">标签 (用逗号分隔)</label>
            <input 
              id="edit-tags"
              v-model="editingProject.tagsInput" 
              type="text" 
            />
          </div>

          <div class="form-group">
            <label for="edit-repository">代码仓库</label>
            <input 
              id="edit-repository"
              v-model="editingProject.repository" 
              type="url" 
            />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeEditModal">
              取消
            </button>
            <button type="submit" class="btn-primary">
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加更新弹窗 -->
    <div v-if="showUpdateModal" class="modal-overlay" @click="closeUpdateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📝 添加项目更新</h3>
          <button class="modal-close" @click="closeUpdateModal">✕</button>
        </div>
        <form @submit.prevent="submitUpdate" class="project-form">
          <div class="form-group">
            <label for="update-content">更新内容 *</label>
            <textarea 
              id="update-content"
              v-model="newUpdate.content" 
              required 
              placeholder="描述这次更新的内容..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="update-progress">更新完成度 (%)</label>
            <input 
              id="update-progress"
              v-model.number="newUpdate.progress" 
              type="number" 
              min="0" 
              max="100" 
              :placeholder="updatingProject?.progress || 0"
            />
            <small class="form-hint">留空则不更新完成度</small>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeUpdateModal">
              取消
            </button>
            <button type="submit" class="btn-primary">
              添加更新
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { githubAuth } from '../utils/githubAuth.js'

export default {
  name: 'ProjectTracker',
  data() {
    return {
      // 项目数据
      projects: [],
      projectCategories: [],
      
      // 筛选和搜索
      searchQuery: '',
      statusFilter: '',
      typeFilter: '',
      sortBy: 'newest',
      
      // 弹窗状态
      showCreateModal: false,
      showEditModal: false,
      showUpdateModal: false,
      selectedProject: null,
      
      // 加载和错误状态
      createLoading: false,
      createError: '',
      
      // 常用标签
      commonTags: [
        'RPG', '动作', '策略', '解谜', '平台跳跃', '射击',
        '像素风', '3D', '2D', '单人', '多人', '合作',
        '开源', '商业', '教育', '实验性', 'VR', 'AR'
      ],
      
      // 表单数据
      newProject: {
        title: '',
        author: '',
        contact: '',
        categoryId: '',
        type: '',
        status: '',
        description: '',
        progress: 0,
        expectedTime: '',
        tagsInput: '',
        repository: '',
        demoUrl: '',
        teamMembers: '',
        recruitmentInfo: '',
        isOpenSource: false,
        needHelp: false,
        allowCollaboration: false
      },
      
      editingProject: {},
      updatingProject: null,
      newUpdate: {
        content: '',
        progress: null
      }
    }
  },
  
  computed: {
    activeProjects() {
      return this.projects.filter(p => 
        p.status === 'development' || p.status === 'testing'
      ).length;
    },
    
    completedProjects() {
      return this.projects.filter(p => p.status === 'completed').length;
    },
    
    isLoggedIn() {
      return githubAuth.isLoggedIn();
    },
    
    filteredProjects() {
      let filtered = [...this.projects];
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(project => 
          project.title.toLowerCase().includes(query) ||
          project.author.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
        );
      }
      
      // 状态过滤
      if (this.statusFilter) {
        filtered = filtered.filter(project => project.status === this.statusFilter);
      }
      
      // 类型过滤
      if (this.typeFilter) {
        filtered = filtered.filter(project => project.type === this.typeFilter);
      }
      
      // 排序
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'updated':
            const aUpdate = a.lastUpdate ? new Date(a.lastUpdate.date) : new Date(a.createdAt);
            const bUpdate = b.lastUpdate ? new Date(b.lastUpdate.date) : new Date(b.createdAt);
            return bUpdate - aUpdate;
          case 'name':
            return a.title.localeCompare(b.title);
          case 'progress':
            return b.progress - a.progress;
          default:
            return 0;
        }
      });
      
      return filtered;
    }
  },
  
  mounted() {
    this.loadProjects();
    this.loadProjectCategories();
  },
  
  methods: {
    // 数据加载和保存
    async loadProjectCategories() {
      try {
        // 从API加载项目分类（参考论坛实现）
        const { projectApi } = await import('../utils/request.ts');
        const categories = await projectApi.getProjectCategories();
        this.projectCategories = categories;
      } catch (error) {
        console.error('加载项目分类失败:', error);
        // 使用默认分类
        this.projectCategories = [
          {
            id: 'game-2d',
            name: '2D游戏',
            emojiHTML: '🎨',
            description: '2D游戏项目'
          },
          {
            id: 'game-3d',
            name: '3D游戏',
            emojiHTML: '🎯',
            description: '3D游戏项目'
          },
          {
            id: 'tool',
            name: '工具/插件',
            emojiHTML: '🔧',
            description: '开发工具和插件'
          },
          {
            id: 'tutorial',
            name: '教程项目',
            emojiHTML: '📚',
            description: '教学和演示项目'
          },
          {
            id: 'asset',
            name: '资源包',
            emojiHTML: '🎭',
            description: '游戏资源和素材'
          },
          {
            id: 'other',
            name: '其他',
            emojiHTML: '📦',
            description: '其他类型项目'
          }
        ];
      }
    },

    loadProjects() {
      const saved = localStorage.getItem('godot-village-projects');
      if (saved) {
        this.projects = JSON.parse(saved);
      } else {
        // 示例数据
        this.projects = [
          {
            id: '1',
            title: '像素风RPG冒险',
            author: '小明',
            type: '2D',
            status: 'development',
            description: '一个经典的像素风RPG游戏，包含丰富的剧情和战斗系统。玩家将扮演一名年轻的冒险者，在神秘的大陆上展开冒险。',
            progress: 65,
            tags: ['RPG', '像素风', '单人', '剧情'],
            repository: 'https://github.com/example/pixel-rpg',
            createdAt: '2025-01-10',
            lastUpdate: {
              id: '1',
              date: '2025-01-15',
              content: '完成了战斗系统的基础框架，添加了技能系统'
            },
            updates: [
              {
                id: '1',
                date: '2025-01-15',
                content: '完成了战斗系统的基础框架，添加了技能系统',
                progress: 65
              },
              {
                id: '2',
                date: '2025-01-12',
                content: '设计并实现了主角的移动和动画系统',
                progress: 45
              }
            ]
          },
          {
            id: '2',
            title: '3D平台跳跃游戏',
            author: '小红',
            type: '3D',
            status: 'testing',
            description: '一个充满挑战的3D平台跳跃游戏，玩家需要通过精确的跳跃和时机掌握来完成各种关卡。',
            progress: 85,
            tags: ['平台', '3D', '挑战'],
            createdAt: '2025-01-05',
            lastUpdate: {
              id: '1',
              date: '2025-01-14',
              content: '完成了所有关卡的设计，正在进行最终测试'
            },
            updates: [
              {
                id: '1',
                date: '2025-01-14',
                content: '完成了所有关卡的设计，正在进行最终测试',
                progress: 85
              }
            ]
          }
        ];
        this.saveProjects();
      }
    },
    
    saveProjects() {
      localStorage.setItem('godot-village-projects', JSON.stringify(this.projects));
    },
    
    // 项目操作
    async createProject() {
      // 清除之前的错误
      this.createError = '';
      this.createLoading = true;

      try {
        // 表单验证
        if (!this.newProject.categoryId) {
          throw new Error('请选择项目分类');
        }
        if (!this.newProject.title.trim()) {
          throw new Error('请输入项目名称');
        }
        if (!this.newProject.author.trim()) {
          throw new Error('请输入作者名称');
        }
        if (!this.newProject.description.trim()) {
          throw new Error('请输入项目描述');
        }

        const project = {
          id: Date.now().toString(),
          title: this.newProject.title.trim(),
          author: this.newProject.author.trim(),
          contact: this.newProject.contact.trim(),
          categoryId: this.newProject.categoryId,
          type: this.newProject.type,
          status: this.newProject.status,
          description: this.newProject.description.trim(),
          progress: this.newProject.progress || 0,
          expectedTime: this.newProject.expectedTime || null,
          tags: this.newProject.tagsInput ? 
            this.newProject.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          repository: this.newProject.repository.trim() || null,
          demoUrl: this.newProject.demoUrl.trim() || null,
          teamMembers: this.newProject.teamMembers.trim() || null,
          recruitmentInfo: this.newProject.recruitmentInfo.trim() || null,
          isOpenSource: this.newProject.isOpenSource,
          needHelp: this.newProject.needHelp,
          allowCollaboration: this.newProject.allowCollaboration,
          createdAt: new Date().toISOString().split('T')[0],
          updates: []
        };

        // 尝试通过API创建项目
        try {
          const { projectApi } = await import('../utils/request.ts');
          const createdProject = await projectApi.createProject(project);
          // 如果API成功，使用返回的项目数据
          this.projects.unshift(createdProject);
        } catch (apiError) {
          console.warn('API创建失败，使用本地存储:', apiError);
          // API失败时使用本地存储
          this.projects.unshift(project);
        }
        
        this.saveProjects();
        this.closeCreateModal();
        this.resetNewProject();
      } catch (error) {
        this.createError = error.message;
      } finally {
        this.createLoading = false;
      }
    },
    
    editProject(project) {
      this.editingProject = {
        ...project,
        tagsInput: project.tags ? project.tags.join(', ') : ''
      };
      this.showEditModal = true;
      this.selectedProject = null;
    },
    
    updateProject() {
      const index = this.projects.findIndex(p => p.id === this.editingProject.id);
      if (index !== -1) {
        const updatedProject = {
          ...this.editingProject,
          tags: this.editingProject.tagsInput ? 
            this.editingProject.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };
        delete updatedProject.tagsInput;
        
        this.projects[index] = updatedProject;
        this.saveProjects();
      }
      this.closeEditModal();
    },
    
    addUpdate(project) {
      this.updatingProject = project;
      this.newUpdate = {
        content: '',
        progress: null
      };
      this.showUpdateModal = true;
      this.selectedProject = null;
    },
    
    submitUpdate() {
      if (!this.updatingProject) return;
      
      const update = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        content: this.newUpdate.content,
        progress: this.newUpdate.progress
      };
      
      const projectIndex = this.projects.findIndex(p => p.id === this.updatingProject.id);
      if (projectIndex !== -1) {
        if (!this.projects[projectIndex].updates) {
          this.projects[projectIndex].updates = [];
        }
        this.projects[projectIndex].updates.unshift(update);
        this.projects[projectIndex].lastUpdate = update;
        
        // 更新进度
        if (this.newUpdate.progress !== null && this.newUpdate.progress !== '') {
          this.projects[projectIndex].progress = this.newUpdate.progress;
        }
        
        this.saveProjects();
      }
      
      this.closeUpdateModal();
    },
    
    selectProject(project) {
      this.selectedProject = project;
    },
    
    // 弹窗控制
    closeCreateModal() {
      this.showCreateModal = false;
      this.resetNewProject();
    },
    
    closeEditModal() {
      this.showEditModal = false;
      this.editingProject = {};
    },
    
    closeUpdateModal() {
      this.showUpdateModal = false;
      this.updatingProject = null;
      this.newUpdate = { content: '', progress: null };
    },
    
    closeProjectDetail() {
      this.selectedProject = null;
    },
    
    resetNewProject() {
      this.newProject = {
        title: '',
        author: '',
        contact: '',
        categoryId: '',
        type: '',
        status: '',
        description: '',
        progress: 0,
        expectedTime: '',
        tagsInput: '',
        repository: '',
        demoUrl: '',
        teamMembers: '',
        recruitmentInfo: '',
        isOpenSource: false,
        needHelp: false,
        allowCollaboration: false
      };
      this.createError = '';
      this.createLoading = false;
    },

    // 分类和标签处理
    selectProjectCategory(categoryId) {
      this.newProject.categoryId = categoryId;
      this.createError = '';
    },

    addTag(tag) {
      const currentTags = this.newProject.tagsInput ? 
        this.newProject.tagsInput.split(',').map(t => t.trim()) : [];
      
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        this.newProject.tagsInput = currentTags.join(', ');
      }
    },
    
    // 工具方法
    getStatusIcon(status) {
      const icons = {
        planning: '📋',
        development: '🚀',
        testing: '🧪',
        completed: '✅',
        paused: '⏸️'
      };
      return icons[status] || '❓';
    },
    
    getStatusText(status) {
      const texts = {
        planning: '计划中',
        development: '开发中',
        testing: '测试中',
        completed: '已完成',
        paused: '暂停'
      };
      return texts[status] || '未知';
    },
    
    getStatusClass(status) {
      return `status-${status}`;
    },
    
    getTypeIcon(type) {
      const icons = {
        '2D': '🎨',
        '3D': '🎯',
        'tool': '🔧',
        'demo': '🎮'
      };
      return icons[type] || '📦';
    },
    
    getProgressClass(progress) {
      if (progress >= 80) return 'progress-high';
      if (progress >= 50) return 'progress-medium';
      if (progress >= 20) return 'progress-low';
      return 'progress-minimal';
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    // GitHub身份验证相关方法
    canEditProject(project) {
      // 首先检查用户是否已登录
      if (!this.isLoggedIn) {
        return false;
      }
      
      // 检查项目是否存在
      if (!project) {
        return false;
      }
      
      // 检查用户是否是项目作者
      return githubAuth.isProjectAuthor(project);
    },
    
    handleUserLogin(user) {
      // 处理用户登录
      console.log('用户已登录:', user);
      // 强制更新组件以反映登录状态变化
      this.$forceUpdate();
    },
    
    handleUserLogout() {
      // 处理用户登出
      console.log('用户已登出');
      // 强制更新组件以反映登录状态变化
      this.$forceUpdate();
    },
    
    handleAuthError(error) {
      // 处理认证错误
      console.error('认证错误:', error);
      alert('认证失败，请重试');
    }
  }
}
</script>

<style scoped>
.project-tracker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部样式 */
.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header-left h3 {
  margin: 0 0 15px 0;
  font-size: 1.5em;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9em;
  opacity: 0.9;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.search-input,
.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.empty-state h4 {
  margin-bottom: 10px;
  color: #495057;
}

/* 项目网格 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #667eea;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.project-title-section {
  flex: 1;
}

.project-title {
  margin: 0 0 8px 0;
  font-size: 1.2em;
  color: #212529;
}

.project-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.status-planning { background: #e3f2fd; color: #1976d2; }
.status-development { background: #e8f5e8; color: #388e3c; }
.status-testing { background: #fff3e0; color: #f57c00; }
.status-completed { background: #e8f5e8; color: #2e7d32; }
.status-paused { background: #fce4ec; color: #c2185b; }

.project-actions {
  display: flex;
  gap: 5px;
}

.project-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  font-size: 0.9em;
  color: #6c757d;
}

.project-description {
  margin-bottom: 15px;
  line-height: 1.5;
  color: #495057;
}

/* 进度条 */
.progress-section {
  margin-bottom: 15px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #495057;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-minimal { background: #dc3545; }
.progress-low { background: #fd7e14; }
.progress-medium { background: #ffc107; }
.progress-high { background: #28a745; }

/* 标签 */
.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
}

.project-tag {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.more-tags {
  background: #6c757d;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

/* 最近更新 */
.last-update {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9em;
  color: #495057;
}

.update-icon {
  font-size: 0.8em;
}

.update-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 按钮样式 */
.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-icon {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: rgba(0,0,0,0.1);
}

/* 弹窗样式 */
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
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(0,0,0,0.1);
}

/* 表单样式 */
.project-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-hint {
  display: block;
  margin-top: 5px;
  font-size: 0.8em;
  color: #6c757d;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* 项目详情 */
.project-detail {
  padding: 20px;
}

.detail-header {
  margin-bottom: 30px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.repository-link {
  color: #667eea;
  text-decoration: none;
}

.repository-link:hover {
  text-decoration: underline;
}

/* 更新时间线 */
.updates-timeline {
  space-y: 15px;
}

.update-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin-bottom: 15px;
}

.update-date {
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.update-content {
  margin-bottom: 8px;
  line-height: 1.5;
}

.update-progress {
  font-size: 0.9em;
  color: #667eea;
  font-weight: 500;
}

/* 分类选择器样式 */
.category-selector {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.category-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  justify-content: center;
}

.category-tab:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.category-tab.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.category-emoji {
  font-size: 1.2em;
}

.category-name {
  font-weight: 500;
  font-size: 0.9em;
}

.category-hint {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 10px;
}

/* 标签建议样式 */
.tag-suggestions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.suggestion-label {
  font-size: 0.8em;
  color: #6c757d;
  margin-right: 5px;
}

.tag-suggestion {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-suggestion:hover {
  background: #667eea;
  color: white;
}

/* 复选框样式 */
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9em;
  color: #495057;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ced4da;
  border-radius: 3px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* 错误消息样式 */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  margin-bottom: 15px;
  font-size: 0.9em;
}

/* 大型弹窗样式 */
.modal-large {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

/* 按钮禁用状态 */
.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary:disabled:hover {
  background: #6c757d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tracker-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .stats {
    justify-content: center;
  }
  
  .filter-controls {
    grid-template-columns: 1fr;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 10px;
    max-width: none;
  }
  
  .detail-meta {
    flex-direction: column;
    gap: 10px;
  }

  .category-tabs {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }

  .tag-suggestions {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 暗黑模式样式 */
[data-theme='dark'] .project-tracker {
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
}

[data-theme='dark'] .tracker-header h2 {
  color: var(--vp-c-text);
}

[data-theme='dark'] .stat-card {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text);
}

[data-theme='dark'] .stat-number {
  color: var(--vp-c-text);
}

[data-theme='dark'] .stat-label {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .filter-controls input,
[data-theme='dark'] .filter-controls select {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text);
}

[data-theme='dark'] .filter-controls input:focus,
[data-theme='dark'] .filter-controls select:focus {
  border-color: var(--vp-c-accent);
  box-shadow: 0 0 0 2px rgba(var(--vp-c-accent-rgb), 0.2);
}

[data-theme='dark'] .project-card {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text);
}

[data-theme='dark'] .project-card:hover {
  border-color: var(--vp-c-accent);
  box-shadow: 0 4px 12px var(--vp-c-shadow);
}

[data-theme='dark'] .project-title {
  color: var(--vp-c-text);
}

[data-theme='dark'] .project-author {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .project-description {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .project-meta {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .project-tags .tag {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text);
  border: 1px solid var(--vp-c-border);
}

[data-theme='dark'] .btn-primary {
  background: var(--vp-c-accent);
  color: var(--vp-c-bg);
}

[data-theme='dark'] .btn-primary:hover {
  background: var(--vp-c-accent-hover);
}

[data-theme='dark'] .btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text);
  border: 1px solid var(--vp-c-border);
}

[data-theme='dark'] .btn-secondary:hover {
  background: var(--vp-c-bg-elv);
  border-color: var(--vp-c-accent);
}

[data-theme='dark'] .btn-icon:hover {
  background: var(--vp-c-bg-soft);
}

[data-theme='dark'] .modal-overlay {
  background: rgba(0,0,0,0.7);
}

[data-theme='dark'] .modal-content {
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
}

[data-theme='dark'] .modal-header {
  border-bottom: 1px solid var(--vp-c-border);
}

[data-theme='dark'] .modal-header h3 {
  color: var(--vp-c-text);
}

[data-theme='dark'] .modal-close:hover {
  background: var(--vp-c-bg-soft);
}

[data-theme='dark'] .form-group label {
  color: var(--vp-c-text);
}

[data-theme='dark'] .form-group input,
[data-theme='dark'] .form-group select,
[data-theme='dark'] .form-group textarea {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text);
}

[data-theme='dark'] .form-group input:focus,
[data-theme='dark'] .form-group select:focus,
[data-theme='dark'] .form-group textarea:focus {
  border-color: var(--vp-c-accent);
  box-shadow: 0 0 0 2px rgba(var(--vp-c-accent-rgb), 0.2);
}

[data-theme='dark'] .form-hint {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .form-actions {
  border-top: 1px solid var(--vp-c-border);
}

[data-theme='dark'] .detail-section h4 {
  color: var(--vp-c-text);
}

[data-theme='dark'] .repository-link {
  color: var(--vp-c-accent);
}

[data-theme='dark'] .update-item {
  background: var(--vp-c-bg-soft);
  border-left: 4px solid var(--vp-c-accent);
}

[data-theme='dark'] .update-date {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .update-content {
  color: var(--vp-c-text);
}

[data-theme='dark'] .update-progress {
  color: var(--vp-c-accent);
}

[data-theme='dark'] .category-selector {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
}

[data-theme='dark'] .category-tab {
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-border);
  color: var(--vp-c-text);
}

[data-theme='dark'] .category-tab:hover {
  border-color: var(--vp-c-accent);
  background: var(--vp-c-bg-elv);
}

[data-theme='dark'] .category-tab.active {
  border-color: var(--vp-c-accent);
  background: var(--vp-c-accent);
  color: var(--vp-c-bg);
}

[data-theme='dark'] .category-hint {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .tag-suggestion {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text);
  border: 1px solid var(--vp-c-border);
}

[data-theme='dark'] .tag-suggestion:hover {
  background: var(--vp-c-accent);
  color: var(--vp-c-bg);
}

[data-theme='dark'] .checkbox-label {
  color: var(--vp-c-text);
}

[data-theme='dark'] .checkmark {
  border: 2px solid var(--vp-c-border);
  background: var(--vp-c-bg);
}

[data-theme='dark'] .checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: var(--vp-c-accent);
  border-color: var(--vp-c-accent);
}

[data-theme='dark'] .error-message {
  background: rgba(220, 53, 69, 0.1);
  color: #f5c6cb;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

[data-theme='dark'] .btn-primary:disabled {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .empty-state {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .empty-state h3 {
  color: var(--vp-c-text);
}

[data-theme='dark'] .suggestion-label {
  color: var(--vp-c-text-mute);
}
</style>