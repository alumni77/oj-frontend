export interface LoginDTO {
  username: string
  password: string
}

export interface AdminEditUserDTO {
  username: string // 用户名（必填）
  uid: string // 用户ID（必填）
  realname?: string // 真实姓名（可选）
  email?: string // 邮箱（可选）
  password?: string // 密码（可选）
  type?: number // 用户类型（比如：管理员、普通用户等）
  status?: number // 状态（0 可用，1 不可用）
  setNewPwd?: boolean // 是否重置密码
  titleName?: string // 头衔名
  titleColor?: string // 头衔颜色
}

export interface DeleteUserDTO {
  ids: string[]
}

export interface InsertBatchUserDTO {
  users: string[][]
}

export interface GenerateUserParams {
  prefix: string
  suffix: string
  number_from: number
  number_to: number
  password_length: number
}
