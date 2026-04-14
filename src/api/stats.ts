import request from './request'

// 站点统计 DTO
export interface SiteStatsDto {
  articleCount: number
  projectCount: number
  userCount: number
  categoryCount: number
}

// 用户统计 DTO
export interface UserStatisticsDto {
  userId: string
  userName: string
  nickname?: string
  email?: string
  articleCount: number
  publishedArticleCount: number
  pendingArticleCount: number
  projectCount: number
}

export const statsApi = {
  // 获取站点统计
  getSiteStats() {
    return request.get<any, { data: SiteStatsDto }>('/stats/site')
  },
  // 获取用户统计
  getUserStatistics() {
    return request.get<any, { data: UserStatisticsDto[] }>('/stats/users')
  }
}
