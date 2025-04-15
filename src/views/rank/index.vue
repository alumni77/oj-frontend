<template>
  <div class="page-container">
    <div class="rank-content">
      <!-- 排名标题 -->
      <h2 class="page-title">OI 排行榜</h2>

      <!-- 顶部图表卡片 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon>
                <TrendCharts />
              </el-icon>
              <span>分数排行 - 前8名</span>
            </div>
            <el-button class="download-btn" :icon="Download" circle @click="exportChart" />
          </div>
        </template>
        <div class="chart-container" ref="chartContainer">
          <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="3" animated />
          </div>
          <v-chart ref="chartRef" v-else class="chart" :option="chartOption" autoresize />
        </div>
      </el-card>

      <!-- 排名表格卡片 -->
      <el-card class="rank-table-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon>
                <Histogram />
              </el-icon>
              <span>完整排名</span>
            </div>
            <div class="search-area">
              <el-input v-model="searchKeyword" placeholder="搜索用户名/昵称" clearable @keyup.enter="handleSearch"
                class="search-input">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="handleSearch">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="refreshData">
                <el-icon>
                  <Refresh />
                </el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-table :data="rankList" style="width: 100%" v-loading="loading" border stripe>
          <el-table-column label="#" width="80" align="center">
            <template #default="scope">
              <div class="rank-number" :class="getRankClass(scope.$index + 1)">
                {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="用户" width="300" align="center">
            <template #default="{ row }">
              <div class="user-info centered">
                <el-avatar :size="40" :src="row.avatar" class="user-avatar">
                  {{ getFirstLetter(row.username) }}
                </el-avatar>
                <div class="user-detail">
                  <router-link :to="`/user/${row.username}`" class="username">
                    {{ row.username }}
                  </router-link>
                  <div v-if="row.titleName" class="user-title" :style="{ color: row.titleColor || '#3366CC' }">
                    {{ row.titleName }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="昵称" width="300" align="center">
            <template #default="{ row }">
              {{ row.nickname || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="score" label="分数" width="250" sortable align="center">
            <template #default="{ row }">
              <span class="score">{{ row.score }}</span>
            </template>
          </el-table-column>

          <el-table-column label="通过/总数" width="270" align="center">
            <template #default="{ row }">
              <div class="submission-count">
                <span class="ac-count">{{ row.ac }}</span>/{{ row.total }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="通过率" width="300" align="center">
            <template #default="{ row }">
              <div class="pass-rate">
                {{ row.total > 0 ? ((row.ac / row.total) * 100).toFixed(2) : '0.00' }}%
              </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, TrendCharts, Histogram } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, DatasetComponent } from 'echarts/components'
import { getRankList } from '@/api/rank'

// 注册ECharts组件
use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent
])

// 查询参数
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const searchKeyword = ref('')
const loading = ref(false)

// 排名列表数据
const rankList = ref<any[]>([])
const topUsers = ref<any[]>([])

// 图表容器
const chartContainer = ref<HTMLElement | null>(null)
// 图表引用
const chartRef = ref()

// 图表配置
const chartOption = computed(() => {
  const usernames = topUsers.value.map(user => user.username)
  const scores = topUsers.value.map(user => user.score)
  const colors = topUsers.value.map(user => user.titleColor || '#C23531')

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        const user = topUsers.value[params[0].dataIndex]
        return `
          <div style="font-weight: bold">${user.username}</div>
          <div>分数: ${user.score}</div>
          <div>通过: ${user.ac}/${user.total}</div>
          <div>通过率: ${user.total > 0 ? ((user.ac / user.total) * 100).toFixed(2) : '0.00'}%</div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: usernames,
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '分数'
    },
    series: [
      {
        name: '分数',
        type: 'bar',
        data: scores,
        itemStyle: {
          color: function (params: any) {
            return colors[params.dataIndex] || '#409EFF'
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ]
  }
})

// 获取排名列表
const fetchRankList = async () => {
  loading.value = true
  try {
    const params = {
      currentPage: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value || undefined,
      type: 1  // OI排名
    }

    const response = await getRankList(params)
    if (response.data && response.data.code === 200) {
      rankList.value = response.data.data.records || []
      total.value = response.data.data.total || 0

      // 获取前8名数据用于图表
      if (currentPage.value === 1) {
        topUsers.value = rankList.value.slice(0, 8)
      }
    } else {
      ElMessage.error('获取排名列表失败')
    }
  } catch (error) {
    console.error('获取排名列表失败:', error)
    ElMessage.error('获取排名列表失败')
  } finally {
    loading.value = false
  }
}

// 导出图表为图片
const exportChart = () => {
  if (!chartRef.value) {
    ElMessage.warning('图表未加载完成')
    return
  }

  try {
    // 通过ref直接获取图表实例
    const chart = chartRef.value.chart

    if (chart && typeof chart.getDataURL === 'function') {
      const dataURL = chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })

      const a = document.createElement('a')
      a.href = dataURL
      a.download = `OI-排行榜-${new Date().toISOString().slice(0, 10)}.png`
      a.click()
      ElMessage.success('图表已下载')
    } else {
      throw new Error('无法获取图表渲染方法')
    }
  } catch (error) {
    console.error('导出图表错误:', error)
    ElMessage.error('导出图表失败，请稍后再试')
  }
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchRankList()
}

// 处理每页数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchRankList()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchRankList()
}

// 刷新数据
const refreshData = () => {
  searchKeyword.value = ''
  fetchRankList()
}

// 获取排名样式
const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return 'rank-normal'
}

// 获取用户名首字母作为头像显示
const getFirstLetter = (username: string) => {
  if (!username) return 'U'
  return username.charAt(0).toUpperCase()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchRankList()
})
</script>

<style scoped>
/* 页面容器样式 */
.page-container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

.rank-content {
  max-width: 2000;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题 */
.page-title {
  margin: 0 0 24px 0;
  color: #409EFF;
  font-size: 28px;
  font-weight: 600;
  position: relative;
  padding-bottom: 12px;
  background-color: #ffffff;
  border-radius: 12px;
  text-align: center;
  padding: 8px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 卡片样式 */
.chart-card,
.rank-table-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 24px;
}

.chart-card:hover,
.rank-table-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
}

.header-left .el-icon {
  font-size: 20px;
  color: #409EFF;
}

/* 图表容器样式 */
.chart-container {
  height: 400px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

.chart-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 搜索区域样式 */
.search-area {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 240px;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info.centered {
  justify-content: center;
  margin: 0 auto;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #409eff;
  text-decoration: none;
}

.username:hover {
  text-decoration: underline;
}

.user-title {
  font-size: 12px;
  margin-top: 2px;
}

/* 排名样式 */
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

/* 分数和通过率样式 */
.score {
  font-weight: 600;
  color: #f56c6c;
}

.submission-count {
  font-weight: 500;
}

.ac-count {
  color: #67c23a;
}

.pass-rate {
  font-weight: 500;
}

/* Element Plus 组件样式覆盖 */
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
  background-color: #409EFF;
  color: white;
  font-weight: bold;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }

  .search-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-input {
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>