<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left" @click="goHome">
        <img src="@/assets/logo.png" alt="logo" class="logo">
      </div>
      <div class="header-center">
        <el-menu mode="horizontal" :default-active="activeMenu" router :ellipsis="false">
          <el-menu-item index="/home">
            <el-icon>
              <HomeFilled />
            </el-icon>
            首页
          </el-menu-item>
          <el-menu-item index="/problem">
            <el-icon>
              <List />
            </el-icon>
            题目
          </el-menu-item>
          <el-menu-item index="/training">
            <el-icon>
              <Edit />
            </el-icon>
            训练
          </el-menu-item>
          <el-menu-item index="/judge">
            <el-icon>
              <TrendCharts />
            </el-icon>
            评测
          </el-menu-item>
          <el-menu-item index="/rank">
            <el-icon>
              <Histogram />
            </el-icon>
            排名
          </el-menu-item>
          <el-menu-item index="/about">
            <el-icon>
              <InfoFilled />
            </el-icon>
            关于
          </el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <template v-if="!isLoggedIn">
          <!-- 未登录状态 -->
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button @click="handleRegister">注册</el-button>
        </template>
        <template v-else>
          <!-- 已登录状态 -->
          <el-dropdown trigger="hover">
            <div class="user-dropdown-link">
              <!-- 头像显示 -->
              <el-avatar :size="32" :src="userInfo.avatar" v-if="userInfo.avatar && userInfo.avatar.trim() !== ''">
              </el-avatar>
              <el-avatar :size="32" v-else :style="{ backgroundColor: '#409EFF' }">
                {{ userInfo.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <span style="font-size: 17px;" class="username">{{ userInfo.username }}</span>
              <!-- 添加一个向下箭头图标 -->
              <el-icon class="dropdown-icon" :size="12">
                <CaretBottom />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon>
                    <User />
                  </el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="router.push('/submission')">
                  <el-icon>
                    <Document />
                  </el-icon>我的提交
                </el-dropdown-item>
                <el-dropdown-item @click="router.push('/settings')">
                  <el-icon>
                    <Setting />
                  </el-icon>账号设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </header>

    <!-- 中间内容区 -->
    <main class="app-main">
      <router-view></router-view>
    </main>

    <!-- 底部页脚 -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>蜗牛 OJ</h3>
          <p>走得慢，但很稳</p>
        </div>
        <div class="footer-section">
          <h3>服务</h3>
          <ul>
            <li><el-link>评测队列</el-link></li>
            <li><el-link>系统信息</el-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>开发</h3>
          <ul>
            <li><el-link>开源</el-link></li>
            <li><el-link>API</el-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>支持</h3>
          <ul>
            <li><el-link>关于</el-link></li>
            <li><el-link>帮助</el-link></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>沪ICP备xxx号</span>
        <span>Powered by SnailOJ</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts" name="layout">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { List, Edit, TrendCharts, HomeFilled, Histogram, InfoFilled, User, Document, Setting, SwitchButton, CaretBottom } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { UserInfoVO } from '@/api/passport/type'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeMenu = ref(router.currentRoute.value.path)
const userStore = useUserStore()
const isLoggedIn = ref(false)
const userInfo = ref<UserInfoVO>({
  uid: ' ',
  username: ' ',
  nickname: ' ',
  avatar: ' ',
  titleName: ' ',
  titleColor: ' ',
  email: ' ',
  number: ' ',
  gender: ' ',
  school: ' ',
  course: ' ',
  signature: ' ',
  realname: ' ',
  github: ' ',
  blog: ' ',
  cfUsername: ' ',
  roleList: [],
})

/**
 * 检查用户登录状态并获取用户信息
 */
const checkLoginStatus = () => {
  try {
    // 使用getter判断登录状态
    if (userStore.isLogin) {
      isLoggedIn.value = true

      // 使用getter获取用户信息
      const storeUserInfo = userStore.getUserInfo

      // 检查store中是否已有完整的用户信息
      if (storeUserInfo && storeUserInfo.uid) {
        // 直接使用store中的用户信息
        userInfo.value = { ...storeUserInfo }
      } else {
        // 尝试从localStorage获取
        fetchUserInfoFromStorage()
      }
    } else {
      // 未登录状态
      isLoggedIn.value = false
      userInfo.value = getDefaultUserInfo()
    }
  } catch (error) {
    console.error('检查登录状态时出错:', error)
    isLoggedIn.value = false
    userInfo.value = getDefaultUserInfo()
  }
}

/**
 * 从本地存储获取用户信息
 */
const fetchUserInfoFromStorage = () => {
  try {
    // 从localStorage获取用户信息
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

    // 检查数据是否有效
    if (storedUserInfo && storedUserInfo.uid) {
      userInfo.value = { ...getDefaultUserInfo(), ...storedUserInfo }
      // 确保store中也有这些信息
      userStore.updateUserInfo(userInfo.value)
    } else {
      // 如果没有有效数据，使用默认值
      userInfo.value = getDefaultUserInfo()
    }
  } catch (error) {
    console.error('解析用户信息出错:', error)
    userInfo.value = getDefaultUserInfo()
  }
}

/**
 * 获取用户信息默认值
 */
const getDefaultUserInfo = (): UserInfoVO => {
  return {
    uid: '',
    username: '用户',
    nickname: '用户',
    avatar: '/default-avatar.png',
    titleName: '新用户',
    titleColor: '#909399',
    email: '',
    number: '',
    gender: '',
    school: '',
    course: '',
    signature: '这个人很懒，还没有签名',
    realname: '',
    github: '',
    blog: '',
    cfUsername: '',
    roleList: ['user'],
  }
}

// 在组件挂载时调用
onMounted(async () => {
  checkLoginStatus()
})
// 监听路由变化
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    activeMenu.value = newPath
  }
)
const handleLogin = () => {
  router.push('/login?type=login')
}

