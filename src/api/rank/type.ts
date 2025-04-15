// 排名用户信息
export interface RankUser {
  uid: string
  username: string
  nickname: string | null
  signature: string | null
  avatar: string | null
  titleName: string | null
  titleColor: string | null
  score: number
  total: number
  ac: number
}
