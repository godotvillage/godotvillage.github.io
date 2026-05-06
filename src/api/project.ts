import request from './request'

// 项目查询
export interface ProjectQueryDto {
  author?: string
  type?: string
  status?: string
  tags?: string
}

// 项目 DTO
export interface ProjectDto {
  id: string
  projectId: string
  title: string
  author: string
  githubUser?: string
  contact?: string
  type: string
  status: string
  description?: string
  progress: number
  expectedTime?: string
  tags?: string[]
  repository?: string
  demoUrl?: string
  teamMembers?: string
  recruitmentInfo?: string
  isOpenSource: boolean
  needHelp: boolean
  allowCollaboration: boolean
  createdTime: string
  lastUpdate?: ProjectUpdateDto
  updates?: ProjectUpdateDto[]
}

// 项目创建
export interface ProjectCreateDto {
  title: string
  author: string
  githubUser?: string
  contact?: string
  type: string
  status: string
  description?: string
  progress?: number
  expectedTime?: string
  tags?: string[]
  repository?: string
  demoUrl?: string
  teamMembers?: string
  recruitmentInfo?: string
  isOpenSource?: boolean
  needHelp?: boolean
  allowCollaboration?: boolean
}

// 项目更新
export interface ProjectFormDto {
  id?: string
  title?: string
  contact?: string
  type?: string
  status?: string
  description?: string
  progress?: number
  expectedTime?: string
  tags?: string[]
  repository?: string
  demoUrl?: string
  teamMembers?: string
  recruitmentInfo?: string
  isOpenSource?: boolean
  needHelp?: boolean
  allowCollaboration?: boolean
}

// 项目更新记录
export interface ProjectUpdateDto {
  id: string
  updateId: string
  projectId: string
  content: string
  progress?: number
  updateDate: string
  createdTime: string
}

// 项目更新创建
export interface ProjectUpdateCreateDto {
  content: string
  progress?: number
  date?: string
}

// 项目统计
export interface ProjectStatsDto {
  total: number
  active: number
  completed: number
}

export const projectApi = {
  // 获取项目列表
  getList(params?: ProjectQueryDto) {
    return request.get<any, { data: ProjectDto[] }>('/project', { params })
  },

  // 获取项目统计
  getStats() {
    return request.get<any, { data: ProjectStatsDto }>('/project/stats')
  },

  // 获取项目详情
  getById(id: string) {
    return request.get<any, { data: ProjectDto }>(`/project/${id}`)
  },

  // 创建项目
  create(data: ProjectCreateDto) {
    return request.post<any, { data: ProjectDto }>('/project', data)
  },

  // 更新项目
  update(id: string, data: ProjectFormDto) {
    return request.put<any, void>(`/project/${id}`, data)
  },

  // 删除项目
  delete(id: string) {
    return request.delete<any, void>(`/project/${id}`)
  },

  // 获取项目更新记录
  getUpdates(id: string) {
    return request.get<any, { data: ProjectUpdateDto[] }>(`/project/${id}/updates`)
  },

  // 添加项目更新记录
  addUpdate(id: string, data: ProjectUpdateCreateDto) {
    return request.post<any, { data: ProjectUpdateDto }>(`/project/${id}/updates`, data)
  },

  // 删除项目更新记录
  deleteUpdate(id: string, updateId: string) {
    return request.delete<any, void>(`/project/${id}/updates/${updateId}`)
  }
}
