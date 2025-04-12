// 定义轮播图数据类型
export interface CarouselItem {
  id: number
  image: string
}

// 定义提交统计数据类型
export interface SubmissionStatisticsVO {
  dateStrList: string[]
  acCountList: number[]
  totalCountList: number[]
}

// 定义最近更新的题目
export interface RecentUpdatedProblemVO {
  id: number
  problemId: string
  title: string
  type: number
  gmtCreate: string
  gmtModified: string
}

// 定义前十排名数据类型
export interface ACMRankVO {
  uid: string
  username: string
  nickname: string
  signature: string
  avatar: string
  titleName: string
  titleColor: string
  total: number
  ac: number
}
