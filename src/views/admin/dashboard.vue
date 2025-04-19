<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <User />
            </el-icon>
            <span>用户总数</span>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-value">{{ stats.userCount || 14 }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <Collection />
            </el-icon>
            <span>题目总数</span>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-value">{{ stats.problemCount || 156 }}</div>
          <div class="stat-label">总题目数</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <Monitor />
            </el-icon>
            <span>今日提交</span>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-value">{{ stats.todaySubmissions || 0 }}</div>
          <div class="stat-label">今日已提交数</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <TrophyBase />
            </el-icon>
            <span>系统状态</span>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-value status">
            <el-tag type="success" effect="dark">运行中</el-tag>
          </div>
          <div class="stat-label">最近系统活动</div>
        </div>
      </el-card>
    </div>

    <!-- 系统状态区域 -->
    <el-card class="system-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon">
              <Monitor />
            </el-icon>
            <span>后端系统</span>
          </div>
          <el-button type="primary" size="small" :icon="Refresh" circle @click="refreshBackendService"
            :loading="backendLoading"></el-button>
        </div>
      </template>

      <div class="system-info">
        <div class="info-item">
          <span class="info-label">服务器数量:</span>
          <el-tag size="small" type="info">{{ backendServices.length }}</el-tag>
        </div>

        <div class="info-item">
          <span class="info-label">Nacos 状态:</span>
          <el-tag size="small" :type="systemStatus.nacos === 'UP' ? 'success' : 'danger'">
            {{ systemStatus.nacos }}
          </el-tag>
        </div>

        <div class="info-item">
          <span class="info-label">HTTPS 状态:</span>
          <el-tag size="small" type="danger">
            {{ systemStatus.https }}
          </el-tag>
        </div>
      </div>

      <el-table :data="backendServices" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="host" label="主机" width="180" />
        <el-table-column prop="port" label="端口" width="100" />
        <el-table-column prop="cpuCores" label="CPU核心数" width="120" />
        <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
          <template #default="scope">
            <div class="usage-bar">
              <el-progress :percentage="scope.row.cpuUsage" :color="getProgressColor(scope.row.cpuUsage)"
                :stroke-width="16" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="memoryUsage" label="内存使用率" width="120">
          <template #default="scope">
            <div class="usage-bar">
              <el-progress :percentage="scope.row.memoryUsage" :color="getProgressColor(scope.row.memoryUsage)"
                :stroke-width="16" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" plain @click="handleServiceAction(scope.row)">
              管理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 判题系统 -->
    <el-card class="system-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon">
              <Connection />
            </el-icon>
            <span>判题系统</span>
          </div>
          <el-button type="primary" size="small" :icon="Refresh" circle @click="refreshJudgeService"
            :loading="judgeLoading"></el-button>
        </div>
      </template>

      <div class="system-info">
        <div class="info-item">
          <span class="info-label">服务器数量:</span>
          <el-tag size="small" type="info">{{ judgeServices.length }}</el-tag>
        </div>
      </div>

      <el-table :data="judgeServices" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="#" width="60" />
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="host" label="主机" width="180" />
        <el-table-column prop="port" label="端口" width="100" />
        <el-table-column prop="cpuCores" label="CPU核心数" width="120" />
        <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
          <template #default="scope">
            <div class="usage-bar">
              <el-progress :percentage="scope.row.cpuUsage" :color="getProgressColor(scope.row.cpuUsage)"
                :stroke-width="16" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="memoryUsage" label="内存使用率" width="120">
          <template #default="scope">
            <div class="usage-bar">
              <el-progress :percentage="scope.row.memoryUsage" :color="getProgressColor(scope.row.memoryUsage)"
                :stroke-width="16" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" plain @click="handleServiceAction(scope.row)">
              管理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  User,
  Collection,
  Monitor,
  TrophyBase,
  Connection,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDashboardInfo, getJudgeServiceInfo, getServiceInfo } from '@/api/admin'

// 统计数据
const stats = ref({
  userCount: 0,
  problemCount: 156,
  todaySubmissions: 0,
  systemStatus: 'normal'
})

// 后端服务数据
const backendServices = ref<any[]>([])
const backendLoading = ref(false)

// 判题服务数据
const judgeServices = ref<any[]>([])
const judgeLoading = ref(false)

