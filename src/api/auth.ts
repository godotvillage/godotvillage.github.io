import request from './request'

// 登录
export interface LoginDto {
  userName: string
  password: string
}

// 注册
export interface RegisterDto {
  userName: string
  password: string
  email?: string
  phoneNumber?: string
  nickname?: string
}

// 登录响应
export interface LoginResp {
  userInfo: UserInfo
  accessToken: string
}

// 用户信息
export interface UserInfo {
  id: string
  userName: string
  email?: string
  phoneNumber?: string
  nickname?: string
  roles: Role[]
  activeRoleId?: string
  permissions: string[]
}

export interface Role {
  id: string
  name: string
  permissions: string[]
}

export const authApi = {
  login(data: LoginDto) {
    return request.post<any, { data: LoginResp }>('/auth/login', data)
  },

  register(data: RegisterDto) {
    return request.post<any, { data: UserInfo }>('/auth/register', data)
  }
}
