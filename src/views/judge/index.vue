<template>
  <div class="judge-container">
    <el-card class="judge-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">
              <el-icon>
                <Document />
              </el-icon>
              评测记录
            </span>
          </div>
          <div class="header-right">
            <div class="filter-area">
              <div class="filter-label">筛选：</div>
              <div class="all-mine-toggle">
                <span>全部</span>
                <el-switch v-model="onlyMine" @change="handleToggleMine" />
                <span>我的</span>
              </div>
              <el-dropdown @command="handleStatusChange" trigger="click">
                <el-button class="status-dropdown" size="default" :type="selectedStatus ? 'primary' : 'default'">
                  {{ getStatusName() }}
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="all">全部</el-dropdown-item>
                    <el-dropdown-item command="0">Accepted</el-dropdown-item>
                    <el-dropdown-item command="1">Time Limit Exceeded</el-dropdown-item>
                    <el-dropdown-item command="2">Memory Limit Exceeded</el-dropdown-item>
                    <el-dropdown-item command="3">Runtime Error</el-dropdown-item>
                    <el-dropdown-item command="4">System Error</el-dropdown-item>
                    <el-dropdown-item command="5">Pending</el-dropdown-item>
                    <el-dropdown-item command="6">Compiling</el-dropdown-item>
                    <el-dropdown-item command="7">Judging</el-dropdown-item>
                    <el-dropdown-item command="8">Partial Accepted</el-dropdown-item>
                    <el-dropdown-item command="9">Submitted Failed</el-dropdown-item>
                    <el-dropdown-item command="10">Cancelled</el-dropdown-item>
                    <el-dropdown-item command="11">Presentation Error</el-dropdown-item>
                    <el-dropdown-item command="12">Compile Error</el-dropdown-item>
                    <el-dropdown-item command="13">Wrong Answer</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="search-area">
              <el-input v-model="searchProblemID" placeholder="题目ID" clearable size="default" class="search-input"
                @keyup.enter="handleSearch">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
              <el-input v-model="searchUsername" placeholder="作者" clearable size="default" class="search-input"
                @keyup.enter="handleSearch" :disabled="onlyMine">
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" size="default" @click="refreshData" class="refresh-button">
                <el-icon>
                  <Refresh />
                </el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </div>
      </template>

      <el-table :data="judgeList" style="width: 100%" :row-class-name="tableRowClassName" v-loading="loading" border
        stripe size="large">
        <el-table-column prop="submitId" label="Run ID" width="100" sortable />
        <el-table-column label="题目" min-width="220">
          <template #default="{ row }">
            <router-link :to="`/problem/${row.pid}`" class="problem-link">
              {{ row.displayPid }} {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分数" width="80" align="center" sortable>
          <template #default="{ row }">
            <span v-if="row.score !== null">{{ row.score }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="运行时间" width="100" align="center" sortable>
          <template #default="{ row }">
            {{ row.time }}ms
          </template>
        </el-table-column>
        <el-table-column label="运行内存" width="100" align="center" sortable>
          <template #default="{ row }">
            {{ formatMemory(row.memory) }}
          </template>
        </el-table-column>
        <el-table-column prop="length" label="代码长度" width="100" align="center">
          <template #default="{ row }">
            {{ row.length }}B
          </template>
        </el-table-column>
        <el-table-column prop="language" label="语言" width="130" />
        <el-table-column prop="judger" label="判题器" width="120" />
        <el-table-column prop="username" label="作者" width="120">
          <template #default="{ row }">
            <router-link :to="`/user/${row.username}`" class="user-link">
              {{ row.username }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="150" show-overflow-tooltip sortable>
          <template #default="{ row }">
            {{ formatDate(row.submitTime) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
          layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 脚本部分保持不变
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getJudgeList } from '@/api/judge'
import useUserStore from '@/store/modules/user'
import { Refresh, Search, ArrowDown, Document, User } from '@element-plus/icons-vue'
import type { JudgeVO } from '@/api/judge/type'

// 用户信息
const userStore = useUserStore()
const currentUsername = computed(() => userStore.userInfo?.username || '')

// 状态映射
const statusMap = {
  0: { text: 'Accepted', type: 'success' },
  1: { text: 'Time Limit Exceeded', type: 'warning' },
  2: { text: 'Memory Limit Exceeded', type: 'warning' },
  3: { text: 'Runtime Error', type: 'danger' },
  4: { text: 'System Error', type: 'danger' },
  5: { text: 'Pending', type: 'info' },
  6: { text: 'Compiling', type: 'info' },
  7: { text: 'Judging', type: 'info' },
  8: { text: 'Partial Accepted', type: 'primary' },
  9: { text: 'Submitted Failed', type: 'danger' },
  10: { text: 'Cancelled', type: 'info' },
  11: { text: 'Presentation Error', type: 'danger' },
  12: { text: 'Compile Error', type: 'warning' },
  13: { text: 'Wrong Answer', type: 'danger' }
}

// 查询参数
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const onlyMine = ref(false)
const selectedStatus = ref('')
const searchProblemID = ref('')
const searchUsername = ref('')
const loading = ref(false)

// 评测列表数据
const judgeList = ref<JudgeVO[]>([])

// 获取状态名称显示
const getStatusName = () => {
  if (!selectedStatus.value || selectedStatus.value === 'all') {
    return '全部状态'
  }
  return statusMap[Number(selectedStatus.value) as keyof typeof statusMap]?.text || '未知状态'
}

// 获取评测列表数据
const fetchJudgeList = async () => {
  loading.value = true
  try {
    const params = {
      currentPage: currentPage.value,
      limit: pageSize.value,
      onlyMine: onlyMine.value,
      problemID: searchProblemID.value || undefined,
      // 修复这里的逻辑，确保0也能被正确识别
      status: selectedStatus.value === 'all' ? undefined :
        (selectedStatus.value === '' ? undefined : Number(selectedStatus.value)),
      username: searchUsername.value || undefined,
      completeProblemID: true
    }

    const response = await getJudgeList(params)
    if (response.data && response.data.code === 200) {
      judgeList.value = response.data.data.records
      total.value = response.data.data.total
    } else {
      ElMessage.error('获取评测列表失败')
    }
  } catch (error) {
    console.error('获取评测列表失败:', error)
    ElMessage.error('获取评测列表失败')
  } finally {
    loading.value = false
  }
}
// 格式化内存显示
const formatMemory = (memory: number) => {
  if (memory < 1024) {
    return `${memory} KB`
  } else {
    return `${(memory / 1024).toFixed(1)} MB`
  }
}

// 格式化日期显示
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 3600 * 1000))

  if (diffDays === 0) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  } else if (diffDays === 1) {
    return "1 天前"
  } else if (diffDays < 30) {
    return `${diffDays} 天前`
  } else {
    const months = date.getMonth() + 1
    const days = date.getDate()
    return `${months}月${days}日`
  }
}

