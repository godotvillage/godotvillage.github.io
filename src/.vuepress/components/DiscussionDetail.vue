// .vuepress/components/DiscussionDetail.vue
<template>
  <div class="discussion-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">
      <p>加载失败: {{ error }}</p>
      <button @click="retry" class="retry-btn">重试</button>
    </div>
    <div v-else-if="discussion" class="discussion-content">
      <!-- 返回按钮 -->
      <div class="back-nav">
        <button @click="$router.back()" class="back-btn">← 返回论坛</button>
      </div>
      
      <!-- 讨论标题和元信息 -->
      <header class="discussion-header">
        <h1 class="discussion-title">{{ discussion.title }}</h1>
        <div class="discussion-meta">
          <img 
            :src="discussion.author.avatarUrl" 
            :alt="discussion.author.login"
            class="avatar" 
          />
          <div class="meta-info">
            <span class="author">作者: {{ discussion.author.login }}</span>
            <span class="date">发布于: {{ formatDate(discussion.createdAt) }}</span>
            <span v-if="discussion.updatedAt !== discussion.createdAt" class="updated">
              更新于: {{ formatDate(discussion.updatedAt) }}
            </span>
          </div>
        </div>
      </header>

      <!-- 讨论内容 -->
      <article class="discussion-body">
        <div class="markdown-body" v-html="renderMarkdown(discussion.body)"></div>
      </article>

      <!-- 标签和分类 -->
      <div v-if="discussion.labels.nodes.length > 0" class="discussion-tags">
        <span class="tags-label">标签:</span>
        <span 
          v-for="label in discussion.labels.nodes" 
          :key="label.id"
          class="tag"
          :style="{ backgroundColor: `#${label.color}` }"
        >
          {{ label.name }}
        </span>
      </div>

      <!-- Giscus评论区域 -->
      <div class="comments-section">
        <h3>评论</h3>
        <GiscusComponent 
          :key="discussionNumber"
          :repo="repo"
          :repo-id="repoId"
          :category="category"
          :category-id="categoryId"
          :mapping="mapping"
          :term="discussionNumber.toString()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'

export default {
  name: 'DiscussionDetail',
  data() {
    return {
      discussion: null,
      loading: true,
      error: null,
      // Giscus配置
      repo: 'godotvillage/godotvillage.github.io',
      repoId: 'R_kgDOP-_yiQ',
      category: 'General',
      categoryId: 'DIC_kwDOP-_yic4CwbD6',
      mapping: 'specific',
    }
  },
  computed: {
    discussionNumber() {
      // 从路由参数或frontmatter获取讨论编号
      return this.$route.query.number
    },
    githubToken() {
      // 从环境变量获取token，注意：在生产环境中需要服务端代理
      return `github_pa`+`t_11BYPYXTY0PvuNeOQ8lSVk_MZwjq`+`se6QQdsWDFonFNDkfN8DXPMCRm`+`MjsNcytQ5jWA7EV4JGT40zhG0h5X`
    }
  },
  async mounted() {
    await this.fetchDiscussion()
  },
  methods: {
    async fetchDiscussion() {
      this.loading = true
      this.error = null
      
      try {
        const query = `
          query GetDiscussion($owner: String!, $name: String!, $number: Int!) {
            repository(owner: $owner, name: $name) {
              discussion(number: $number) {
                id
                number
                title
                body
                bodyHTML
                createdAt
                updatedAt
                url
                author {
                  login
                  avatarUrl
                  url
                }
                category {
                  name
                  emoji
                }
                labels(first: 10) {
                  nodes {
                    id
                    name
                    color
                  }
                }
                comments(first: 100) {
                  totalCount
                  nodes {
                    id
                    body
                    bodyHTML
                    createdAt
                    author {
                      login
                      avatarUrl
                    }
                    replies(first: 10) {
                      nodes {
                        id
                        body
                        createdAt
                        author {
                          login
                          avatarUrl
                        }
                      }
                    }
                  }
                }
                reactionGroups {
                  content
                  reactors(first: 10) {
                    totalCount
                  }
                }
              }
            }
          }
        `

        const variables = {
          owner: 'godotvillage',
          name: 'godotvillage.github.io',
          number: parseInt(this.discussionNumber)
        }

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.errors) {
          throw new Error(result.errors[0].message)
        }

        if (!result.data.repository.discussion) {
          throw new Error('讨论不存在')
        }

        this.discussion = result.data.repository.discussion
        
        // 设置页面标题
        document.title = `${this.discussion.title} - 论坛`
        
      } catch (error) {
        console.error('获取讨论详情失败:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    renderMarkdown(content) {
      if (!content) return ''
      
      try {
        // 使用marked渲染markdown
        marked.setOptions({
          highlight: function (code, lang) {
            // 可以集成highlight.js进行代码高亮
            return code
          },
          breaks: true,
          gfm: true
        })
        
        return marked.parse(content)
      } catch (error) {
        console.error('Markdown渲染失败:', error)
        return content
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    },

    retry() {
      this.fetchDiscussion()
    },

    // 跳转到GitHub原讨论页面
    openInGitHub() {
      if (this.discussion && this.discussion.url) {
        window.open(this.discussion.url, '_blank')
      }
    }
  },

  watch: {
    // 监听路由变化，重新获取数据
    '$route.params.id': {
      handler(newId) {
        if (newId) {
          this.fetchDiscussion()
        }
      },
      immediate: false
    }
  }
}
</script>

<style scoped>
.discussion-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #d73a49;
}

.retry-btn {
  background: #0366d6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.back-nav {
  margin-bottom: 20px;
}

.back-btn {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #0366d6;
}

.discussion-header {
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.discussion-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #24292e;
}

.discussion-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #586069;
}

.discussion-body {
  margin-bottom: 30px;
}

.markdown-body {
  line-height: 1.6;
  font-size: 16px;
}

.discussion-tags {
  margin-bottom: 30px;
  padding: 16px;
  background: #f6f8fa;
  border-radius: 6px;
}

.tags-label {
  font-weight: 600;
  margin-right: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  margin: 0 4px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.comments-section {
  border-top: 1px solid #e1e4e8;
  padding-top: 30px;
}

.comments-section h3 {
  margin-bottom: 20px;
  font-size: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .discussion-detail {
    padding: 10px;
  }
  
  .discussion-title {
    font-size: 24px;
  }
  
  .discussion-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
