<template>
  <div class="page-container">
    <div class="problem-content">
      <!-- 左侧题目列表部分 -->
      <div class="content-left">
        <h2 class="section-title">题目列表</h2>

        <!-- 合并筛选器和题目列表到一个卡片 -->
        <el-card class="problems-card">
          <template #header>
            <div class="card-header">
              <el-icon>
                <List />
              </el-icon>
              <span>题目筛选 & 列表</span>
            </div>
          </template>

          <!-- 筛选器部分 -->
          <div class="filter-section">
            <div class="tags-wrapper">
              <!-- 难度筛选 -->
              <div class="tag-group">
                <span class="tag-label" style="font-size: 16px;">难度：</span>
                <el-radio-group v-model="difficulty" size="small" style="display: flex; flex-wrap: wrap; gap: 16px;">
                  <el-radio-button :value="'全部'" label="全部" />
                  <el-radio-button :value="'未知'" label="未知" />
                  <el-radio-button :value="'语法'" label="语法" />
                  <el-radio-button :value="'入门'" label="入门" />
                  <el-radio-button :value="'基础'" label="基础" />
                  <el-radio-button :value="'普及'" label="普及" />
                  <el-radio-button :value="'提高'" label="提高" />
                  <el-radio-button :value="'进阶'" label="进阶" />
                  <el-radio-button :value="'省选'" label="省选" />
                  <el-radio-button :value="'NOI'" label="NOI" />
                  <el-radio-button :value="'国集'" label="国集" />
                </el-radio-group>
              </div>

              <!-- 选中的标签显示区域 -->
              <div v-if="selectedTags.length > 0" class="tag-group">
                <span class="tag-label">标签：</span>
                <div class="selected-tags">
                  <el-tag v-for="tag in selectedTags" :key="tag" closable size="small" @close="removeTag(tag)">
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 搜索区域 -->
            <div class="search-section">
              <el-input v-model="searchQuery" placeholder="输入题目编号或关键词搜索" :prefix-icon="Search" clearable />
              <el-checkbox v-model="onlyShowUnsolved">仅显示未完成</el-checkbox>
            </div>
          </div>

          <el-divider />

          <!-- 题目表格部分 -->
          <el-table :data="problemList" style="width: 100%" @cell-mouse-enter="(row: Problem) => handleMouseEnter(row)"
            @cell-mouse-leave="() => handleMouseLeave()">
            <el-table-column type="index" width="50" />
            <el-table-column prop="problemId" label="题号" width="200" align="center">
              <template #default="scope">
                <span :class="['problem-id', scope.row.status]">{{ scope.row.problemId }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="题目" width="300" align="center">
              <template #default="scope">
                <div class="title-cell">
                  <span class="problem-title" @click="handleProblemClick(scope.row)">{{ scope.row.title }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="标签" width="250">
              <template #default="scope">
                <div class="tags-wrapper-inline">
                  <el-tag v-for="tag in scope.row.tags" :key="tag.id" size="small" class="problem-tag clickable-tag"
                    :style="tag.color ? { backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '50' } : {}"
                    @click.stop="addTagFilter(tag.name)" :effect="isTagSelected(tag.name) ? 'dark' : 'light'"
                    :type="isTagSelected(tag.name) ? 'primary' : ''">
                    {{ tag.name }}
                  </el-tag>
                  <span v-if="!scope.row.tags || scope.row.tags.length === 0" class="no-tags">无标签</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="difficulty" label="难度" width="120">
              <template #default="scope">
                <el-tag :type="getDifficultyType(scope.row.difficultyText)" size="small">
                  {{ scope.row.difficultyText || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total" label="总数" width="110" align="center">
              <template #default="scope">
                <span class="total-count">{{ scope.row.total }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="acceptance" label="通过率" width="120" align="center">
              <template #default="scope">
                <span :class="getAcceptanceClass(scope.row.acceptance)">
                  {{ scope.row.acceptance }}%
                </span>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[5, 10, 15, 20, 30, 40]" layout="prev, pager, next, sizes" :total="total"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </el-card>
      </div>

      <!-- 右侧区域 -->
      <div class="content-right">
        <!-- 通过率图表 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon>
                <PieChart />
              </el-icon>
              <span>通过率分布</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="chartOption" autoresize />
          </div>
        </el-card>

        <!-- 标签云卡片 -->
        <el-card class="tags-card">
          <template #header>
            <div class="card-header">
              <el-icon>
                <CollectionTag />
              </el-icon>
              <span>全部标签</span>
              <el-input v-model="tagSearchQuery" placeholder="搜索标签" :prefix-icon="Search" size="small" clearable
                class="tag-search-input" />
            </div>
          </template>
          <div class="tags-container">
            <el-collapse v-model="activeTagCategories">
              <el-collapse-item v-for="category in tagCategories" :key="category.name" :title="category.name"
                :name="category.name">
                <div class="tag-cloud">
                  <el-tag v-for="tag in filterTags(category.tags)" :key="tag"
                    :type="isTagSelected(tag) ? 'primary' : 'info'" class="clickable-tag"
                    :effect="isTagSelected(tag) ? 'dark' : 'light'" @click="toggleTag(tag)">
                    {{ tag }}
                  </el-tag>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ------------ 导入区域 ------------
import { ref, watch, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart as PieChartComponent } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts/types/dist/shared'
import { List, PieChart, CollectionTag } from '@element-plus/icons-vue'
import { getProblemList, getProblemTagsAndClassification } from '@/api/problem'
import type { ProblemListParams, Problem, ProblemResponse, Tag, TagCategory } from '@/api/problem/type'
import { ElMessage, ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'

// ------------ 类型定义 ------------
type ECOption = EChartsOption

// ------------ 组件注册 ------------
// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChartComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// ------------ 状态定义 ------------
// 筛选相关状态
const difficulty = ref('全部')
const searchQuery = ref('')
const onlyShowUnsolved = ref(false)
const selectedTags = ref<string[]>([])
const tagSearchQuery = ref('')
const router = useRouter()

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// UI相关状态
const loading = ref(false)
const activeTagCategories = ref(['算法基础', '数据结构'])

// 数据相关状态
const problemList = ref<Problem[]>([])
const tagCategories = ref<TagCategory[]>([])
const allTags = ref<Tag[]>([])
const tagNameToIdMap = ref<Map<string, number>>(new Map())

// 图表相关状态
const chartOption = ref<ECOption>(createDefaultChartOption())

// ------------ 常量定义 ------------
// 难度级别映射
const difficultyMap: Record<string, number> = {
  '未知': 0,
  '语法': 1,
  '入门': 2,
  '基础': 3,
  '普及': 4,
  '提高': 5,
  '进阶': 6,
  '省选': 7,
  'NOI': 8,
  '国集': 9
}

// 反向难度映射
const difficultyReverse: Record<number, string> = {
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

// ------------ 图表相关函数 ------------
// 创建默认图表配置
function createDefaultChartOption(): ECOption {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      padding: 5
    },
    title: {
      text: '通过率概览',
      left: 'center',
      top: 0
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 20, name: 'AC', itemStyle: { color: '#67C23A' } },
          { value: 20, name: 'WA', itemStyle: { color: '#F56C6C' } },
          { value: 20, name: 'TLE', itemStyle: { color: '#E6A23C' } },
          { value: 20, name: 'MLE', itemStyle: { color: 'black' } },
          { value: 20, name: 'RE', itemStyle: { color: '#409EFF' } }
        ]
      }
    ]
  }
}

// 处理鼠标进入事件（更新图表）
const handleMouseEnter = (row: Problem) => {
  // 检查统计数据是否存在
  if (!row || !row.statistics) {
    return
  }

  // 创建全新的图表配置对象，而不是修改现有的
  const newChartOption: ECOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      padding: 5
    },
    title: {
      text: `${row.problemId} 提交统计`,
      subtext: row.title,
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 16
      },
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: Number(row.statistics.ac.toFixed(1)), name: 'AC', itemStyle: { color: '#67C23A' } },
        { value: Number(row.statistics.wa.toFixed(1)), name: 'WA', itemStyle: { color: '#F56C6C' } },
        { value: Number(row.statistics.tle.toFixed(1)), name: 'TLE', itemStyle: { color: '#E6A23C' } },
        { value: Number(row.statistics.mle.toFixed(1)), name: 'MLE', itemStyle: { color: 'black' } },
        { value: Number(row.statistics.re.toFixed(1)), name: 'RE', itemStyle: { color: '#409EFF' } },
        { value: Number(row.statistics.other.toFixed(1)), name: '其他', itemStyle: { color: '#909399' } }
      ],
      animationDuration: 300,
      animationType: 'scale'
    }]
  }

  // 完全替换图表选项
  chartOption.value = newChartOption
}

