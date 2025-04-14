import request from '@/utils/request'
import { ProblemListParams, TestJudgeDTO } from './type'

enum API {
  GET_PROBLEM_LIST_URL = '/problem/get-problem-list',
  GET_PROBLEM_TAG_LIST_URL = '/common/get-problem-tags-and-classification',
  GET_PROBLEM_DETAIL_URL = '/problem/get-problem-detail',
  SUBMIT_PROBLEM_TEST_JUDGE_URL = '/judgeserve/submit-problem-test-judge',
  GET_TEST_JUDGE_RESULT_URL = '/judgeserve/get-test-judge-result',
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

// 提交题目测试评测
export const submitProblemTestJudge = (data: TestJudgeDTO) => {
  return request.post(API.SUBMIT_PROBLEM_TEST_JUDGE_URL, data)
}

// 获取测试评测结果
export const getTestJudgeResult = (testJudgeKey: string) => {
  return request.get(API.GET_TEST_JUDGE_RESULT_URL, {
    params: { testJudgeKey },
  })
}
