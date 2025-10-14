// .vuepress/components/DiscussionsList.vue
<template>
  <div class="discussions-list">
    <div class="forum-header">
      <h2>讨论列表</h2>
      <button @click="createNewDiscussion" class="new-post-btn">新建帖子</button>
    </div>
    
    <!-- 分类选择器 -->
    <div class="category-selector">
      <div class="category-tabs">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-tab"
          :class="{ active: selectedCategoryId === category.id }"
          @click="selectCategory(category.id)"
        >
          <span v-html="category.emojiHTML" class="category-emoji"></span>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
    </div>
    
    <div class="discussions-container" @scroll="handleScroll" ref="container">
      <div v-if="loading && discussions.length === 0" class="loading">加载中...</div>
      <div 
        v-for="discussion in discussions" 
        :key="discussion.id"
        class="discussion-item"
        @click="navigateToDiscussion(discussion.number)"
      >
        <div class="discussion-header">
          <span v-if="discussion.category" v-html="getCategoryEmoji(discussion.category.id)" class="discussion-category-emoji"></span>
          <div class="discussion-title">{{ discussion.title }}</div>
        </div>
        <div class="discussion-meta">
          <span class="author">作者: {{ discussion.author.login }}</span>
          <span class="date">{{ formatDate(discussion.createdAt) }}</span>
          <span class="comments">评论: {{ discussion.comments.totalCount }}</span>
          <span v-if="discussion.category" class="category">分类: {{ discussion.category.name }}</span>
        </div>
      </div>
      
      <div v-if="loadingMore" class="loading-more">加载更多...</div>
      <div v-if="!hasNextPage && discussions.length > 0" class="no-more">没有更多内容了</div>
    </div>
  </div>
</template>