// 获取状态文本
const getStatusText = (status: number) => {
  return statusMap[status as keyof typeof statusMap]?.text || '未知状态'
}

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  return statusMap[status as keyof typeof statusMap]?.type || 'info'
}

// 设置表格行的类名
const tableRowClassName = ({ row }: { row: JudgeVO }) => {
  if (row.username === currentUsername.value) {
    return 'highlight-row'
  }
  return ''
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchJudgeList()
}

// 处理每页数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchJudgeList()
}

// 处理筛选状态变化
const handleStatusChange = (command: string) => {
  selectedStatus.value = command
  currentPage.value = 1
  fetchJudgeList()
}

// 处理切换仅查看我的提交
const handleToggleMine = () => {
  currentPage.value = 1
  if (onlyMine.value) {
    // 仅查看我的，清空用户名搜索框
    searchUsername.value = ''
  }
  fetchJudgeList()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchJudgeList()
}

// 刷新数据
const refreshData = () => {
  fetchJudgeList()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchJudgeList()
})
</script>

<style scoped>
.judge-container {
  padding: 20px;
  max-width: 2000px;
  /* 缩小最大宽度，让内容更居中 */
  margin: 0 auto;
}

.judge-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.header-title {
  font-size: 20px;
  /* 增大标题字体 */
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title .el-icon {
  font-size: 22px;
  /* 增大图标尺寸 */
}

.filter-area {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-area {
  display: flex;
  gap: 16px;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  /* 靠左对齐 */
}

.filter-label {
  font-weight: 500;
  color: #606266;
  font-size: 16px;
  /* 增大字体 */
}

.all-mine-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f5f7fa;
  padding: 6px 12px;
  /* 增大内边距 */
  border-radius: 4px;
  font-size: 15px;
  /* 增大字体 */
}

.search-input {
  width: 180px;
  /* 增大搜索框宽度 */
  font-size: 15px;
  /* 增大字体 */
}

:deep(.el-input__inner) {
  font-size: 15px;
  /* 增大输入框内字体 */
  height: 40px;
  /* 增大输入框高度 */
}

:deep(.el-input__icon) {
  font-size: 18px;
  /* 增大输入框图标 */
}

.status-dropdown {
  display: flex;
  align-items: center;
  font-size: 15px;
  /* 增大字体 */
  min-width: 140px;
  /* 增大按钮宽度 */
  height: 40px;
  /* 增大按钮高度 */
}

.refresh-button {
  font-size: 15px;
  /* 增大字体 */
  padding: 10px 20px;
  /* 增大按钮内边距 */
  height: 40px;
  /* 确保与输入框同高 */
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 高亮当前用户的提交 */
:deep(.highlight-row) {
  background-color: #f0f9eb !important;
}

.problem-link,
.user-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.problem-link:hover,
.user-link:hover {
  text-decoration: underline;
  color: #337ecc;
}

/* 让表格更整洁美观 */
:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
  --el-table-row-hover-bg-color: #f5f7fa;
  border-radius: 6px;
  overflow: hidden;
  font-size: 15px;
  /* 增大表格字体 */
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
  font-size: 15px;
  /* 增大表头字体 */
}

:deep(.el-table--border) {
  border-radius: 6px;
}

:deep(.el-pagination) {
  justify-content: flex-end;
  font-size: 15px;
  /* 增大分页器字体 */
}

:deep(.el-tag) {
  font-weight: 500;
  font-size: 14px;
  /* 增大标签字体 */
}

/* 响应式调整 */
@media screen and (min-width: 768px) {
  .header-right {
    flex-direction: row;
    justify-content: space-between;
  }

  .search-area {
    justify-content: flex-end;
    width: auto;
  }
}

@media screen and (max-width: 767px) {

  .filter-area,
  .search-area {
    width: 100%;
  }
}
</style>