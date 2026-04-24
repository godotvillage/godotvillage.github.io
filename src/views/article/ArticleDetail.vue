<template>
  <div class="article-detail-page">
    <div class="article-container" v-if="article">
      <!-- 文章头部 -->
      <header class="article-header card">
        <div class="header-tags">
          <el-tag v-if="article.isTop" type="danger">置顶</el-tag>
          <el-tag v-if="article.isFeatured" type="warning">精华</el-tag>
          <el-tag v-if="article.categoryName">{{ article.categoryName }}</el-tag>
          <el-tag v-if="article.status === 'Draft'" type="info">草稿</el-tag>
          <el-tag v-if="article.status === 'Pending'" type="warning">待审核</el-tag>
          <el-tag v-if="article.status === 'Rejected'" type="danger">已拒绝</el-tag>
        </div>

        <h1 class="article-title">{{ article.title }}</h1>

        <div class="article-meta">
          <div class="author-info">
            <el-avatar :size="48">
              {{ article.authorName?.charAt(0) }}
            </el-avatar>
            <div class="author-detail">
              <span class="author-name">{{ article.authorName }}</span>
              <span class="publish-time">{{ formatTime(article.createdTime) }}</span>
            </div>
          </div>

          <div class="article-actions" v-if="isAuthor">
            <el-button @click="$router.push(`/article/${article.articleId}/edit`)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
          <div class="article-actions" v-else-if="authStore.isAdmin && article.status === 'Pending'">
            <el-button type="success" @click="handleApprove">
              <el-icon><CircleCheck /></el-icon>
              通过
            </el-button>
            <el-button type="danger" @click="openRejectDialog">
              <el-icon><CircleClose /></el-icon>
              拒绝
            </el-button>
          </div>
        </div>

        <div class="article-tags" v-if="article.tags">
          <el-tag
            v-for="tag in article.tags.split(',')"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag.trim() }}
          </el-tag>
        </div>
      </header>

      <!-- 文章内容 -->
      <div class="article-content card">
        <MdPreview theme="dark" :modelValue="article.content" previewTheme="smart-blue" />
      </div>

      <!-- 表情反应 -->
      <div class="article-reactions card" v-if="isPublished">
        <div class="reaction-stats" v-if="Object.keys(reactions).length > 0">
          <span
            v-for="(count, emoji) in reactions"
            :key="emoji"
            class="reaction-badge"
            :class="{ active: myReactions.includes(emoji) }"
            @click="handleReaction(emoji)"
          >
            {{ emoji }} {{ count }}
          </span>
        </div>

        <div class="reaction-picker">
          <span class="reaction-label">发表态度：</span>
          <div class="emoji-picker">
            <button
              v-for="emoji in emojiList"
              :key="emoji"
              class="emoji-btn"
              :class="{ active: myReactions.includes(emoji) }"
              @click="handleReaction(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="article-comments card" v-if="isPublished">
        <h3><el-icon><ChatDotRound /></el-icon>评论 ({{ comments.length }})</h3>

        <!-- 发布评论 -->
        <div class="comment-form" v-if="authStore.isLoggedIn">
          <el-avatar :size="36">
            {{ authStore.userInfo?.nickname?.charAt(0) || authStore.userInfo?.userName?.charAt(0) }}
          </el-avatar>
          <div class="comment-input">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="发表你的看法..."
            />
            <el-button type="primary" @click="handleAddComment" :loading="commentLoading">
              发布评论
            </el-button>
          </div>
        </div>
        <div v-else class="comment-login-tip">
          <router-link to="/login">登录</router-link>后发表评论
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <el-avatar :size="36">
              {{ comment.authorName?.charAt(0) }}
            </el-avatar>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">{{ comment.authorName }}</span>
                <span class="comment-time">{{ formatTime(comment.createdTime) }}</span>
                <el-button
                  v-if="comment.authorId === authStore.userInfo?.id"
                  type="danger"
                  size="small"
                  link
                  @click="handleDeleteComment(comment.id)"
                >
                  删除
                </el-button>
              </div>
              <div class="comment-content">{{ comment.content }}</div>

              <!-- 回复按钮 -->
              <div class="comment-actions">
                <el-button
                  size="small"
                  link
                  @click="showReplyInput(comment.id)"
                >
                  回复
                </el-button>
              </div>

              <!-- 回复输入框 -->
              <div v-if="replyingTo === comment.id" class="reply-input">
                <el-input
                  v-model="replyContent"
                  type="textarea"
                  :rows="2"
                  :placeholder="`回复 @${comment.authorName}...`"
                />
                <el-button size="small" type="primary" @click="handleReply(comment.id)">
                  回复
                </el-button>
                <el-button size="small" @click="replyingTo = ''">
                  取消
                </el-button>
              </div>

              <!-- 子评论 -->
              <div v-if="comment.replyCount > 0" class="sub-comments">
                <div
                  v-for="reply in getSubComments(comment.id)"
                  :key="reply.id"
                  class="sub-comment-item"
                >
                  <el-avatar :size="28">
                    {{ reply.authorName?.charAt(0) }}
                  </el-avatar>
                  <div class="sub-comment-body">
                    <span class="comment-author">{{ reply.authorName }}</span>
                    <span class="comment-content">{{ reply.content }}</span>
                    <span class="comment-time">{{ formatTime(reply.createdTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <div v-else class="empty-state">
      <p>文章不存在或已被删除</p>
      <el-button type="primary" @click="$router.push('/article')">
        返回文章列表
      </el-button>
    </div>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝文章" width="500px">
      <el-form :model="rejectForm" label-position="top">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Edit, Delete, ChatDotRound, Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { articleApi } from '@/api/article'
import type { ArticleDto, CommentDto } from '@/api/article'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const article = ref<ArticleDto | null>(null)
const comments = ref<CommentDto[]>([])
const reactions = ref<Record<string, number>>({})
const myReactions = ref<string[]>([])
const newComment = ref('')
const commentLoading = ref(false)
const replyingTo = ref('')
const replyContent = ref('')

const emojiList = ['👍', '❤️', '😊', '🎮', '👏', '🔥', '⭐', '🤔', '👀', '🎉']

const articleId = computed(() => route.params.id as string)

const isAuthor = computed(() => {
  return authStore.userInfo?.id === article.value?.authorId
})

const isPublished = computed(() => {
  return article.value?.status === 'Published'
})

const rejectDialogVisible = ref(false)
const rejectForm = reactive({
  reason: ''
})

onMounted(() => {
  loadArticle()
})

const loadArticle = async () => {
  loading.value = true
  try {
    const res = await articleApi.getById(articleId.value, {
      includeComments: true,
      includeReactions: true
    })
    article.value = res.data

    // 加载评论
    const commentsRes = await articleApi.getComments(articleId.value)
    comments.value = commentsRes.data

    // 加载表情统计
    const reactionsRes = await articleApi.getReactions(articleId.value)
    reactions.value = reactionsRes.data.summary || {}
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReaction = async (emoji: string) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await articleApi.addReaction(articleId.value, { emoji })
    ElMessage.success('已发表态度')
    await loadArticle()
  } catch (error) {
    // 错误已在拦截器处理
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  commentLoading.value = true
  try {
    await articleApi.addComment(articleId.value, { content: newComment.value })
    ElMessage.success('评论成功')
    newComment.value = ''
    await loadArticle()
  } catch (error) {
    // 错误已在拦截器处理
  } finally {
    commentLoading.value = false
  }
}

const showReplyInput = (commentId: string) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  replyingTo.value = commentId
  replyContent.value = ''
}

const handleReply = async (parentId: string) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  try {
    await articleApi.addComment(articleId.value, {
      content: replyContent.value,
      parentCommentId: parentId
    })
    ElMessage.success('回复成功')
    replyingTo.value = ''
    replyContent.value = ''
    await loadArticle()
  } catch (error) {
    // 错误已在拦截器处理
  }
}

const handleDeleteComment = async (commentId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await articleApi.deleteComment(articleId.value, commentId)
    ElMessage.success('删除成功')
    await loadArticle()
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器处理
    }
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await articleApi.delete(articleId.value)
    ElMessage.success('删除成功')
    router.push('/article')
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器处理
    }
  }
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm(`确定通过文章「${article.value?.title}」吗？`, '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await articleApi.approve(articleId.value)
    ElMessage.success('文章已通过')
    loadArticle()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const openRejectDialog = () => {
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  try {
    await articleApi.reject(articleId.value, { reason: rejectForm.reason })
    ElMessage.success('已拒绝该文章')
    rejectDialogVisible.value = false
    loadArticle()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getSubComments = (parentId: string) => {
  return comments.value.filter(c => c.parentCommentId === parentId)
}

const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}
</script>

<style scoped lang="scss">
.article-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  width: 90%;
}

.article-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-header {
  padding: 32px;

  .header-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .article-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
    margin-bottom: 20px;
  }

  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .author-detail {
        display: flex;
        flex-direction: column;

        .author-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .publish-time {
          font-size: 13px;
          color: var(--text-secondary);
        }
      }
    }

    .article-actions {
      display: flex;
      gap: 8px;
    }
  }

  .article-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.article-content {
  padding: 32px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);

  :deep(.md-editor-preview) {
    padding: 0;
  }

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(pre) {
    background: var(--bg-color);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid var(--border-color);
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
  }
}