const handleRegister = () => {
  router.push('/login?type=register')
}

const handleLogout = () => {
  userStore.logout()
  isLoggedIn.value = false
  ElMessage.success('退出登录')
  router.push('/home')
}

const goHome = () => {
  router.push('/home')
  activeMenu.value = '/home'
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #e6eaf2 100%);
  background-size: cover;
  background-attachment: fixed;
}

/* 顶部导航栏样式 */
.app-header {
  height: 64px;
  padding: 0 40px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.header-left .logo {
  height: 42px;
  margin-right: 20px;
  transition: transform 0.3s;
}

.header-left .logo:hover {
  transform: scale(1.05);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-center .el-menu {
  border-bottom: none;
  background-color: transparent;
}

:deep(.el-menu--horizontal .el-menu-item) {
  height: 64px;
  line-height: 64px;
  margin: 0 5px;
  border-bottom: none;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s;
}

:deep(.el-menu--horizontal .el-menu-item.is-active) {
  color: #409EFF;
  border-bottom: 3px solid #409EFF;
}

:deep(.el-menu--horizontal .el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
}

/* header-right 基础样式增强 */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  height: 100%;
}

/* 用户下拉菜单链接样式 */
.user-dropdown-link {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(64, 158, 255, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.1);
}

/* 用户名样式 */
.username {
  margin-left: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown-link:hover {
  background-color: rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-right .el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 10px 20px;
  height: 40px;
}

.header-right .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 主内容区样式 */
.app-main {
  margin-top: 64px;
  flex: 1;
  padding: 40px;
  background-color: transparent;
  min-height: calc(100vh - 64px - 220px);
}

/* 底部页脚样式 */
.app-footer {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 50px 40px 30px;
  margin-top: auto;
  box-shadow: 0 -2px 12px 0 rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(5px);
}

.footer-content {
  display: flex;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.footer-section {
  flex: 1;
  min-width: 180px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 18px;
  color: #303133;
  font-weight: 600;
  position: relative;
  padding-bottom: 8px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 30px;
  height: 3px;
  background-color: #409EFF;
  border-radius: 3px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 12px;
}

:deep(.footer-section .el-link) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  transition: all 0.2s;
}

:deep(.footer-section .el-link:hover) {
  color: #409EFF;
  transform: translateX(3px);
}

/* 头像样式优化 */
:deep(.el-avatar) {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  padding: 8px 0;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border: none;
}

:deep(.el-dropdown-item) {
  padding: 10px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

:deep(.el-dropdown-item:hover) {
  background-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-dropdown-item .el-icon) {
  margin-right: 10px;
  font-size: 16px;
  color: #409EFF;
}

/* 退出登录项的特殊样式 */
:deep(.el-dropdown-menu__item.is-divided) {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 5px;
  padding-top: 10px;
}

:deep(.el-dropdown-menu__item.is-divided .el-icon) {
  color: #F56C6C;
}

.footer-bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.footer-bottom span {
  margin: 0 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 20px;
  }

  .header-center {
    display: none;
  }

  .app-main {
    padding: 20px;
  }

  .footer-section {
    min-width: 140px;
  }
}
</style>