<template>
  <div class="page-container">
    <div class="training-detail-content">
      <!-- 顶部标题和信息 -->
      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="10" animated />
      </div>
      <template v-else>
        <!-- 训练标题 -->
        <div class="training-header">
          <div class="title-container">
            <h1 class="training-title">{{ training.title }}</h1>
            <el-tag v-if="training.categoryName" :style="{ color: '#ffffff', backgroundColor: training.categoryColor }"
              class="category-tag">
              {{ training.categoryName }}
            </el-tag>
          </div>
          <div class="training-meta">
            <el-space size="large">
              <el-text>
                <el-icon>
                  <User />
                </el-icon>
                作者: {{ training.author }}
              </el-text>
              <el-text>
                <el-icon>
                  <Document />
                </el-icon>
                题目数: {{ training.problemCount }}
              </el-text>
              <el-text>
                <el-icon>
                  <CircleCheck />
                </el-icon>
                已完成: {{ training.acCount }}
              </el-text>
              <el-text>
                <el-icon>
                  <Timer />
                </el-icon>
                更新时间: {{ formatDate(training.gmtModified) }}
              </el-text>
            </el-space>
          </div>
        </div>

        <!-- 训练进度 -->
        <el-card class="progress-card" shadow="hover">
          <div class="progress-info">
            <div class="progress-text">
              <span class="progress-title">完成进度</span>
              <span class="progress-value">{{ calculateProgress() }}% ({{ training.acCount }}/{{ training.problemCount
              }})</span>
            </div>
            <el-progress :percentage="calculateProgress()" :stroke-width="20"
              :color="getProgressColor(calculateProgress())" :format="percentageFormat"></el-progress>
          </div>
        </el-card>

        <!-- 训练导航 -->
        <el-card class="nav-card" shadow="hover">
          <el-menu mode="horizontal" :default-active="activeTab" @select="handleTabChange" :ellipsis="false">
            <el-menu-item index="intro">
              <el-icon>
                <InfoFilled />
              </el-icon>
              训练简介
            </el-menu-item>
            <el-menu-item index="problems">
              <el-icon>
                <Collection />
              </el-icon>
              题目列表
            </el-menu-item>
            <!-- <el-menu-item index="records">
              <el-icon>
                <List />
              </el-icon>
              记录榜单
            </el-menu-item> -->
          </el-menu>
        </el-card>

        <!-- 内容区域 -->
        <div class="content-area">
          <!-- 训练简介 -->
          <el-card v-if="activeTab === 'intro'" class="intro-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon>
                  <Document />
                </el-icon>
                <span>训练描述</span>
              </div>
            </template>

            <div class="markdown-content">
              <md-preview :modelValue="training.description" :code-theme="'github'" previewTheme="vuepress"
                :style="{ fontSize: '15px' }" />
            </div>
          </el-card>

          <!-- 题目列表 -->
          <el-card v-if="activeTab === 'problems'" class="problems-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon>
                  <Collection />
                </el-icon>
                <span>题目列表</span>
              </div>
            </template>

            <div v-if="problemsLoading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>
            <el-table v-else :data="problemList" style="width: 100%" @row-click="handleProblemClick" row-key="pid">
              <el-table-column prop="problemId" label="题号" width="300" align="center">
                <template #default="{ row }">
                  <div class="problem-id-container">
                    <el-icon v-if="isProblemSolved(row.pid)" class="solved-icon">
                      <Check />
                    </el-icon>
                    <span class="problem-id">{{ row.problemId }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="title" label="题目" width="250" align="center">
                <template #default="{ row }">
                  <div class="problem-title-container">
                    <span class="problem-status-dot" :class="getProblemStatusClass(row.pid)"></span>
                    <span class="problem-title">{{ row.title }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="标签" width="300" align="center">
                <template #default="{ row }">
                  <div class="tags-container">
                    <el-tag v-for="tag in row.tags" :key="tag.id"
                      :style="{ backgroundColor: tag.color, color: tag.color }" size="small" class="problem-tag">
                      {{ tag.name }}
                    </el-tag>
                    <span v-if="!row.tags || row.tags.length === 0" class="no-tags">无标签</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="难度" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                    {{ getDifficultyText(row.difficulty) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="通过率" width="300" align="center">
                <template #default="{ row }">
                  <div class="ac-rate-container">
                    <el-progress :percentage="calculateAcRate(row)" :stroke-width="12" :format="formatAcRate"
                      :color="getAcRateColor(calculateAcRate(row))"></el-progress>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="200" align="center">
                <template #default="{ row }">
                  <router-link :to="`/problem/${row.problemId}`">
                    <el-button type="primary" plain size="small">
                      <el-icon>
                        <Edit />
                      </el-icon>
                      做题
                    </el-button>
                  </router-link>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 记录榜单 -->
          <el-card v-if="activeTab === 'records'" class="records-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon>
                  <List />
                </el-icon>
                <span>记录榜单</span>
              </div>
            </template>

            <div class="no-data-placeholder">
              <el-empty description="暂无记录数据" />
            </div>
          </el-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" name="TrainingDetail">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document, InfoFilled, Collection, List, User, Timer,
  CircleCheck, Edit,
  Check
} from '@element-plus/icons-vue'
import { getTraining, getTrainingProblemList } from '@/api/training'
import { getUserProblemStatus } from '@/api/problem'
import { Problem } from '@/api/problem/type'
import router from '@/router'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

// 路由相关
const route = useRoute()
const trainingId = computed(() => parseInt(route.params.tid as string))

// 页面状态
const loading = ref(true)
const problemsLoading = ref(false)
const activeTab = ref('intro')
const training = ref<any>({})
const problemList = ref<any[]>([])
const problemStatus = ref<Record<string, any>>({})
const videoLinks = ref<Record<string, string>>({})

// 难度级别映射
const difficultyMap = {
  0: '未知',
  1: '语法',
  2: '入门',
  3: '基础',
  4: '普及',
  5: '提高',
  6: '进阶',
  7: '省选',
  8: 'NOI',
  9: '国集'
}

// 获取难度类型（用于显示不同颜色）
const getDifficultyType = (difficulty: number) => {
  const difficultyText = difficultyMap[difficulty as keyof typeof difficultyMap] || '未知'
  const typeMap: Record<string, string> = {
    '未知': 'info',
    '语法': 'info',
    '入门': 'info',
    '基础': 'success',
    '普及': 'warning',
    '提高': 'danger',
    '进阶': 'danger',
    '省选': 'danger',
    'NOI': 'danger',
    '国集': 'danger'
  }
  return typeMap[difficultyText] || 'info'
}

// 获取难度文本
const getDifficultyText = (difficulty: number) => {
  return difficultyMap[difficulty as keyof typeof difficultyMap] || '未知'
}

// 获取训练详情
const fetchTrainingDetail = async () => {
  loading.value = true
  try {
    const response = await getTraining(trainingId.value)

    if (response.data && response.data.code === 200) {
      training.value = response.data.data

      // 解析视频链接数据
      if (training.value.videoExtraFile) {
        try {
          videoLinks.value = JSON.parse(training.value.videoExtraFile)
        } catch (e) {
          console.error('视频数据解析失败:', e)
          videoLinks.value = {}
        }
      }
    } else {
      ElMessage.error('获取训练详情失败')
    }
  } catch (error) {
    console.error('获取训练详情失败:', error)
    ElMessage.error('请求训练详情数据出错')
  } finally {
    loading.value = false
  }
}

// 获取训练题目列表
const fetchProblemList = async () => {
  problemsLoading.value = true
  try {
    const response = await getTrainingProblemList(trainingId.value)

    if (response && response.data && response.data.code === 200) {
      problemList.value = response.data.data || []

      // 获取题目状态
      if (problemList.value.length > 0) {
        fetchProblemStatus()
      }
    } else {
      ElMessage.error('获取题目列表失败')
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('请求题目列表数据出错')
  } finally {
    problemsLoading.value = false
  }
}

// 获取用户题目状态
const fetchProblemStatus = async () => {
  try {
    const pidList = problemList.value.map(problem => problem.pid)
    const response = await getUserProblemStatus({ pidList })

    if (response && response.data && response.data.code === 200) {
      problemStatus.value = response.data.data || {}
    }
  } catch (error) {
    console.error('获取题目状态失败:', error)
  }
}

// 获取题目状态样式
const getProblemStatusClass = (pid: number) => {
  const status = problemStatus.value[pid]?.status

  if (!status) return 'status-none'

  if (status === 0) {
    return 'status-ac'
  } else if (status === -10) {
    return 'status-attempted'
  }

  return 'status-none'
}

// 判断题目是否已解决（status为0）
const isProblemSolved = (pid: number) => {
  return problemStatus.value[pid]?.status === 0
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'

  try {
    const now = new Date()
    const updateDate = new Date(dateStr)
    const timeDiff = now.getTime() - updateDate.getTime()

    const minutesDiff = Math.floor(timeDiff / (1000 * 60))
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

    if (minutesDiff < 1) {
      return '刚刚'
    } else if (minutesDiff < 60) {
      return `${minutesDiff}分钟前`
    } else if (hoursDiff < 24) {
      return `${hoursDiff}小时前`
    } else if (daysDiff < 30) {
      return `${daysDiff}天前`
    } else {
      return `${updateDate.getMonth() + 1}月${updateDate.getDate()}日`
    }
  } catch (e) {
    console.log('日期格式化错误:', e)
    return dateStr
  }
}

// 计算训练完成进度
const calculateProgress = () => {
  if (!training.value.problemCount || training.value.problemCount === 0) return 0
  return Math.round((training.value.acCount / training.value.problemCount) * 100)
}

// 格式化进度显示
const percentageFormat = (percentage: number) => {
  return percentage === 100 ? '已完成' : `${percentage}%`
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 30) return '#909399'
  if (percentage < 70) return '#E6A23C'
  if (percentage < 100) return '#67C23A'
  return '#67C23A'
}

// 计算题目通过率
const calculateAcRate = (problem: Problem) => {
  if (!problem.total || problem.total === 0) return 0
  return Math.round((problem.ac / problem.total) * 100)
}

// 格式化通过率显示
const formatAcRate = (percentage: number) => {
  return `${percentage}%`
}

// 获取通过率颜色
const getAcRateColor = (rate: number) => {
  if (rate < 30) return '#F56C6C'
  if (rate < 60) return '#E6A23C'
  return '#67C23A'
}

// 处理标签切换
const handleTabChange = (tab: any) => {
  activeTab.value = tab
  if (tab === 'problems' && problemList.value.length === 0) {
    fetchProblemList()
  }
}

// 处理题目点击
const handleProblemClick = (row: Problem) => {
  router.push(`/problem/${row.problemId}`)
}

// 页面初始化
onMounted(() => {
  fetchTrainingDetail()
})
</script>

<style scoped>
/* 页面容器 */
.page-container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 主内容区域 */
.training-detail-content {
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
}

/* 加载区域 */
.loading-section {
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
}

/* 训练标题区域 */
.training-header {
  margin-bottom: 20px;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.title-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.training-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.category-tag {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 16px;
}

.training-meta {
  font-size: 14px;
  color: #606266;
}

/* 题目列表样式 */
.problem-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 添加居中对齐 */
  gap: 10px;
}

.problem-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-none {
  background-color: #dcdfe6;
}

.status-ac {
  background-color: #67C23A;
}

.status-attempted {
  background-color: #E6A23C;
}

.problem-title {
  font-weight: 500;
}

/* 标签容器样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  /* 添加居中对齐 */
}

.problem-tag {
  font-size: 12px;
  /* 确保文字颜色是白色 */
}

/* 无标签占位符 */
.no-tags {
  color: #909399;
  font-size: 12px;
}

/* 进度卡片 */
.progress-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
}

.progress-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.progress-info {
  padding: 10px 0;
}

.progress-text {
  display: flex;
  position: relative;
  margin-bottom: 10px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  /* 保持在左侧 */
}

.progress-value {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  /* 绝对定位，水平居中 */
}

/* 导航卡片 */
.nav-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
}

