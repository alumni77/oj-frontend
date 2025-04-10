import axios from 'axios'
import { ElMessage } from 'element-plus'
//进行axios二次封装，使用请求与响应拦截器
//第一步：理由axios对象的create方法创建axios实例
const request = axios.create({
  //基础路径
  baseURL: import.meta.env.VITE_APP_BASE_API, //这里的环境变量是通过vite.config.ts配置的
  timeout: 5000, //请求超时时间5s
})

//第二步：请求拦截器与响应拦截器
request.interceptors.request.use((config) => {
  //config配置对象，headers请求头属性，Authorization是token的请求头属性

  //返回配置对象
  return config
})

request.interceptors.response.use(
  (response) => {
    //响应拦截器，返回数据
    return response
  },
  (error) => {
    //响应拦截器，返回错误信息
    //处理网络错误
    let message = ''
    const status = error.response.status
    switch (status) {
      case 400:
        message = '请求错误'
        break
      case 401:
        message = '未授权，请登录'
        break
      case 403:
        message = '拒绝访问'
        break
      case 404:
        message = '请求地址出错'
        break
      case 408:
        message = '请求超时'
        break
      case 500:
        message = '服务器内部错误'
        break
      case 501:
        message = '服务未实现'
        break
      case 502:
        message = '网关错误'
        break
      case 503:
        message = '服务不可用'
        break
      case 504:
        message = '网关超时'
        break
      default:
        message = '连接错误 '
        break
    }
    //处理错误信息
    ElMessage({
      type: 'error',
      message: message,
    })

    return Promise.reject(error)
  },
)

export default request
