<template>
  <div class="page-container">
    <div class="home-content">
      <!-- 左侧内容区(70%) -->
      <div class="content-left">
        <h2 class="welcome-title">欢迎使用 Snail OJ</h2>

        <!-- 轮播图部分 -->
        <el-card class="carousel-card">
          <el-carousel height="450px">
            <el-carousel-item v-for="item in carouselItems" :key="item.id">
              <div class="carousel-content" :style="{ backgroundImage: `url(${item.image})` }">
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-card>

        <!-- 提交统计图表 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon>
                <TrendCharts />
              </el-icon>
              <span>最近一周提交统计</span>
              <el-button class="download-btn" :icon="Download" circle @click="downloadChart" />
            </div>
          </template>
          <div class="chart-container">
            <div v-if="chartLoading" class="chart-loading">
              <el-skeleton :rows="3" animated />
            </div>
            <v-chart v-else ref="chartRef" class="chart" :option="chartOption" autoresize />
          </div>
        </el-card>

        <!-- 最新题目列表 -->
        <el-card class="problems-card">
          <template #header>
            <div class="card-header">
              <el-icon>
                <Collection />
              </el-icon>
              <span>最新题目</span>
            </div>
          </template>

          <div v-if="problemLoading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>

          <el-table v-else :data="problemList" style="width: 100%" @row-click="handleProblemClick">
            <el-table-column prop="problemId" label="题目ID" width="400" align="center" header-align="center" />
            <el-table-column prop="title" label="标题" width="400" align="center" header-align="center" />
            <el-table-column prop="updateTime" label="最近更新" width="500" align="center" header-align="center" />
          </el-table>

          <div v-if="!problemLoading && problemList.length === 0" class="empty-data">
            暂无最新题目数据
          </div>
        </el-card>

      </div>

      <!-- 右侧排行榜(30%) -->
      <div class="content-right">
        <el-card class="rank-card">
          <template #header>
            <div class="rank-header">
              <el-icon>
                <TrendCharts />
              </el-icon>
              <span>最近一周通过榜单</span>
            </div>
          </template>

          <el-table :data="rankList" style="width: 100%" :show-header="true">
            <el-table-column prop="rank" label="#" width="50">
              <template #default="scope">
                <div class="rank-number" :class="getRankClass(scope.row.rank)">
                  {{ scope.row.rank }}
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="user" label="用户名" width="200">
              <template #default="scope">
                <div class="user-info">
                  <el-avatar :size="24" :src="scope.row.avatar">
                    {{ scope.row.username.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <span class="username">{{ scope.row.username }}</span>
                  <el-tag v-if="scope.row.tag" size="small" :type="scope.row.tagType">
                    {{ scope.row.tag }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="solved" label="通过" width="135" align="center">
              <template #default="scope">
                <span class="solved-count">{{ scope.row.solved }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { ECOption } from '@/types/charts'
import { Download, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  GetHomeCarousel,
  GetLastWeekSubmissionStatistics,
  GetRecentSevenACRank,
  GetRecentUpdateProblem
} from '@/api/account'
import { CarouselItem, RecentUpdatedProblemVO } from '@/api/account/type'
import { saveAs } from 'file-saver'
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 注册ECharts必须的组件
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

// ======== 类型定义 ========
// 问题数据接口
interface Problem {
  problemId: number;
  title: string;
  gmtModified: string;
  updateTime?: string;
  [key: string]: any;
}

// ======== 响应式状态 ========
// 图表ref和数据
const chartRef = ref<{ chart: any } | null>(null)
const chartOption = ref<ECOption>({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['通过', '总数']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  series: [
    {
      name: '通过',
      type: 'line' as const,
      stack: 'Total',
      areaStyle: {
        color: '#95de64',
        opacity: 0.3
      },
      emphasis: {
        focus: 'series'
      },
      data: [],
      itemStyle: {
        color: '#95de64'
      },
      smooth: true
    },
    {
      name: '总数',
      type: 'line' as const,
      stack: 'Total',
      areaStyle: {
        color: '#69c0ff',
        opacity: 0.3
      },
      emphasis: {
        focus: 'series'
      },
      data: [],
      itemStyle: {
        color: '#69c0ff'
      },
      smooth: true
    }
  ]
})
const chartLoading = ref(false)

// 轮播图数据
const carouselItems = ref<CarouselItem[]>([])

// 题目数据
const problemList = ref<Problem[]>([])
const problemLoading = ref(false)

// 排行榜数据
const rankList = ref([])
const rankLoading = ref(false)

// ======== 生命周期钩子 ========
onMounted(() => {
  fetchCarouselData()
  fetchChartData()
  fetchProblemList()
  fetchRankList()
})

// ======== 数据获取方法 ========
// 获取轮播图数据
const fetchCarouselData = async () => {
  try {
    const response = await GetHomeCarousel()

    if (response.data && response.data.code === 200) {
      const carouselData = response.data.data || []
      carouselItems.value = carouselData.map((item: { id: number; url: string }) => ({
        id: item.id,
        image: item.url,
      }))
    } else {
      ElMessage.error('获取轮播图数据失败')
    }
  } catch (error) {
    console.error('获取轮播图数据失败:', error)
    ElMessage.error('请求错误')
  }
}

// 获取图表数据
const fetchChartData = async () => {
  chartLoading.value = true
  try {
    const response = await GetLastWeekSubmissionStatistics()

    if (response.data && response.data.code === 200) {
      const data = response.data.data
      if (data && data.dateStrList && data.acCountList && data.totalCountList) {
        const newOption = { ...chartOption.value }

        if (newOption.xAxis && !Array.isArray(newOption.xAxis)) {
          (newOption.xAxis as { type: 'category', data: string[] }).data = data.dateStrList
        }

        if (Array.isArray(newOption.series) && newOption.series.length >= 2) {
          const seriesCopy = [...newOption.series]
          seriesCopy[0] = { ...seriesCopy[0], data: data.acCountList }
          seriesCopy[1] = { ...seriesCopy[1], data: data.totalCountList }
          newOption.series = seriesCopy
        }

        chartOption.value = newOption
      } else {
        console.error('后端返回的数据结构不完整:', data)
        ElMessage.error('图表数据格式不正确')
      }
    } else {
      ElMessage.error('获取提交统计数据失败')
    }
  } catch (error) {
    console.error('获取图表数据失败:', error)
    ElMessage.error('请求图表数据出错')
  } finally {
    chartLoading.value = false
  }
}

// 获取题目列表
const fetchProblemList = async () => {
  problemLoading.value = true
  try {
    const response = await GetRecentUpdateProblem()

    if (response.data && response.data.code === 200) {
      problemList.value = response.data.data || []
      problemList.value = problemList.value.map(problem => ({
        ...problem,
        updateTime: formatDate(problem.gmtModified)
      }))
    } else {
      ElMessage.error('获取最新题目数据失败')
    }
  } catch (error) {
    console.error('获取最新题目失败:', error)
    ElMessage.error('请求最新题目数据出错')
  } finally {
    problemLoading.value = false
  }
}

// 获取排行榜数据
const fetchRankList = async () => {
  rankLoading.value = true
  try {
    const response = await GetRecentSevenACRank()

    if (response.data && response.data.code === 200) {
      const data = response.data.data || []
      rankList.value = data.map((user: any, index: number) => ({
        rank: index + 1,
        uid: user.uid,
        username: user.nickname || user.username,
        avatar: user.avatar,
        tag: user.titleName,
        tagType: getTagType(user.titleColor),
        solved: user.ac,
        firstLetter: getFirstLetter(user.nickname || user.username)
      }))
    } else {
      ElMessage.error('获取排行榜数据失败')
    }
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    ElMessage.error('请求排行榜数据出错')
  } finally {
    rankLoading.value = false
  }
}

// ======== 工具方法 ========
// 下载图表
const downloadChart = () => {
  try {
    if (!chartRef.value) {
      ElMessage.warning('找不到图表元素')
      return
    }

    const chartInstance = chartRef.value.chart
    if (chartInstance) {
      const dataURL = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })
      saveAs(dataURL, `提交统计-${new Date().toISOString().slice(0, 10)}.png`)
      ElMessage.success('图表已下载')
    } else {
      ElMessage.warning('无法获取图表实例')
    }
  } catch (error) {
    console.error('下载图表出错:', error)
    ElMessage.error('下载图表时出现错误')
  }
}

// 处理题目点击
const handleProblemClick = (row: RecentUpdatedProblemVO) => {
  console.log('题目row:', row);
  router.push(`/problem/${row.problemId}`)
}

// 格式化日期为相对时间
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';

  try {
    const now = new Date();
    const updateDate = new Date(dateStr);
    const timeDiff = now.getTime() - updateDate.getTime();

    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (minutesDiff < 1) {
      return '刚刚';
    } else if (minutesDiff < 60) {
      return `${minutesDiff}分钟前`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff}小时前`;
    } else if (daysDiff < 30) {
      return `${daysDiff}天前`;
    } else {
      return updateDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  } catch (e) {
    console.log('日期格式化错误:', e);
    return dateStr;
  }
}

// 获取排名样式
const getRankClass = (rank: number) => {
  const rankClasses = {
    1: 'rank-first',
    2: 'rank-second',
    3: 'rank-third'
  }
  return rankClasses[rank as keyof typeof rankClasses] || 'rank-normal'
}

// 获取用户名首字母
const getFirstLetter = (name: string) => {
  if (!name) return 'U'
  return name.charAt(0)
}

// 获取标签类型
const getTagType = (color: string) => {
  if (!color) return ''

  const colorMap: Record<string, string> = {
    '#3366CC': 'primary',
    '#9933CC': 'danger',
    '#FF6600': 'warning',
    '#66CC33': 'success',
    '#FF3333': 'danger'
  }

  return colorMap[color] || ''
}
</script>

<style scoped>
/* 页面容器 */
.page-container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  /* 移除背景色，使用全局背景 */
}

/* 主内容区域 */
.home-content {
  display: flex;
  gap: 24px;
  width: 100%;
  margin: 0 auto;
  max-width: 1800px;
  /* 限制最大宽度 */
}

/* 左侧内容区 */
.content-left {
  flex: 0 0 75%;
  max-width: 75%;
}

/* 右侧内容区 */
.content-right {
  flex: 0 0 25%;
  max-width: 25%;
}

/* 欢迎标题 */
.welcome-title {
  margin: 0 0 24px 0;
  color: #409EFF;
  font-size: 28px;
  font-weight: 600;
  position: relative;
  padding-bottom: 12px;
  background-color: #ffffff;
  border-radius: 12px;
  text-align: center;
  padding-top: 5px;
}

/* 所有卡片的统一样式 */
.carousel-card,
.chart-card,
.problems-card,
.rank-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 24px;
}

.carousel-card:hover,
.chart-card:hover,
.problems-card:hover,
.rank-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 轮播图样式 */
.carousel-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30px;
  color: white;
  position: relative;
}

/* 添加渐变遮罩 */
.carousel-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0) 100%);
  z-index: 1;
}

.carousel-content h3,
.carousel-content p {
  position: relative;
  z-index: 2;
}

.carousel-content h3 {
  margin: 0;
  font-size: 28px;
  margin-bottom: 12px;
  font-weight: 600;
}

.carousel-content p {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

/* 排行榜样式 */
.rank-card {
  height: 57%;
}

.rank-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
}

.rank-header .el-icon {
  font-size: 20px;
  color: #409EFF;
}

/* 排名数字样式 */
.rank-number {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s;
}

.rank-first {
  background-color: #F56C6C;
  color: white;
  box-shadow: 0 3px 6px rgba(245, 108, 108, 0.3);
}

.rank-second {
  background-color: #E6A23C;
  color: white;
  box-shadow: 0 3px 6px rgba(230, 162, 60, 0.3);
}

.rank-third {
  background-color: #67C23A;
  color: white;
  box-shadow: 0 3px 6px rgba(103, 194, 58, 0.3);
}

.rank-normal {
  background-color: #909399;
  color: white;
}

/* 添加或修改图表容器样式 */
.chart-container {
  height: 400px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 500;
  color: #303133;
  transition: color 0.3s;
}

.user-info:hover .username {
  color: #409EFF;
}

/* 通过数量样式 */
.solved-count {
  font-weight: bold;
  color: #409EFF;
  font-size: 16px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-carousel__item) {
  border-radius: 12px;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(64, 158, 255, 0.7);
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(64, 158, 255, 0.9);
}

:deep(.el-carousel__indicators) {
  bottom: 20px;
}

:deep(.el-carousel__indicator--horizontal .el-carousel__button) {
  width: 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-carousel__indicator--horizontal.is-active .el-carousel__button) {
  width: 24px;
}

:deep(.el-table) {
  margin-top: 12px;
  background-color: transparent;
  --el-table-border-color: rgba(0, 0, 0, 0.05);
}

:deep(.el-table tr) {
  background-color: transparent !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(64, 158, 255, 0.03);
}

:deep(.el-table__row:hover td) {
  background-color: rgba(64, 158, 255, 0.08) !important;
}

:deep(.el-table .cell) {
  padding: 10px 0;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-avatar) {
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media screen and (max-width: 1400px) {
  .content-left {
    flex: 0 0 70%;
    max-width: 70%;
  }

  .content-right {
    flex: 0 0 30%;
    max-width: 30%;
  }
}

@media screen and (max-width: 1200px) {
  .welcome-title {
    font-size: 24px;
  }

  .carousel-content h3 {
    font-size: 24px;
  }

  .carousel-content p {
    font-size: 16px;
  }
}

@media screen and (max-width: 768px) {
  .home-content {
    flex-direction: column;
    gap: 20px;
  }

  .content-left,
  .content-right {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .welcome-title {
    font-size: 22px;
  }
}
</style>