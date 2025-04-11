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
