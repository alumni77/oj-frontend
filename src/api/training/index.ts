import request from '@/utils/request'

enum API {
  GET_TRAINING_CATEGORY_URL = '/common/get-training-category',
  GET_TRAINING_LIST_URL = '/training/get-training-list',
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
