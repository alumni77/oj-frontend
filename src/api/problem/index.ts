import request from '@/utils/request'
import { ProblemListParams } from './type'

enum API {
  GET_PROBLEM_LIST_URL = '/problem/get-problem-list',
  GET_PROBLEM_TAG_LIST_URL = '/common/get-problem-tags-and-classification',
  GET_PROBLEM_DETAIL_URL = '/problem/get-problem-detail',
}

// 获取题目列表
export const getProblemList = (params: ProblemListParams) => {
  return request.get(API.GET_PROBLEM_LIST_URL, { params })
}

// 获取题目标签列表
export const getProblemTagsAndClassification = () => {
  return request.get(API.GET_PROBLEM_TAG_LIST_URL)
}

// 获取题目详情
export const getProblemInfo = (problemId: string) => {
  return request.get(API.GET_PROBLEM_DETAIL_URL, { params: { problemId } })
}
