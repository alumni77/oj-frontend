<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录OJ</h2>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="login-form">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>

        <div class="button-container">
          <el-button type="primary" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </div>

        <div class="links">
          <el-link type="primary" @click="toRegister">没有账号？立即注册</el-link>
          <el-link type="primary">忘记密码？</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { LoginDTO } from '@/api/passport/type'
import useUserStore from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
let userStore = useUserStore()

// 表单数据
const form = reactive<LoginDTO>({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度应在4-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref()

// 登录处理
const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      // 这里添加登录逻辑
      let res = await userStore.Login(form)
      console.log('res=', res);
      if (res?.sucess) {
        // 登录成功，跳转到首页
        ElMessage.success('登录成功')

        router.push('/')
      } else {
        // 登录失败，显示错误信息
        ElMessage.error(res?.message || '登录失败，请重试')
      }
    }
  })
}

// 跳转到注册页
const toRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 12px;
  /* 添加卡片圆角 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  /* 增强阴影效果 */
  overflow: hidden;
  /* 确保内容不溢出圆角边框 */
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 600;
}

.login-form {
  margin-top: 20px;
}

/* 为输入框添加圆角 */
.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  overflow: hidden;
}

/* 为按钮添加圆角 */
.button-container .el-button {
  width: 100%;
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
}

.button-container {
  margin-top: 30px;
}

.links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

/* 添加链接的悬停效果 */
.links .el-link:hover {
  opacity: 0.8;
  transform: translateY(-1px);
  transition: all 0.2s ease;
}
</style>