// 处理鼠标离开事件（重置图表）
const handleMouseLeave = () => {
  // 重置图表为全新的默认配置
  chartOption.value = createDefaultChartOption()
}

// ------------ 数据获取函数 ------------
// 获取题目列表数据
const fetchProblemList = async () => {
  const loadingInstance = ElLoading.service({
    target: '.problems-card',
    text: '加载中...'
  })

  loading.value = true

  try {
    // 构建请求参数
    const params: ProblemListParams = {
      limit: pageSize.value,
      currentPage: currentPage.value,
      keyword: searchQuery.value || undefined,
    }

    // 添加难度参数
    if (difficulty.value !== '全部') {
      params.difficulty = difficultyMap[difficulty.value]
    }

    // 添加标签筛选参数
    if (selectedTags.value.length > 0) {
      const tagIds: number[] = selectedTags.value
        .map(tagName => tagNameToIdMap.value.get(tagName.toLowerCase()))
        .filter((id): id is number => id !== undefined)

      if (tagIds.length > 0) {
        params.tagId = tagIds.join(',')
      }
    }

    // 发送请求
    const response = await getProblemList(params)

    if (response.data && response.data.code === 200) {
      const data: ProblemResponse = response.data.data

      // 处理问题数据，添加前端需要的属性
      const processedProblems = data.records.map(problem => {
        // 计算通过率
        const acceptance = problem.total > 0 ? Math.round((problem.ac / problem.total) * 100) : 0

        // 确定题目状态（解决/尝试/未解决）
        const randomStatus = Math.random()
        let status = 'unsolved'
        if (randomStatus > 0.7) status = 'solved'
        else if (randomStatus > 0.4) status = 'attempted'

        // 统计数据
        const statistics = {
          ac: problem.ac / (problem.total || 1) * 100,
          wa: problem.wa / (problem.total || 1) * 100,
          tle: problem.tle / (problem.total || 1) * 100,
          mle: problem.mle / (problem.total || 1) * 100,
          re: problem.re / (problem.total || 1) * 100,
          other: (problem.pe + problem.ce + problem.se + problem.pa) / (problem.total || 1) * 100
        }

        // 返回处理后的题目对象
        return {
          ...problem,
          acceptance,
          status,
          statistics,
          difficultyText: difficultyReverse[problem.difficulty] || '未知'
        }
      })

      problemList.value = processedProblems
      total.value = data.total
    } else {
      ElMessage.error(response.data?.msg || '获取题目列表失败')
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('获取题目列表出错')
  } finally {
    loading.value = false
    loadingInstance.close()
  }
}

// 获取所有标签数据
const fetchAllTags = async () => {
  try {
    const response = await getProblemTagsAndClassification()
    if (response.data && response.data.code === 200) {
      const data = response.data.data

      // 转换数据格式
      const formattedTags: { name: string; tags: string[]; rawTags: Tag[] }[] = data.map((item: { classification: { name: string }; tagList: Tag[] }) => {
        // 从分类中提取分类名称
        const categoryName: string = item.classification.name
        // 从标签列表中提取标签名称
        const tagNames: string[] = item.tagList.map((tag: Tag) => tag.name)

        // 构建标签ID到标签对象的映射，用于后续标签选择
        item.tagList.forEach((tag: Tag) => {
          tagNameToIdMap.value.set(tag.name.toLowerCase(), tag.id)
          allTags.value.push(tag)
        })

        // 返回符合前端要求的格式
        return {
          name: categoryName,
          tags: tagNames,
          rawTags: item.tagList
        }
      })

      // 更新标签分类数据
      tagCategories.value = formattedTags

      // 更新活跃分类，使用新的分类名称
      if (formattedTags.length > 0) {
        activeTagCategories.value = [formattedTags[0].name]
      }
    }
  } catch (error) {
    console.error('获取标签数据失败:', error)
    ElMessage.error('获取标签数据失败')
  }
}

// ------------ 事件处理函数 ------------
// 点击题目标题跳转
const handleProblemClick = (val: Problem) => {
  console.log('点击了题目标题', val)
  // 跳转到问题详情页，通过URL参数传递问题ID
  router.push({
    name: 'problemDetail',
    params: { pid: val.problemId.toString() },
  })
}

// 添加标签筛选
const addTagFilter = (tagName: string) => {
  // 防止事件冒泡触发表格行的其他事件
  event?.stopPropagation()

  // 如果标签已经被选中，则不做任何操作
  if (selectedTags.value.includes(tagName)) {
    return
  }

  // 添加到已选标签中
  selectedTags.value.push(tagName)

  // 重新获取题目列表
  currentPage.value = 1 // 重置为第一页
  fetchProblemList()
}

// 标签切换（添加/移除）
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

// 移除标签
const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index !== -1) {
    selectedTags.value.splice(index, 1)
  }
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchProblemList()
}

