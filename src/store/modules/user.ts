import { defineStore } from 'pinia'
//引入接口
import { Login } from '@/api/passport'
//引入类型
import type { LoginDTO } from '@/api/passport/type'

// 创建用户相关的小仓库
const useUserStore = defineStore('User', {
  // 小仓库存储数据的地方
  state: () => {
    return {
      token: localStorage.getItem('token') || '', // 用户的唯一标识
    }
  },

  // 异步|逻辑处理的地方
  actions: {
    async Login(data: LoginDTO) {
      const response: any = await Login(data)
      if (response.data.code == 200) {
        // 从响应头中获取token
        const token = response.headers['authorization']
        if (token) {
          this.token = token
          localStorage.setItem('token', token)
          return {
            sucess: true,
            data: response.data.data,
            message: response.data.msg,
          }
        }
      } else {
        return { sucess: false, message: response.data.msg }
      }
    },
  },

  getters: {},
})

export default useUserStore
