import request from '@/utils/request'
import {
  AdminEditUserDTO,
  DeleteUserDTO,
  GenerateUserParams,
  InsertBatchUserDTO,
  LoginDTO,
  ProblemDTO,
  TagClassification,
  TrainingCategory,
  TrainingDTO,
  TrainingProblem,
  TrainingProblemDTO,
} from './type'
import { Problem, Tag } from '../problem/type'

enum API {
  ADMIN_LOGIN_URL = '/admin/login',
  GET_DASHBOARD_INFO_URL = '/admin/dashboard/get-dashboard-info',
  GET_JUDGE_SERVICE_INFO_URL = '/admin/config/get-judge-service-info',
  GET_SERVICE_INFO_URL = '/admin/config/get-service-info',
  GET_USER_LIST_URL = '/admin/user/get-user-list',
  EDIT_USER_URL = '/admin/user/edit-user',
  DELETE_USER_URL = '/admin/user/delete-user',
  INSERT_BATCH_USER_URL = '/admin/user/insert-batch-user',
  GENERATE_USER_URL = '/admin/user/generate-user',
  GET_PROBLEM_LIST_URL = '/admin/problem/get-problem-list',
  OPERATE_PROBLEM_URL = '/admin/problem/',
  GET_PROBLEM_CASES_URL = '/admin/problem/get-problem-cases',
  CHANGE_PROBLEM_AUTH_URL = '/admin/problem/change-problem-auth',
  OPERATE_TAGS_URL = '/admin/tag/',
  OPERATE_CLASSIFICATION_URL = '/admin/tag/classification',
  GET_TRAINING_LIST_URL = '/admin/training/get-training-list',
  OPERATE_TRAINING_URL = '/admin/training',
  CHANGE_TRAINING_STATUS = '/admin/training/change-training-status',
  GET_TRAINING_PROBLEM_LIST_URL = '/admin/training/get-problem-list',
  OPERATE_TRAINING_PROBLEM = '/admin/training/problem',
  ADD_PROBLEM_FROM_PUBLE_URL = '/admin/training/add-problem-from-public',
  OPERATE_TRAINING_CATEGORY_URL = '/admin/training/category',
}

// 获取管理员登录信息
export const adminLogin = (data: LoginDTO) => {
  return request.post(API.ADMIN_LOGIN_URL, data)
}

// 获取仪表盘信息
export const getDashboardInfo = () => {
  return request.get(API.GET_DASHBOARD_INFO_URL)
}

// 获取评测服务信息
export const getJudgeServiceInfo = () => {
  return request.get(API.GET_JUDGE_SERVICE_INFO_URL)
}

// 获取服务信息
export const getServiceInfo = () => {
  return request.get(API.GET_SERVICE_INFO_URL)
}

// 获取用户列表
export const getUserList = (params: {
  limit?: number
  currentPage?: number
  onlyAdmin?: boolean
  keyword?: string
}) => {
  return request.get(API.GET_USER_LIST_URL, { params })
}

// 编辑用户信息
export const editUser = (data: AdminEditUserDTO) => {
  return request.put(API.EDIT_USER_URL, data)
}

// 删除用户
export const deleteUser = (data: DeleteUserDTO) => {
  return request.delete(API.DELETE_USER_URL, { data })
}

// 批量插入用户
export const insertBatchUser = (data: InsertBatchUserDTO) => {
  return request.post(API.INSERT_BATCH_USER_URL, data)
}

// 生成用户
export const generateUser = (data: GenerateUserParams) => {
  return request.post(API.GENERATE_USER_URL, data)
}

// 获取题目列表
export const getProblemList = (params: {
  limit?: number
  currentPage?: number
  keyword?: string
  auth?: number
  oj?: string
}) => {
  return request.get(API.GET_PROBLEM_LIST_URL, { params })
}

// 获取题目详情
export const getProblem = (pid: number) => {
  return request.get(API.OPERATE_PROBLEM_URL, { params: { pid } })
}
// 删除题目
export const deleteProblem = (pid: number) => {
  return request.delete(API.OPERATE_PROBLEM_URL, { params: { pid } })
}