// 分页当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchProblemList()
}

// ------------ 工具函数 ------------
// 获取难度类型（用于显示不同颜色）
const getDifficultyType = (difficultyText: string) => {
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

// 获取通过率类名（基于通过率设置不同颜色）
const getAcceptanceClass = (rate: number) => {
  if (rate >= 60) return 'acceptance-high'
  if (rate >= 40) return 'acceptance-medium'
  return 'acceptance-low'
}

// 筛选标签（用于标签搜索）
const filterTags = (tags: string[]) => {
  if (!tagSearchQuery.value) return tags
  return tags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.value.toLowerCase())
  )
}

// 判断标签是否被选中
const isTagSelected = (tag: string) => {
  return selectedTags.value.includes(tag)
}

// ------------ 监听器和生命周期钩子 ------------
// 监听筛选条件变化，刷新数据
watch([difficulty, searchQuery, onlyShowUnsolved, selectedTags], () => {
  currentPage.value = 1 // 重置为第一页
  fetchProblemList()
}, { deep: true })

// 组件挂载时初始化数据
onMounted(() => {
  fetchProblemList()
  fetchAllTags()
})
</script>

<style scoped>
/* ========== 主要布局 ========== */
/* 页面容器 */
.page-container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 主内容区域 */
.problem-content {
  display: flex;
  gap: 24px;
  width: 100%;
  margin: 0 auto;
  max-width: 1800px;
  padding: 20px;
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

/* 区域标题 */
.section-title {
  margin: 0 0 24px 0;
  color: #409EFF;
  font-size: 28px;
  font-weight: 600;
  position: relative;
  padding: 5px 0 12px;
  background-color: #ffffff;
  border-radius: 12px;
  text-align: center;
}

/* ========== 卡片通用样式 ========== */
.problems-card,
.chart-card,
.tags-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 24px;
}

