import request from '@/utils/request'

enum API {
  GET_RANK_LIST_URL = '/problem/get-rank-list',
}

// 定义函数接收参数
export const getRankList = (params: {
  limit?: number
  currentPage?: number
  searchUser?: string
  type: number
}) => {
  return request.get(API.GET_RANK_LIST_URL, {
    params,
  })
}