// 编辑题目
export const updateProblem = (data: ProblemDTO) => {
  return request.put(API.OPERATE_PROBLEM_URL, data)
}

// 创建题目
export const addProblem = (data: ProblemDTO) => {
  return request.post(API.OPERATE_PROBLEM_URL, data)
}

// 获取题目测试点
export const getProblemCases = (params: {
  pid: number
  isUpdate?: boolean
}) => {
  return request.get(API.GET_PROBLEM_CASES_URL, { params })
}

// 修改题目权限
export const changeProblemAuth = (data: Problem) => {
  return request.put(API.CHANGE_PROBLEM_AUTH_URL, data)
}

// 增加题目标签
export const addTag = (data: Tag) => {
  return request.post(API.OPERATE_TAGS_URL, data)
}

// 更新题目标签
export const updateTag = (data: Tag) => {
  return request.put(API.OPERATE_TAGS_URL, data)
}

// 删除题目标签
export const deleteTag = (id: number) => {
  return request.delete(API.OPERATE_TAGS_URL, { params: { id } })
}

// 获取题目分类
export const getClassification = (params: { oj?: string }) => {
  return request.get(API.OPERATE_CLASSIFICATION_URL, { params })
}

// 增加题目分类
export const addTagClassification = (data: TagClassification) => {
  return request.post(API.OPERATE_CLASSIFICATION_URL, data)
}

// 更新题目分类
export const updateTagClassification = (data: TagClassification) => {
  return request.put(API.OPERATE_CLASSIFICATION_URL, data)
}

// 删除题目分类
export const deleteTagClassification = (id: number) => {
  return request.delete(API.OPERATE_CLASSIFICATION_URL, { params: { id } })
}

// 获取训练列表
export const getTrainingList = (params: {
  limit?: number
  currentPage?: number
  keyword?: string
}) => {
  return request.get(API.GET_TRAINING_LIST_URL, { params })
}

// 获取训练详情
export const getTraining = (tid: number) => {
  return request.get(API.OPERATE_TRAINING_URL, { params: { tid } })
}

// 删除训练
export const deleteTraining = (id: number) => {
  return request.delete(API.OPERATE_TRAINING_URL, { params: { id } })
}

// 增加训练
export const addTraining = (data: TrainingDTO) => {
  return request.post(API.OPERATE_TRAINING_URL, data)
}

// 更新训练
export const updateTraining = (data: TrainingDTO) => {
  return request.put(API.OPERATE_TRAINING_URL, data)
}

// 修改训练状态
export const changeTrainingStatus = (params: {
  tid: number
  author: string
  status: boolean
}) => {
  return request.put(API.CHANGE_TRAINING_STATUS, null, { params })
}

// 获取训练题目列表
export const getTrainingProblemList = (params: {
  limit?: number
  currentPage?: number
  keyword?: string
  queryExisted?: boolean
  tid: number
}) => {
  return request.get(API.GET_TRAINING_PROBLEM_LIST_URL, { params })
}

// 更新训练题目详情
export const updateProblemInTraining = (data: TrainingProblem) => {
  return request.put(API.OPERATE_TRAINING_PROBLEM, data)
}

// 删除训练题目
export const deleteProblemInTraining = (params: {
  pid: number
  tid?: number
}) => {
  return request.delete(API.OPERATE_TRAINING_PROBLEM, { params })
}

// 增加训练题目
export const addProblemFromPublic = (data: TrainingProblemDTO) => {
  return request.post(API.ADD_PROBLEM_FROM_PUBLE_URL, data)
}

// 增加训练分类
export const addTrainingCategory = (data: TrainingCategory) => {
  return request.post(API.OPERATE_TRAINING_CATEGORY_URL, data)
}

// 更新训练分类
export const updateTrainingCategory = (data: TrainingCategory) => {
  return request.put(API.OPERATE_TRAINING_CATEGORY_URL, data)
}

// 删除训练分类
export const deleteTrainingCategory = (id: number) => {
  return request.delete(API.OPERATE_TRAINING_CATEGORY_URL, { params: { id } })
}

// 获取训练分类
export const getTrainingCategoryList = () => {
  return request.get(API.OPERATE_TRAINING_CATEGORY_URL)
}
