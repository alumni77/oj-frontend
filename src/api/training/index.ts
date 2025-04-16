import request from '@/utils/request'

enum API {
  GET_TRAINING_CATEGORY_URL = '/common/get-training-category',
  GET_TRAINING_LIST_URL = '/training/get-training-list',
  GET_TRAINING_DETAIL_URL = '/training/get-training-detail',
  GET_TRAINING_PROBLEM_LIST_URL = '/training/get-training-problem-list',
}

// 获取训练分类列表
export const getTrainingCategory = () => {
  return request.get(API.GET_TRAINING_CATEGORY_URL)
}
// 获取训练列表
export const getTrainingList = (params?: {
  limit?: number
  currentPage?: number
  keyword?: string
  categoryId?: number
  auth?: string
}) => {
  return request.get(API.GET_TRAINING_LIST_URL, {
    params,
  })
}

// 获取训练详情
export const getTraining = (tid: number) => {
  return request.get(API.GET_TRAINING_DETAIL_URL, {
    params: { tid },
  })
}

// 获取训练题目列表
export const getTrainingProblemList = (tid: number) => {
  return request.get(API.GET_TRAINING_PROBLEM_LIST_URL, { params: { tid } })
}
