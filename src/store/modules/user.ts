import { defineStore } from 'pinia'
//引入接口
import { Login, Register } from '@/api/passport'
//引入类型
import type { LoginDTO, RegisterDTO, UserInfoVO } from '@/api/passport/type'

// 创建用户相关的小仓库
const useUserStore = defineStore('User', {
  // 小仓库存储数据的地方
  state: () => {
    return {
      token: localStorage.getItem('token') || '', // 用户的唯一标识
      userInfo: JSON.parse(
        localStorage.getItem('userInfo') || '{}',
      ) as UserInfoVO, // 用户信息
    }
  },

  // 异步|逻辑处理的地方
  actions: {
    async Login(data: LoginDTO) {
      const response: any = await Login(data)
      const redData = response.data

      if (redData.code == 200) {
        // 从响应头中获取token
        const token = response.config.headers['Authorization']

        if (token) {
          this.token = token
          localStorage.setItem('token', token)
          return {
            sucess: true,
            data: redData.data,
            message: redData.msg,
          }
        }
      } else {
        return { sucess: false, message: redData.msg }
      }
    },

    async Register(data: RegisterDTO) {
      const response: any = await Register(data)
      const redData = response.data

      if (redData.code == 200) {
        return {
          sucess: true,
          data: redData.data,
          message: redData.msg,
        }
      } else {
        return { sucess: false, message: redData.msg }
      }
    },

    // 退出登录
    logout() {
      // 清除token
      this.token = ''
      // 清除用户信息
      this.userInfo = {} as UserInfoVO
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },

    // 更新用户信息
    updateUserInfo(data: Partial<UserInfoVO>) {
      this.userInfo = { ...this.userInfo, ...data }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },
  },

  getters: {
    // 获取用户信息
    getUserInfo(state) {
      return state.userInfo
    },
    // 判断用户是否登录
    isLogin(state) {
      return !!state.token
    },
    // 获取用户角色
    getUserRole(state) {
      return state.userInfo.roleList
    },
    // 判断是否为管理员
    // TODO: 这里的判断逻辑可以根据实际需求进行修改
    isAdmin(): boolean {
      const roleList = this.userInfo?.roleList || []
      return roleList.includes('admin') || roleList.includes('ROLE_ADMIN')
    },
  },
})

export default useUserStore
