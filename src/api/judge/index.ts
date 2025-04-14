import request from '@/utils/request'
import { GetJudgeListParams } from './type'

enum API {
  GET_JUDGE_LIST_URL = '/judgeserve/get-submission-list',
}

// 获取评测列表
export const getJudgeList = (params: GetJudgeListParams) => {
  return request.get(API.GET_JUDGE_LIST_URL, {
    params,
  })
}
