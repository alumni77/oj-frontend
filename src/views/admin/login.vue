<template>
  <div class="admin-login-container">
    <div class="login-box">
      <h2 class="welcome-title">欢迎登录后台管理系统</h2>

      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" size="large">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="密码" type="password" size="large" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <div class="error-tip" v-if="passwordError">{{ passwordError }}</div>

        <div class="remember-forgot">
          <el-checkbox v-model="rememberMe">记住不要告诉</el-checkbox>
        </div>

        <el-button :loading="loading" type="primary" class="login-button" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </div>

    <div class="background-animation"></div>
  </div>
</template>

<script setup lang="ts" name="adminLogin">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import type { FormInstance, FormRules } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { adminLogin } from '@/api/admin' // 导入管理员登录接口
import type { LoginDTO } from '@/api/admin/type' // 确保使用正确的类型
import { setToken } from '@/utils/token'

// 初始化
const router = useRouter()
const userStore = useUserStore()

// 登录表单
const loginFormRef = ref<FormInstance>()
const loginForm = reactive<LoginDTO>({
  username: '',
  password: '',
})

// 错误提示
const usernameError = ref('')
const passwordError = ref('')
const loading = ref(false)
const rememberMe = ref(false)

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
  ]
})

// 处理登录
const handleLogin = async () => {
  // 重置错误提示
  usernameError.value = ''
  passwordError.value = ''

  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true

      try {
        // 直接使用 adminLogin API 而非 userStore.Login
        const response = await adminLogin(loginForm)
        const res = response.data

        if (res.code === 200) {
          // 登录成功，处理返回的用户信息
          const userInfo = res.data

          // 保存 token 和用户信息
          const token = response.headers.authorization
          setToken(token)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))

          // 更新 store 中的用户信息
          userStore.updateUserInfo(userInfo)

          ElMessage.success('登录成功')

          // 如果需要记住登录状态
          if (rememberMe.value) {
            localStorage.setItem('adminRememberMe', 'true')
          }

          // 跳转到后台首页
          router.push('/admin/dashboard')
        } else {
          // 登录失败
          ElMessage.error(res.message || '登录失败，请检查用户名和密码')
        }
      } catch (error: any) {
        // 处理错误
        ElMessage.error(error.message || '登录过程中发生错误')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1890ff;
  position: relative;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(to bottom right, #1890ff, #0050b3);
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
  z-index: 0;
}

.background-animation::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.1;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
  position: relative;
}

.welcome-title {
  color: #1890ff;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 500;
  font-size: 24px;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  margin-top: 10px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-link {
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.error-tip {
  color: #f56c6c;
  font-size: 12px;
  margin-top: -15px;
  margin-bottom: 15px;
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 在小屏幕上调整大小 */
@media (max-width: 576px) {
  .login-box {
    width: 320px;
    padding: 30px;
  }
}
</style>