<script>
import { baseUrl } from '../utils/request'
export default {
  data() {
    return {
      discussions: [],
      categories: [],
      selectedCategoryId: null,
      loading: true,
      loadingMore: false,
      hasNextPage: false,
      currentPage: 1,
      endCursor: null
    }
  },
  async mounted() {
    await this.fetchCategories()
    await this.fetchDiscussions()
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await fetch(baseUrl + '/discussion/categories')
        const result = await response.json()
        
        if (result.success) {
          this.categories = result.data.categories
          // 设置默认分类
          this.selectedCategoryId = result.data.defaultCategoryId
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    },
    
    async fetchDiscussions(loadMore = false) {
      try {
        if (!loadMore) {
          this.loading = true
          this.discussions = []
          this.currentPage = 1
          this.endCursor = null
        } else {
          this.loadingMore = true
        }
        
        let url = baseUrl + '/discussion/list'
        const params = new URLSearchParams()
        
        if (this.selectedCategoryId) {
          params.append('categoryId', this.selectedCategoryId)
        }
        
        if (loadMore && this.endCursor) {
          params.append('after', this.endCursor)
        }
        
        if (params.toString()) {
          url += '?' + params.toString()
        }
        
        const response = await fetch(url)
        const result = await response.json()
        
        if (result.success) {
          if (loadMore) {
            this.discussions = [...this.discussions, ...result.data]
          } else {
            this.discussions = result.data
          }
          
          // 更新分页信息
          if (result.pagination) {
            this.hasNextPage = result.pagination.hasNextPage
            this.endCursor = result.pagination.endCursor
            this.currentPage = result.pagination.currentPage
          }
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('获取讨论列表失败:', error)
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    
    async selectCategory(categoryId) {
      if (this.selectedCategoryId !== categoryId) {
        this.selectedCategoryId = categoryId
        await this.fetchDiscussions()
      }
    },
    
    handleScroll(event) {
      const { scrollTop, scrollHeight, clientHeight } = event.target
      
      // 当滚动到距离底部100px时开始加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100 && 
          this.hasNextPage && 
          !this.loadingMore && 
          !this.loading) {
        this.fetchDiscussions(true)
      }
    },
    
    getCategoryEmoji(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.emojiHTML : ''
    },
    
    navigateToDiscussion(number) {
      // 跳转到对应的讨论页面
      this.$router.push(`/discussion/index.html?number=${number}`)
    },
    
    createNewDiscussion() {
      // 跳转到创建新讨论的页面
      window.open(`https://github.com/godotvillage/godotvillage.github.io/discussions/new?category=general`, '_blank')
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.discussions-list {
  max-width: 800px;
  margin: 0 auto;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-post-btn {
  background: var(--vp-c-accent-bg, #2ea44f);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-post-btn:hover {
  background: var(--vp-c-accent-hover, #2c974b);
}

/* 暗色模式适配 - 按钮 */
[data-theme='dark'] .new-post-btn {
  background: var(--vp-c-accent-bg);
  color: white;
}

[data-theme='dark'] .new-post-btn:hover {
  background: var(--vp-c-accent-hover);
}

/* 分类选择器样式 */
.category-selector {
  margin-bottom: 20px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid var(--vp-c-divider, #e1e4e8);
  padding-bottom: 16px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border, #e1e4e8);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg, white);
  color: var(--vp-c-text, #24292f);
  font-size: 14px;
}

.category-tab:hover {
  background: var(--vp-c-control-hover, #f6f8fa);
  border-color: var(--vp-c-border-hard, #d0d7de);
}

.category-tab.active {
  background: var(--vp-c-accent-soft, #ddf4ff);
  border-color: var(--vp-c-accent, #54aeff);
  color: var(--vp-c-accent, #0969da);
}

/* 暗色模式适配 */
[data-theme='dark'] .category-tab {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text);
  border-color: var(--vp-c-border);
}

[data-theme='dark'] .category-tab:hover {
  background: var(--vp-c-control-hover);
  border-color: var(--vp-c-border-hard);
}

[data-theme='dark'] .category-tab.active {
  background: var(--vp-c-accent-soft);
  border-color: var(--vp-c-accent);
  color: var(--vp-c-accent);
}

.category-emoji {
  font-size: 16px;
}

.category-name {
  font-weight: 500;
}

/* 讨论容器样式 */
.discussions-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid var(--vp-c-border, #e1e4e8);
  border-radius: 6px;
  padding: 16px;
  background: var(--vp-c-bg, white);
}

.discussion-item {
  border: 1px solid var(--vp-c-border, #e1e4e8);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg, white);
  color: var(--vp-c-text, #24292f);
}

.discussion-item:hover {
  background-color: var(--vp-c-control-hover, #f6f8fa);
  border-color: var(--vp-c-border-hard, #d0d7de);
  box-shadow: 0 1px 3px var(--vp-c-shadow, rgba(0, 0, 0, 0.1));
}

/* 暗色模式适配 - 讨论容器 */
[data-theme='dark'] .discussions-container {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-border);
}

[data-theme='dark'] .discussion-item {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text);
  border-color: var(--vp-c-border);
}

[data-theme='dark'] .discussion-item:hover {
  background: var(--vp-c-control-hover);
  border-color: var(--vp-c-border-hard);
}

.discussion-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.discussion-category-emoji {
  font-size: 18px;
  margin-top: 2px;
}

.discussion-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  line-height: 1.4;
}

.discussion-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: var(--vp-c-text-mute, #586069);
}

.discussion-meta .category {
  background: var(--vp-c-control, #f6f8fa);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: var(--vp-c-text, #24292f);
}

/* 加载状态样式 */
.loading, .loading-more, .no-more {
  text-align: center;
  padding: 20px;
  color: var(--vp-c-text-mute, #586069);
  font-size: 14px;
}

.loading-more {
  padding: 10px;
  background: var(--vp-c-control, #f6f8fa);
  border-radius: 6px;
  margin-top: 10px;
  color: var(--vp-c-text, #24292f);
}

.no-more {
  color: var(--vp-c-text-subtle, #8b949e);
  font-style: italic;
}

/* 暗色模式适配 - 文本和状态 */
[data-theme='dark'] .discussion-meta {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .discussion-meta .category {
  background: var(--vp-c-control);
  color: var(--vp-c-text);
}

[data-theme='dark'] .loading,
[data-theme='dark'] .loading-more,
[data-theme='dark'] .no-more {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .loading-more {
  background: var(--vp-c-control);
  color: var(--vp-c-text);
}

[data-theme='dark'] .no-more {
  color: var(--vp-c-text-subtle);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .discussions-list {
    max-width: 100%;
    padding: 0 16px;
  }
  
  .category-tabs {
    justify-content: center;
  }
  
  .category-tab {
    font-size: 12px;
    padding: 6px 10px;
  }
  
  .discussion-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .discussions-container {
    max-height: 500px;
    padding: 12px;
  }
}
</style>