.nav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 内容卡片公共样式 */
.intro-card,
.problems-card,
.records-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 24px;
}

.intro-card:hover,
.problems-card:hover,
.records-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
}

.card-header .el-icon {
  font-size: 20px;
  color: #409EFF;
}

/* Markdown内容样式 */
:deep(.md-editor-preview-wrapper) {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
}

:deep(.md-editor-preview) {
  background-color: transparent !important;
  font-size: 15px;
}

/* 保留基本的标题样式 */
:deep(.md-editor-preview h1, .md-editor-preview h2) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 8px;
}

/* 修复评论、引用和表格颜色 */
:deep(.md-editor-preview pre .hljs-comment) {
  color: #6a737d !important;
}

:deep(.md-editor-preview blockquote) {
  border-left: 4px solid #dfe2e5;
  padding: 0 16px;
  color: #6a737d;
}

:deep(.md-editor-preview table) {
  border-collapse: collapse;
  margin: 16px 0;
}

:deep(.md-editor-preview th, .md-editor-preview td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

/* 题目列表样式 */
.problem-id {
  font-family: monospace;
  font-weight: 600;
}

.problem-title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.problem-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-none {
  background-color: #dcdfe6;
}

.status-ac {
  background-color: #67C23A;
}

.status-attempted {
  background-color: #E6A23C;
}

.problem-title {
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.problem-tag {
  font-size: 12px;
}

.ac-rate-container {
  padding: 0 5px;
}

/* 加载状态容器 */
.loading-container {
  padding: 40px 0;
}

/* 无数据占位 */
.no-data-placeholder {
  padding: 40px 0;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item.is-active) {
  color: #409EFF;
  border-bottom-color: #409EFF;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  margin-top: 12px;
  --el-table-border-color: rgba(0, 0, 0, 0.05);
  --el-table-header-bg-color: #f5f7fa;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(64, 158, 255, 0.03);
}

:deep(.el-table__row:hover td) {
  background-color: rgba(64, 158, 255, 0.08) !important;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

/* v-md-preview 样式覆盖 */
:deep(.v-md-pre-wrapper) {
  background-color: transparent !important;
  border: none !important;
}

:deep(.v-md-editor__preview-wrapper) {
  padding: 0 !important;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .training-header {
    padding: 16px;
  }

  .training-title {
    font-size: 22px;
  }

  .title-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .training-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>