// 系统状态数据
const systemStatus = ref({
  nacos: 'DOWN',
  https: 'Disabled'
})

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) {
    return '#67C23A'
  } else if (percentage < 80) {
    return '#E6A23C'
  } else {
    return '#F56C6C'
  }
}

// 处理服务操作
const handleServiceAction = (service: any) => {
  ElMessage.info(`正在管理服务: ${service.name}`)
}

// 生命周期钩子
onMounted(() => {
  fetchDashboardData()
  fetchJudgeServiceData()
  fetchBackendServiceData()
})

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 从API获取数据
    const response = await getDashboardInfo()
    if (response.data && response.data.code === 200) {
      // 更新统计数据，将后端返回的数据映射到前端显示
      stats.value = {
        userCount: response.data.data.userNum || 0,
        problemCount: stats.value.problemCount, // 保持原有的题目数
        todaySubmissions: response.data.data.todayJudgeNum || 0,
        systemStatus: stats.value.systemStatus // 保持原有的系统状态
      }
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    ElMessage.error('获取仪表盘数据失败')
  }
}

// 获取判题系统数据
const fetchJudgeServiceData = async () => {
  judgeLoading.value = true
  try {
    const response = await getJudgeServiceInfo()
    if (response.data && response.data.code === 200) {
      const judgeData = response.data.data

      // 解析判题服务数据
      judgeServices.value = judgeData.map((item: any, index: number) => {
        // 提取CPU和内存使用率的数字部分
        const cpuUsage = parseFloat(item.percentCpuLoad.replace('%', ''))
        const memoryUsage = parseFloat(item.percentMemoryLoad.replace('%', ''))

        return {
          id: index + 1,
          name: item.service.serviceId,
          host: item.service.host,
          port: item.service.port,
          cpuCores: item.cpuCores,
          cpuUsage: cpuUsage,
          memoryUsage: memoryUsage,
          status: true // 假设服务正常运行
        }
      })
      ElMessage.success('判题系统数据刷新成功')
    }
  } catch (error) {
    console.error('获取判题服务数据失败:', error)
    ElMessage.error('获取判题服务数据失败')
  } finally {
    judgeLoading.value = false
  }
}

// 获取后端系统数据
const fetchBackendServiceData = async () => {
  backendLoading.value = true
  try {
    const response = await getServiceInfo()
    if (response.data && response.data.code === 200) {
      const backendData = response.data.data

      // 更新系统状态
      systemStatus.value = {
        nacos: backendData.nacos.status,
        https: 'Disabled' // 假设HTTPS状态为禁用
      }

      // 解析后端服务数据
      backendServices.value = backendData.backupService.map((service: any) => {
        // 提取CPU和内存使用率的数字部分
        const cpuUsage = parseFloat(backendData.backupPercentCpuLoad.replace('%', ''))
        const memoryUsage = parseFloat(backendData.backupPercentMemoryLoad.replace('%', ''))

        return {
          name: service.serviceId,
          host: service.host,
          port: service.port,
          cpuCores: backendData.backupCores,
          cpuUsage: cpuUsage,
          memoryUsage: memoryUsage,
          status: true // 假设服务正常运行
        }
      })
      ElMessage.success('后端系统数据刷新成功')
    }
  } catch (error) {
    console.error('获取后端服务数据失败:', error)
    ElMessage.error('获取后端服务数据失败')
  } finally {
    backendLoading.value = false
  }
}

// 刷新后端系统数据
const refreshBackendService = () => {
  fetchBackendServiceData()
}

// 刷新判题系统数据
const refreshJudgeService = () => {
  fetchJudgeServiceData()
}

</script>

<style scoped>
/* 仪表盘容器 */
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计卡片区域 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #303133;
}

.header-icon {
  font-size: 20px;
  color: #409EFF;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-value.status {
  margin-top: 5px;
}

.stat-label {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}

/* 系统状态卡片 */
.system-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.system-info {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #606266;
}

/* 表格美化 */
:deep(.el-table) {
  --el-table-border-color: rgba(0, 0, 0, 0.05);
  --el-table-header-bg-color: #f5f7fa;
  border-radius: 8px;
}

:deep(.el-table th) {
  font-weight: 600;
  background-color: #f5f7fa;
}

:deep(.el-table tr) {
  transition: background-color 0.3s;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(64, 158, 255, 0.03);
}

:deep(.el-table__row:hover td) {
  background-color: rgba(64, 158, 255, 0.08) !important;
}

/* 进度条 */
.usage-bar {
  width: 100%;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style>