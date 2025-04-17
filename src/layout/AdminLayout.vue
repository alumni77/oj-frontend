<template>
  <div class="admin-container">
    <!-- 左侧菜单 -->
    <div class="admin-sidebar">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <h2>Snail OJ</h2>
      </div>

      <el-menu :default-active="activeMenu" class="sidebar-menu" router background-color="transparent"
        text-color="#606266" active-text-color="#409EFF">
        <el-menu-item index="/admin/dashboard">
          <el-icon>
            <DataLine />
          </el-icon>
          <span>仪表盘</span>
        </el-menu-item>

        <el-menu-item index="/admin/users">
          <el-icon>
            <User />
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-sub-menu index="problems">
          <template #title>
            <el-icon>
              <Collection />
            </el-icon>
            <span>题目管理</span>
          </template>
          <el-menu-item index="/admin/problems/list">题目列表</el-menu-item>
          <el-menu-item index="/admin/problems/create">创建题目</el-menu-item>
          <el-menu-item index="/admin/problems/tags">标签管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="trainings">
          <template #title>
            <el-icon>
              <Reading />
            </el-icon>
            <span>训练管理</span>
          </template>
          <el-menu-item index="/admin/trainings/list">训练列表</el-menu-item>
          <el-menu-item index="/admin/trainings/create">创建训练</el-menu-item>
          <el-menu-item index="/admin/trainings/categories">分类管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="admin-content">
      <!-- 顶部导航栏 -->
      <div class="admin-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>后台管理</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>

        <div class="user-info">
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="32">
                {{ currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'A' }}
              </el-avatar>
              <span class="username">{{ currentUser.username || '管理员' }}</span>
              <el-icon>
                <CaretBottom />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 主要内容区 - 使用插槽接收子组件内容 -->
      <div class="admin-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataLine,
  User,
  Collection,
  Reading,
  CaretBottom
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'

// 路由相关
const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => {
  // 根据路径判断激活的菜单
  const path = route.path
  if (path.includes('/admin/problems/')) {
    return 'problems'
  } else if (path.includes('/admin/trainings/')) {
    return 'trainings'
  }
  return path
})

const currentPageTitle = computed(() => {
  const pathMap: Record<string, string> = {
    '/admin/dashboard': '仪表盘',
    '/admin/users': '用户管理',
    '/admin/problems': '题目管理',
    '/admin/problems/list': '题目列表',
    '/admin/problems/create': '创建题目',
    '/admin/problems/tags': '标签管理',
    '/admin/trainings': '训练管理',
    '/admin/trainings/list': '训练列表',
    '/admin/trainings/create': '创建训练',
    '/admin/trainings/categories': '分类管理'
  }
  return pathMap[route.path] || '仪表盘'
})

// 当前用户信息
const useUser = useUserStore()
const currentUser = ref<{ username?: string }>({})

// 处理退出登录
const handleLogout = () => {
  ElMessage.success('退出登录成功')
  router.push('/')
}

// 生命周期钩子
onMounted(() => {
  currentUser.value = {
    username: useUser.userInfo?.username || '管理员'
  }
})
</script>

<style scoped>
/* 容器样式 */
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f6f8fa;
}

/* 侧边栏样式 */
.admin-sidebar {
  width: 220px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.logo {
  width: 40px;
  height: 40px;
}

.logo-container h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 5px 0;
  border-radius: 0 20px 20px 0;
  margin-right: 10px;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  font-weight: 500;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.05);
}

:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  margin: 5px 0;
  border-radius: 0 20px 20px 0;
  margin-right: 10px;
}

:deep(.el-sub-menu__title:hover) {
  background-color: rgba(64, 158, 255, 0.05);
}

:deep(.el-menu-item) .el-icon,
:deep(.el-sub-menu__title) .el-icon {
  margin-right: 10px;
  font-size: 18px;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #409EFF;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  padding-left: 48px !important;
}

/* 内容区样式 */
.admin-content {
  flex: 1;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏样式 */
.admin-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.avatar-container:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

/* Element Plus Avatar 样式 */
:deep(.el-avatar) {
  background-color: #409EFF;
  color: #fff;
  font-weight: bold;
}

/* 主内容区样式 */
.admin-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
  }
}
</style>