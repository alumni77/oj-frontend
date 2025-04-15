<template>
  <div class="page-container">
    <div class="training-content">
      <h2 class="page-title">编程训练</h2>

      <!-- 搜索和筛选区域 -->
      <el-card class="filter-card" shadow="hover">
        <div class="search-section">
          <div class="search-box">
            <el-input v-model="searchKeyword" placeholder="搜索训练课程" clearable @keyup.enter="handleSearch">
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

        <div class="filter-section">
          <div class="filter-label">训练分类:</div>
          <div class="filter-buttons">
            <el-button :key="'all'" :class="{ 'active-filter': selectedCategory === null }"
              @click="filterByCategory(null)" class="category-btn" plain>
              全部
            </el-button>
            <el-button v-for="category in categoryList" :key="category.id"
              :class="{ 'active-filter': selectedCategory === category.id }" @click="filterByCategory(category.id)"
              class="category-btn" plain :style="{
                color: selectedCategory === category.id ? '#ffffff' : category.color,
                backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                borderColor: category.color
              }">
              {{ category.name }}
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 训练列表表格 -->
      <el-card class="training-table-card" shadow="hover">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <el-table v-else :data="trainingList" style="width: 100%">
          <el-table-column prop="rank" label="编号" width="100" align="center">
            <template #default="{ row }">
              <span class="rank-number">{{ row.rank }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="title" label="标题" width="250">
            <template #default="{ row }">
              <router-link :to="`/training/${row.id}`" class="training-link">
                {{ row.title }}
              </router-link>
            </template>
          </el-table-column>

          <el-table-column label="分类" width="250">
            <template #default="{ row }">
              <el-tag :style="{ color: '#ffffff', backgroundColor: row.categoryColor }" effect="plain">
                {{ row.categoryName }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="进度" width="250" align="center">
            <template #default="{ row }">
              <div class="progress-container">
                <el-progress :percentage="calculateProgress(row)" :stroke-width="15" :format="percentageFormat"
                  :color="getProgressColor(calculateProgress(row))"></el-progress>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="题目数" width="250" align="center">
            <template #default="{ row }">
              <span>{{ row.problemCount }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="author" label="作者" width="150" align="center" />

          <el-table-column label="最近更新" width="250" align="center">
            <template #default="{ row }">
              {{ formatDate(row.gmtModified) }}
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getTrainingCategory, getTrainingList } from '@/api/training'

// 训练类别和列表数据
const categoryList = ref([])
const trainingList = ref([])
const loading = ref(false)
const selectedCategory = ref(null)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 搜索关键字
const searchKeyword = ref('')

// 加载训练分类
const fetchTrainingCategory = async () => {
  try {
    const response = await getTrainingCategory()
    if (response.data && response.data.code === 200) {
      categoryList.value = response.data.data || []
    } else {
      ElMessage.error('获取训练分类失败')
    }
  } catch (error) {
    console.error('获取训练分类失败:', error)
    ElMessage.error('请求训练分类数据出错')
  }
}

// 加载训练列表
const fetchTrainingList = async () => {
  loading.value = true
  try {
    const params = {
      currentPage: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value || undefined,
      categoryId: selectedCategory.value || undefined,
      auth: 'Public' // 默认使用 Public 权限
    }

    const response = await getTrainingList(params)
    if (response.data && response.data.code === 200) {
      trainingList.value = response.data.data.records || []
      total.value = response.data.data.total || 0
    } else {
      ElMessage.error('获取训练列表失败')
    }
  } catch (error) {
    console.error('获取训练列表失败:', error)
    ElMessage.error('请求训练列表数据出错')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr) => {
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

// 按分类筛选
const filterByCategory = (categoryId) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
  fetchTrainingList()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTrainingList()
}

// 刷新数据
const refreshData = () => {
  searchKeyword.value = ''
  selectedCategory.value = null
  currentPage.value = 1
  fetchTrainingList()
}

// 计算进度百分比
const calculateProgress = (row) => {
  if (!row.problemCount || row.problemCount === 0) return 0
  return Math.round((row.acCount / row.problemCount) * 100)
}

// 格式化进度显示
const percentageFormat = (percentage) => {
  return percentage === 100 ? '已完成' : `${percentage}%`
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 30) return '#909399'
  if (percentage < 70) return '#E6A23C'
  if (percentage < 100) return '#67C23A'
  return '#67C23A'
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTrainingList()
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchTrainingList()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchTrainingCategory()
  fetchTrainingList()
})
</script>

<style scoped>
/* 页面容器样式 */
.page-container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

.training-content {
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

/* 筛选卡片样式 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
}

.filter-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box .el-input {
  max-width: 300px;
}

/* 筛选按钮区域 */
.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-label {
  font-weight: 600;
  color: #606266;
  margin-right: 8px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  border-radius: 20px;
  transition: all 0.3s;
}

.active-filter {
  font-weight: 600;
}

/* 训练表格卡片 */
.training-table-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
}

.training-table-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 训练链接样式 */
.training-link {
  color: #409EFF;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.training-link:hover {
  color: #337ecc;
  text-decoration: underline;
}

/* 编号样式 */
.rank-number {
  font-weight: 600;
  color: #606266;
}

/* 进度条容器 */
.progress-container {
  padding: 0 5px;
}

/* 分页容器 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Element Plus 样式覆盖 */
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

:deep(.el-pagination) {
  justify-content: flex-end;
}

/* 加载状态容器 */
.loading-container {
  padding: 40px 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .search-box {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box .el-input {
    max-width: 100%;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 22px;
  }
}
</style>