.problems-card:hover,
.chart-card:hover,
.tags-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 卡片头部样式 */
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

/* ========== 筛选器样式 ========== */
.filter-section {
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-label {
  font-size: 14px;
  color: #606266;
  width: 50px;
  flex-shrink: 0;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.search-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 16px;
}

/* ========== 标签云样式 ========== */
.tag-search-input {
  width: 150px;
  margin-left: auto;
}

.tags-container {
  max-height: 400px;
  overflow-y: auto;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}

.clickable-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable-tag:hover {
  transform: scale(1.05);
}

/* 题目表格中的可点击标签 */
.problem-tag.clickable-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.problem-tag.clickable-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 标签容器样式 */
.tags-wrapper-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 2px 0;
}

/* 标签样式 */
.problem-tag {
  margin-right: 0;
  font-size: 11px;
  padding: 0 6px;
  height: 22px;
  line-height: 20px;
}

/* 无标签时的样式 */
.no-tags {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}

/* ========== 题目表格样式 ========== */
.title-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.problem-title {
  color: #409EFF;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-block;
  text-align: center;
}

.problem-title:hover {
  text-decoration: underline;
}

.problem-id {
  font-family: monospace;
  font-weight: 500;
}

.problem-id.solved {
  color: #67C23A;
}

.problem-id.attempted {
  color: #E6A23C;
}

/* 通过率样式 */
.acceptance-high {
  color: #67C23A;
  font-weight: bold;
}

.acceptance-medium {
  color: #E6A23C;
  font-weight: bold;
}

.acceptance-low {
  color: #F56C6C;
  font-weight: bold;
}

/* ========== 图表样式 ========== */
.chart-container {
  height: 300px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

/* ========== 分页样式 ========== */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 16px;
}

/* ========== 滚动条样式 ========== */
.tags-container::-webkit-scrollbar {
  width: 6px;
}

.tags-container::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

.tags-container::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

/* ========== Element Plus 组件样式覆盖 ========== */
:deep(.el-table) {
  margin-top: 12px;
  background-color: transparent;
  --el-table-border-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: rgba(64, 158, 255, 0.08) !important;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: bold;
  padding: 0 8px;
}

:deep(.el-collapse-item__content) {
  padding: 8px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-divider--horizontal) {
  margin: 16px 0;
  background-color: rgba(0, 0, 0, 0.05);
}

/* ========== 响应式设计 ========== */
@media screen and (max-width: 1400px) {
  .content-left {
    flex: 0 0 70%;
    max-width: 70%;
  }

  .content-right {
    flex: 0 0 30%;
    max-width: 30%;
  }

  .problem-content {
    padding: 20px 5%;
  }
}

@media screen and (max-width: 1200px) {
  .section-title {
    font-size: 24px;
  }

  .problem-content {
    padding: 20px 16px;
  }
}

@media screen and (max-width: 768px) {
  .problem-content {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .content-right {
    position: static;
  }

  .tag-search-input {
    width: 120px;
  }

  .section-title {
    font-size: 22px;
  }

  .search-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* 修改表格行的鼠标样式，使其不覆盖子元素 */
:deep(.el-table__row) {
  cursor: default;
  /* 改为默认，不要使整行都显示为指针 */
}

/* 确保标签的鼠标样式正确 */
.problem-tag.clickable-tag {
  cursor: pointer;
  /* 已有此样式，确保它生效 */
  transition: all 0.2s ease;
}
</style>