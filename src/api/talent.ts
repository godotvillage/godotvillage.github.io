import request from './request'

export interface TalentTagDto {
  category: string
  tag: string
}

export interface TalentDto {
  id: string
  userId: string
  userName: string
  nickname?: string
  avatarUrl?: string
  designScore: number
  programmingScore: number
  artScore: number
  musicScore: number
  organizationScore: number
  fundingScore: number
  description: string
  tags: TalentTagDto[]
  createdTime: string
  updatedTime?: string
}

export interface TalentCreateUpdateDto {
  designScore: number
  programmingScore: number
  artScore: number
  musicScore: number
  organizationScore: number
  fundingScore: number
  description: string
  tags: TalentTagDto[]
}

export interface TalentQueryDto {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: string
  minDesign?: number
  maxDesign?: number
  minProgramming?: number
  maxProgramming?: number
  minArt?: number
  maxArt?: number
  minMusic?: number
  maxMusic?: number
  minOrganization?: number
  maxOrganization?: number
  minFunding?: number
  maxFunding?: number
  tags?: string
  keyword?: string
}

export interface TalentListResult {
  items: TalentDto[]
  totalCount: number
  page: number
  pageSize: number
  totalPage: number
}

export const talentApi = {
  getList(params?: TalentQueryDto) {
    return request.get<any, { data: TalentListResult }>('/talent', { params })
  },

  getById(id: string) {
    return request.get<any, { data: TalentDto }>(`/talent/${id}`)
  },

  getMy() {
    return request.get<any, { data: TalentDto }>('/talent/my')
  },

  createOrUpdate(data: TalentCreateUpdateDto) {
    return request.post<any, { data: TalentDto }>('/talent', data)
  },

  remove() {
    return request.delete('/talent')
  },
}
