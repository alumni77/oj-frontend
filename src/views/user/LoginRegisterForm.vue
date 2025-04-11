<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">{{ isLogin ? '登录' : '注册' }} Snail OJ</h2>

      <!-- 登录表单 -->
      <el-form v-if="isLogin" ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top"
        class="login-form">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password
            :prefix-icon="Lock" />
        </el-form-item>

        <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
          登录
        </el-button>

        <div class="form-footer">
          <el-link type="primary" @click="switchForm(false)">没有账号？立即注册</el-link>
          <el-link type="primary">忘记密码？</el-link>
        </div>
      </el-form>

      <!-- 注册表单 -->
      <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top"
        class="register-form">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password
            :prefix-icon="Lock" />
        </el-form-item>

        <el-form-item prop="confirmPassword" label="确认密码">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password
            :prefix-icon="Lock" />
        </el-form-item>

        <!-- 新增验证码表单项 -->
        <el-form-item prop="captcha" label="验证码">
          <div class="captcha-container">
            <el-input v-model="registerForm.captcha" placeholder="请输入验证码" />
            <div class="captcha-code">
              <el-button v-if="!captchaShown" type="primary" size="small" @click="showCaptcha"
                :loading="captchaLoading">
                获取验证码
              </el-button>
              <img v-else :src="base64" alt="验证码" @click="refreshCaptcha" class="captcha-image" />
            </div>
          </div>
        </el-form-item>

        <el-button type="primary" class="submit-btn" :loading="loading" @click="handleRegister">
          注册
        </el-button>

        <div class="form-footer">
          <el-link type="primary" @click="switchForm(true)">已有账号？立即登录</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="LoginRegisterForm">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { CheckUsername, GetCode } from '@/api/passport'
import type { CheckUsernameDTO, RegisterDTO } from '@/api/passport/type'

const router = useRouter()
const loading = ref(false)
const isLogin = ref(true)
const loginFormRef = ref()
const registerFormRef = ref()
const userStore = useUserStore()
const base64 = ref('')
const captchaCode = ref('')
// 设置超时时间常量（毫秒）
const REQUEST_TIMEOUT = 20000; // 10秒
let timeoutTimer: number | null = null
// 控制验证码显示状态
const captchaShown = ref(false)
const captchaLoading = ref(false)

// 显示验证码方法
const showCaptcha = async () => {
  if (!registerForm.username) {
    ElMessage.error('获取验证码前，请先输入用户名！')
    return
  }

  captchaLoading.value = true
  try {
    await fetchCaptchaCode()
    captchaShown.value = true
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请稍后再试')
  } finally {
    captchaLoading.value = false
  }
}

// 从后端获取验证码
const fetchCaptchaCode = async () => {
  if (!registerForm.username) {
    ElMessage.error('获取验证码前，请先输入用户名！')
    return Promise.reject(new Error('用户名为空'))
  }

  try {
    let res = await GetCode(registerForm.username)
    if (res.data.code === 200) {
      base64.value = res.data.data.base64
      captchaCode.value = res.data.data.code
      return Promise.resolve()
    } else {
      ElMessage.error(res.data.msg || '获取验证码失败')
      return Promise.reject(new Error(res.data.msg || '获取验证码失败'))
    }
  } catch (error) {
    console.error('获取验证码时发生错误:', error)
    return Promise.reject(error)
  }
}

// 刷新验证码
const refreshCaptcha = async () => {
  if (!captchaShown.value) return

  captchaLoading.value = true
  try {
    await fetchCaptchaCode()
    registerForm.captcha = '' // 清空输入框
  } catch (error) {
    console.log('刷新验证码失败:', error);
  } finally {
    captchaLoading.value = false
  }
}
// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ]
}
// 自定义校验密码是否一致
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 验证码校验规则
const validateCaptcha = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入验证码'))
  } else if (value !== captchaCode.value) {
    callback(new Error('验证码不正确'))
  } else {
    callback()
  }
}

// 用户名异步校验
const validateUsername = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入用户名'));
    return;
  }

  if (value.length < 6 || value.length > 20) {
    callback(new Error('用户名长度应在6-20个字符之间'));
    return;
  }

  // 异步验证用户名
  const checkUsernameExists = async () => {
    try {
      const usernameDto: CheckUsernameDTO = { username: value };
      const response = await CheckUsername(usernameDto);

      if (response.data.data.username === true) {
        callback(new Error('该用户名已被注册'));
      } else {
        callback();
      }
    } catch (error) {
      console.error('验证用户名时出错:', error);
      // 验证出错时也放行，错误会在提交时再次验证
      callback();
    }
  };
  checkUsernameExists();
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: validateCaptcha, trigger: 'blur' }
  ]
}

