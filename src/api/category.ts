import request from './request'

// 文章分类 DTO
export interface CategoryDto {
  id: string
  name: string
  description?: string
  sort: number
  articleCount: number
  createdTime: string
}

// 分类创建
export interface CategoryCreateDto {
  name: string
  description?: string
  sort?: number
}

// 分类更新
export interface CategoryUpdateDto {
  id: string
  name?: string
  description?: string
  sort?: number
}

export const categoryApi = {
  // 获取所有分类
  getAll() {
    return request.get<any, { data: CategoryDto[] }>('/category')
  },

  // 获取分类详情
  getById(id: string) {
    return request.get<any, { data: CategoryDto }>(`/category/${id}`)
  },

  // 创建分类
  create(data: CategoryCreateDto) {
    return request.post<any, { data: CategoryDto }>('/category', data)
  },

  // 更新分类
  update(id: string, data: CategoryUpdateDto) {
    return request.put<any, { data: CategoryDto }>(`/category/${id}`, data)
  },

  // 删除分类
  delete(id: string) {
    return request.delete<any, void>(`/category/${id}`)
  }
}
