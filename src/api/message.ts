import request from './request'

// 消息 DTO
export interface MessageDto {
  id: string
  targetUserId: string
  targetUserName: string
  type: string
  title: string
  content: string
  relatedId?: string
  isRead: boolean
  readTime?: string
  createdTime: string
}

// 消息查询
export interface MessageQueryDto {
  isRead?: boolean
  type?: string
}

// 发送消息 DTO
export interface MessageSendDto {
  targetUserId: string
  title: string
  content: string
}

export const messageApi = {
  // 获取消息列表
  getList(params?: MessageQueryDto) {
    return request.get<any, { data: MessageDto[] }>('/message', { params })
  },

  // 获取消息详情
  getById(id: string) {
    return request.get<any, { data: MessageDto }>(`/message/${id}`)
  },

  // 获取未读消息数量
  getUnreadCount() {
    return request.get<any, { data: number }>('/message/unread-count')
  },

  // 标记消息为已读
  markAsRead(id: string) {
    return request.post<any, void>(`/message/${id}/read`)
  },

  // 标记所有消息为已读
  markAllAsRead() {
    return request.post<any, void>('/message/read-all')
  },

  // 发送消息
  send(data: MessageSendDto) {
    return request.post<any, void>('/message/send', data)
  }
}
