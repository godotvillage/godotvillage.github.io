import request from './request'

// 文章查询
export interface ArticleQueryDto {
  categoryId?: string
  status?: string
  authorId?: string
  tags?: string
  isFeatured?: boolean
  includeComments?: boolean
  includeReactions?: boolean
}

// 文章 DTO
export interface ArticleDto {
  id: string
  title: string
  content: string
  summary?: string
  categoryId?: string
  categoryName?: string
  authorId: string
  authorName: string
  authorAvatar?: string
  tags?: string
  isTop: boolean
  isFeatured: boolean
  status: string
  viewCount: number
  commentCount: number
  reactions: ReactionSummary
  allowGuestView: boolean
  createdTime: string
  updatedTime?: string
}

// 文章创建
export interface ArticleCreateDto {
  title: string
  content: string
  summary?: string
  categoryId?: string
  tags?: string
  allowGuestView?: boolean
}

// 文章更新
export interface ArticleUpdateDto {
  title?: string
  content?: string
  summary?: string
  categoryId?: string
  tags?: string
  allowGuestView?: boolean
  isTop?: boolean
  isFeatured?: boolean
}

// 评论 DTO
export interface CommentDto {
  id: string
  articleId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  parentCommentId?: string
  replyCount: number
  createdTime: string
}

// 评论创建
export interface CommentCreateDto {
  content: string
  parentCommentId?: string
}

// 表情反应统计
export interface ReactionSummary {
  [emoji: string]: number
}

// 表情反应 DTO
export interface ReactionDto {
  id: string
  articleId: string
  userId: string
  emoji: string
  createdTime: string
}

// 表情反应创建
export interface ReactionCreateDto {
  emoji: string
}

export const articleApi = {
  // 获取文章列表
  getList(params?: ArticleQueryDto) {
    return request.get<any, { data: ArticleDto[] }>('/article', { params })
  },

  // 获取文章详情
  getById(id: string, params?: { includeComments?: boolean; includeReactions?: boolean }) {
    return request.get<any, { data: ArticleDto }>(`/article/${id}`, { params })
  },

  // 创建文章
  create(data: ArticleCreateDto) {
    return request.post<any, { data: ArticleDto }>('/article', data)
  },

  // 更新文章
  update(id: string, data: ArticleUpdateDto) {
    return request.put<any, { data: ArticleDto }>(`/article/${id}`, data)
  },

  // 删除文章
  delete(id: string) {
    return request.delete<any, void>(`/article/${id}`)
  },

  // 获取评论列表
  getComments(articleId: string) {
    return request.get<any, { data: CommentDto[] }>(`/article/${articleId}/comments`)
  },

  // 添加评论
  addComment(articleId: string, data: CommentCreateDto) {
    return request.post<any, { data: CommentDto }>(`/article/${articleId}/comments`, data)
  },

  // 删除评论
  deleteComment(articleId: string, commentId: string) {
    return request.delete<any, void>(`/article/${articleId}/comments/${commentId}`)
  },

  // 获取表情反应统计
  getReactions(articleId: string) {
    return request.get<any, { data: { summary: ReactionSummary } }>(`/article/${articleId}/reactions`)
  },

  // 添加表情反应
  addReaction(articleId: string, data: ReactionCreateDto) {
    return request.post<any, { data: ReactionDto }>(`/article/${articleId}/reactions`, data)
  },

  // 删除表情反应
  deleteReaction(articleId: string, reactionId: string) {
    return request.delete<any, void>(`/article/${articleId}/reactions/${reactionId}`)
  }
}
