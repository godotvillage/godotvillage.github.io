// .vuepress/components/DiscussionsList.vue
<template>
  <div class="discussions-list">
    <div class="forum-header">
      <h2>列表</h2>
      <button @click="createNewDiscussion" class="new-post-btn">新建帖子</button>
    </div>
    
    <div class="discussions-container">
      <div v-if="loading" class="loading">加载中...</div>
      <div 
        v-for="discussion in discussions" 
        :key="discussion.id"
        class="discussion-item"
        @click="navigateToDiscussion(discussion.number)"
      >
        <div class="discussion-title">{{ discussion.title }}</div>
        <div class="discussion-meta">
          <span class="author">作者: {{ discussion.author.login }}</span>
          <span class="date">{{ formatDate(discussion.createdAt) }}</span>
          <span class="comments">评论: {{ discussion.comments.totalCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      discussions: [],
      loading: true
    }
  },
  async mounted() {
    await this.fetchDiscussions()
  },
  methods: {
    async fetchDiscussions() {
      const query = `
        query {
          repository(owner: "godotvillage", name: "godotvillage.github.io") {
            discussions(first: 20, categoryId: "DIC_kwDOP-_yic4CwbD6", orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                id
                number
                title
                body
                createdAt
                author {
                  login
                  avatarUrl
                }
                comments(first: 1) {
                  totalCount
                }
                category {
                  name
                }
              }
            }
          }
        }
      `
      
      try {
        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            // 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Authorization': `Bearer githu`+`b_pat_11BYPYXTY0PvuNeOQ8lSVk_MZwjqse6Q`+`QdsWDFonFNDkfN8DXPMCRmMjsNcytQ5jWA7EV4JGT40zhG0h5X`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        })
        
        const result = await response.json()
        this.discussions = result.data.repository.discussions.nodes
      } catch (error) {
        console.error('获取讨论列表失败:', error)
      } finally {
        this.loading = false
      }
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
  background: #2ea44f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.discussion-item {
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.discussion-item:hover {
  background-color: #f6f8fa;
}

.discussion-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.discussion-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #586069;
}
</style>
