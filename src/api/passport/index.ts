// 统一管理passport服务相关的接口
import request from '@/utils/request'
import type { LoginDTO } from './type'

enum API {
  LOGIN_URL = '/passport/login',
}

// 暴漏请求函数
// 登录接口方法
export const Login = (data: LoginDTO) => request.post(API.LOGIN_URL, data)
