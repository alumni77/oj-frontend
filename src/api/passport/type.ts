// 登录接口需要携带参数ts类型
export interface LoginDTO {
  username: string
  password: string
}

export interface UserInfoVO {
  uid: string
  username: string
  nickname: string
  avatar: string
  titleName: string
  titleColor: string
  email: string
  number: string
  gender: string
  school: string
  course: string
  signature: string
  realname: string
  github: string
  blog: string
  cfUsername: string
  roleList: string[]
}

export interface CodeVO {
  code: string
  expire: number
  base64: string
}

export interface RegisterDTO {
  username: string
  password: string
  code: string
}

export interface CheckUsernameDTO {
  username: string
}

export interface UserRolesVO {
  uid: string
  username: string
  password: string
  nickname: string
  school: string
  course: string
  number: string
  gender: string
  realname: string
  cfUsername: string
  github: string
  blog: string
  email: string
  avatar: string
  titleName: string
  titleColor: string
  signature: string
  status: number
  gmtCreate: string // Date 类型可转 string 方便处理
  gmtModified: string
  roles: Role[]
}

export interface Role {
  id: number // Long 类型前端通常用 number
  role: string // 角色名
  description: string // 角色描述
  status: number // 0 可用，1 不可用
  gmtCreate: string // ISO 时间字符串，一般从后端会转成字符串
  gmtModified: string
}
