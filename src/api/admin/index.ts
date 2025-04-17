import request from '@/utils/request'
import { LoginDTO } from './type'

enum API {
  ADMIN_LOGIN_URL = '/admin/login',
  GET_DASHBOARD_INFO_URL = '/admin/dashboard/get-dashboard-info',
  GET_JUDGE_SERVICE_INFO_URL = '/admin/config/get-judge-service-info',
  GET_SERVICE_INFO_URL = '/admin/config/get-service-info',
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