.article-reactions {
  padding: 24px;

  .reaction-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;

    .reaction-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: var(--bg-color);
      border-radius: 20px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid var(--border-color);

      &:hover {
        background: var(--color-secondary);
        border-color: var(--primary-color);
      }

      &.active {
        background: var(--color-secondary);
        border: 1px solid var(--primary-color);
      }
    }
  }

  .reaction-picker {
    display: flex;
    align-items: center;
    gap: 12px;

    .reaction-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .emoji-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .emoji-btn {
        font-size: 24px;
        padding: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;

        &:hover {
          background: var(--bg-color);
          transform: scale(1.2);
        }

        &.active {
          background: var(--color-secondary);
          transform: scale(1.2);
        }
      }
    }
  }
}

.article-comments {
  padding: 24px;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    margin-bottom: 24px;
  }

  .comment-form {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;

    .comment-input {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-end;

      .el-textarea {
        width: 100%;
      }
    }
  }

  .comment-login-tip {
    padding: 16px;
    text-align: center;
    background: var(--bg-color);
    border-radius: 8px;
    margin-bottom: 24px;
    color: var(--text-secondary);

    a {
      color: var(--primary-color);
    }
  }

  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .comment-item {
    display: flex;
    gap: 12px;

    .comment-body {
      flex: 1;

      .comment-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .comment-author {
          font-weight: 600;
          color: var(--text-primary);
        }

        .comment-time {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }

      .comment-content {
        color: var(--text-primary);
        line-height: 1.6;
        margin-bottom: 8px;
      }

      .comment-actions {
        margin-bottom: 12px;
      }

      .reply-input {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;

        .el-textarea {
          flex: 1;
        }
      }

      .sub-comments {
        background: var(--bg-color);
        border-radius: 8px;
        padding: 12px;

        .sub-comment-item {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .sub-comment-body {
            flex: 1;

            .comment-author {
              font-weight: 600;
              color: var(--text-primary);
              margin-right: 8px;
            }

            .comment-content {
              margin-bottom: 4px;
            }

            .comment-time {
              font-size: 12px;
              color: var(--text-secondary);
            }
          }
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
