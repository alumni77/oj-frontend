export interface TrainingVO {
  id: number
  title: string
  description: string
  author: string
  auth: string
  categoryName: string
  categoryColor: string
  rank: number
  problemCount: number
  acCount: number
  gmtModified: string
}

export interface TrainingCategory {
  id: number
  name: string
  color: string
  gmtModified: string
  gmtCreate: string
}
