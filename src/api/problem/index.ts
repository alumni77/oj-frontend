import request from '@/utils/request'
import { ProblemListParams, SubmitJudgeDTO, TestJudgeDTO } from './type'

enum API {
  GET_PROBLEM_LIST_URL = '/problem/get-problem-list',
  GET_PROBLEM_TAG_LIST_URL = '/common/get-problem-tags-and-classification',
  GET_PROBLEM_DETAIL_URL = '/problem/get-problem-detail',
  SUBMIT_PROBLEM_TEST_JUDGE_URL = '/judgeserve/submit-problem-test-judge',
  GET_TEST_JUDGE_RESULT_URL = '/judgeserve/get-test-judge-result',
  GET_USER_PROBLEM_STATUS_URL = '/problem/get-user-problem-status',
  SUBMIT_PROBLEM_JUDGE_URL = '/judgeserve/submit-problem-judge',
  GET_SUBMISSION_URL = '/judgeserve/get-submission-detail',
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

// 获取用户提交的题目状态
export const getUserProblemStatus = (data: { pidList: number[] }) => {
  return request.post(API.GET_USER_PROBLEM_STATUS_URL, data)
}
// 提交题目评测
export const submitProblemJudge = (data: SubmitJudgeDTO) => {
  return request.post(API.SUBMIT_PROBLEM_JUDGE_URL, data)
}

// 获取提交详情
export const getSubmission = (submitId: number) => {
  return request.get(API.GET_SUBMISSION_URL, { params: submitId })
}
