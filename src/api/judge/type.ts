export interface GetJudgeListParams {
  limit?: number
  currentPage?: number
  onlyMine?: boolean
  problemID?: string
  status?: number
  username?: string
  completeProblemID?: boolean
}

export interface JudgeVO {
  uid: string
  submitId: number
  username: string
  pid: number
  displayPid: string
  title: string
  displayId: string
  submitTime: string // Date 类型通常会转成 ISO 字符串
  status: number
  share: boolean
  time: number
  memory: number
  score: number | null
  oiRankScore: number
  length: number
  language: string
  cid: number
  cpid: number
  source: string
  judger: string
  ip: string
  isManual: boolean
}