// 切换登录/注册表单
const switchForm = (toLogin: boolean) => {
  isLogin.value = toLogin
  // 切换表单时重置表单数据
  if (toLogin) {
    // 登录表单的重置逻辑保持不变
    loginForm.username = ''
    loginForm.password = ''
    if (loginFormRef.value) {
      loginFormRef.value.resetFields()
    }
  } else {
    // 重置注册表单和验证码状态
    registerForm.username = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.captcha = ''
    captchaShown.value = false // 重置验证码显示状态
    base64.value = '' // 清空验证码
    if (registerFormRef.value) {
      registerFormRef.value.resetFields()
    }
  }
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;

      // 设置超时定时器
      timeoutTimer = window.setTimeout(() => {
        loading.value = false;
        ElMessage.warning('登录请求超时，请检查网络后重试');
        clearTimeout(timeoutTimer as number);
        timeoutTimer = null;
      }, REQUEST_TIMEOUT);

      try {
        let res = await userStore.Login(loginForm);
        // 清除超时定时器
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }

        if (res?.sucess) {
          // 登录成功后跳转到首页
          userStore.updateUserInfo(res.data);
          ElMessage.success('登录成功');
          router.push('/home');
        } else {
          // 登录失败提示
          ElMessage.error(res?.message || '登录失败，请重试');
        }
      } catch (error) {
        console.error('登录错误:', error);
        ElMessage.error('登录失败，请重试');
      } finally {
        // 清除超时定时器
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }
        loading.value = false;
      }
    }
  });
};

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;

      // 设置超时定时器
      timeoutTimer = window.setTimeout(() => {
        loading.value = false;
        ElMessage.warning('注册请求超时，请检查网络后重试');
        clearTimeout(timeoutTimer as number);
        timeoutTimer = null;
      }, REQUEST_TIMEOUT);

      try {
        // 再次验证用户名是否可用(以防异步验证被跳过)
        const usernameDto: CheckUsernameDTO = { username: registerForm.username };
        const usernameCheckResponse = await CheckUsername(usernameDto);

        // 如果用户名已存在，显示错误消息并返回
        if (usernameCheckResponse.data.data.username === true) {
          ElMessage.error('该用户名已被注册');
          loading.value = false;

          // 清除超时定时器
          if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
          }
          return;
        }

        // 验证通过，提交注册
        const registerData: RegisterDTO = {
          username: registerForm.username,
          password: registerForm.password,
          code: registerForm.captcha
        };
        const result = await userStore.Register(registerData);

        // 清除超时定时器
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }

        if (result.sucess) {
          ElMessage.success('注册成功');
          // 注册成功后跳转到登录页
          switchForm(true);
        } else {
          ElMessage.error(result.message || '注册失败，请重试');
        }
      } catch (error) {
        console.error('注册时发生错误:', error);
        ElMessage.error('注册失败，请重试');
      } finally {
        // 清除超时定时器
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }
        loading.value = false;
      }
    }
  });
};

// 组件卸载前清除所有定时器
onBeforeUnmount(() => {
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }
})
</script>

<style scoped>
/* 验证码容器样式 */
.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-code {
  flex-shrink: 0;
  cursor: pointer;
  height: 40px;
  width: 120px;
  /* 固定宽度确保按钮和图片大小一致 */
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 调整验证码输入框宽度 */
.captcha-container .el-input {
  flex: 1;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 16px !important;
  /* 添加卡片圆角 */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1) !important;
  /* 增强阴影效果 */
  background-color: rgba(255, 255, 255, 0.95) !important;
  /* 略微透明的背景 */
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 600;
  font-size: 24px;
}

.login-form,
.register-form {
  margin-top: 20px;
}

/* 让输入框也有圆角 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.submit-btn {
  width: 100%;
  margin-top: 24px;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
}

/* 注册表单只有一个链接，居中显示 */
.register-form .form-footer {
  justify-content: center;
}

/* 链接样式优化 */
:deep(.el-link) {
  font-weight: 500;
  transition: all 0.2s;
}

:deep(.el-link:hover) {
  transform: translateY(-1px);
  opacity: 0.8;
}
</style>