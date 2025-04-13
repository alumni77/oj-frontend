// 定义请求参数接口
export interface ProblemListParams {
  limit?: number // 每页数量
  currentPage?: number // 当前页码
  keyword?: string // 搜索关键词
  tagId?: string // 标签ID列表
  difficulty?: number // 难度级别
  oj?: string // 来源OJ
}

// 定义后端返回的数据类型
export interface Tag {
  id: number
  name: string
  color: string | null
  oj: string
  gid: number | null
  tcid: number | null
  gmtCreate: string
  gmtModified: string
}

export interface Problem {
  pid: number
  problemId: string
  title: string
  difficulty: number
  type: number
  tags: Tag[]
  total: number
  ac: number
  mle: number
  tle: number
  re: number
  pe: number
  ce: number
  wa: number
  se: number
  pa: number
  score: number | null
  // 前端本地属性
  status?: string
  acceptance?: number
  statistics?: {
    ac: number
    wa: number
    tle: number
    mle: number
    re: number
    other: number
  }
}

export interface ProblemResponse {
  records: Problem[]
  total: number
  size: number
  current: number
  pages: number
}

export interface TagCategory {
  name: string
  tags: string[]
  rawTags: Tag[]
}
