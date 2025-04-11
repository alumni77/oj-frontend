// 统一管理passport服务相关的接口
import request from '@/utils/request'
import type { LoginDTO, RegisterDTO, CheckUsernameDTO } from './type'

enum API {
  LOGIN_URL = '/passport/login',
  GET_CODE_URL = '/passport/get-code',
  CHECK_USERNAME_URL = '/account/check-username',
  REGISTER_URL = '/passport/register',
}

// 暴漏请求函数
// 登录接口方法
export const Login = (data: LoginDTO) => request.post(API.LOGIN_URL, data)

export const GetCode = (username: string) =>
  request.get(API.GET_CODE_URL, { params: { username } })

export const CheckUsername = (data: CheckUsernameDTO) =>
  request.post(API.CHECK_USERNAME_URL, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Register = (data: RegisterDTO) =>
  request.post(API.REGISTER_URL, data)
