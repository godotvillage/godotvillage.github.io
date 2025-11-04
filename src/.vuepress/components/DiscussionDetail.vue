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
        <!-- <div class="markdown-body" v-html="renderMarkdown(discussion.body)"></div> -->
        <div class="markdown-body" v-html="discussion.bodyHTML"></div>
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

      
    </div>
  </div>
</template>

<script>
// import { marked } from 'marked'
import { baseUrl } from '../utils/request'

export default {
  name: 'DiscussionDetail',
  data() {
    return {
      discussion: null,
      loading: true,
      error: null,
    }
  },
  computed: {
    discussionNumber() {
      // 从路由参数或frontmatter获取讨论编号
      return this.$route.query.number
    }
  },
  created() {
    // 配置marked，只需配置一次
    // marked.use({
    //   renderer: {
    //     image(token) {
    //       let out = `<img src="${token.href}" alt="${token.text}"`
    //       if (token.title) {
    //         out += ` title="${token.title}"`
    //       }
    //       out += '>'
    //       return out
    //     }
    //   },
    //   breaks: true,
    //   gfm: true
    // })
  },
  async mounted() {
    await this.fetchDiscussion()
    // await this.fetchGiscusConfig()
  },
  methods: {
    async fetchDiscussion() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(baseUrl + `/discussion/detail/${this.discussionNumber}`)
        const result = await response.json()

        if (result.success) {
          this.discussion = result.data
          // 设置页面标题
          document.title = `${this.discussion.title} - 论坛`
        } else {
          throw new Error(result.error)
        }
        
      } catch (error) {
        console.error('获取讨论详情失败:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // async fetchGiscusConfig() {
    //   try {
    //     const response = await fetch('/discussion/giscus-config')
    //     const result = await response.json()

    //     if (result.success) {
    //       this.giscusConfig = result.data
    //     } else {
    //       console.warn('获取Giscus配置失败:', result.error)
    //     }
    //   } catch (error) {
    //     console.warn('获取Giscus配置失败:', error)
    //   }
    // },

    // renderMarkdown(content) {
    //   if (!content) return ''
      
    //   try {
    //     // 使用marked渲染markdown（配置已在created中完成）
    //     return marked.parse(content)
    //   } catch (error) {
    //     console.error('Markdown渲染失败:', error)
    //     return content
    //   }
    // },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        return '昨天'
      } else if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60))
          if (diffMinutes === 0) {
            return '刚刚'
          } else {
            return `${diffMinutes}分钟前`
          }
        } else {
          return `${diffHours}小时前`
        }
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

.discussion-content {
  margin-top: 60px;
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

/* 暗黑模式下的返回按钮样式 */
[data-theme='dark'] .back-btn {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-accent);
}

[data-theme='dark'] .back-btn:hover {
  background: var(--vp-c-control-hover);
  border-color: var(--vp-c-border-hard);
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
  color: var(--vp-c-text);;
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
