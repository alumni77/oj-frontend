import request from '@/utils/request'
import {
  AdminEditUserDTO,
  DeleteUserDTO,
  GenerateUserParams,
  InsertBatchUserDTO,
  LoginDTO,
} from './type'

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
