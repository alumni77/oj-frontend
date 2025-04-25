<template>
  <div class="problem-container">
    <!-- 左侧题目描述/提交记录 -->
    <div class="problem-description">
      <el-card class="description-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon>
                <Document />
              </el-icon>
              <span>{{ activeLeftTab === 'description' ? '题目详情' : '我的提交' }}</span>
            </div>
            <!-- 左侧标签切换 -->
            <div class="header-right">
              <el-radio-group v-model="activeLeftTab" size="small">
                <el-radio-button label="description">题目详情</el-radio-button>
                <el-radio-button label="submissions">我的提交</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>

        <!-- 题目详情内容 -->
        <div v-if="activeLeftTab === 'description'" class="description-content-wrapper">
          <!-- 题目标题 -->
          <h2 class="problem-title">{{ problem.title }}</h2>

          <!-- 题目操作按钮 -->
          <div class="problem-actions">
            <!-- 标签显示 -->
            <el-tooltip effect="light" :content="problem.tags && problem.tags.length > 0 ? '' : '暂无标签'"
              :visible="showTagTooltip" placement="right" popper-class="tag-tooltip" :hide-after="0">
              <el-button size="small" plain @mouseenter="showTagTooltip = true" @mouseleave="showTagTooltip = false">
                显示标签 <el-icon class="el-icon--right">
                  <ArrowDown />
                </el-icon>
              </el-button>

              <!-- 标签内容 -->
              <template #content v-if="problem.tags && problem.tags.length > 0">
                <div class="tag-list">
                  <el-tag v-for="tag in problem.tags" :key="tag" size="small" class="problem-tag" style="margin: 4px">
                    {{ tag }}
                  </el-tag>
                </div>
              </template>
            </el-tooltip>

            <!-- 操作按钮组 -->
            <div class="action-buttons">
              <el-button size="small" plain @click="showStatistics = true">
                <el-icon>
                  <DataAnalysis />
                </el-icon> 题目统计
              </el-button>
              <el-button size="small" plain @click="goToJudgePage">
                <el-icon>
                  <SwitchButton />
                </el-icon> 全部提交
              </el-button>
            </div>
          </div>

          <!-- 题目统计弹窗 -->
          <el-dialog v-model="showStatistics" title="提交统计" width="500px" align-center destroy-on-close :modal="true"
            :append-to-body="true" :close-on-click-modal="true" center>
            <div class="statistics-container">
              <!-- 图例 -->
              <div class="chart-legend">
                <span v-for="status in ['AC', 'RE', 'CE', 'WA']" :key="status" class="legend-item">
                  <span class="legend-color" :style="{ backgroundColor: statusColorMap[status] }"></span>
                  {{ status }}
                </span>
              </div>
              <!-- 统计图表 -->
              <div class="statistics-chart">
                <v-chart class="chart" :option="chartOption" autoresize />
              </div>
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="showStatistics = false">关闭</el-button>
              </span>
            </template>
          </el-dialog>

          <!-- 题目基本信息 -->
          <div class="problem-info">
            <div class="info-item">
              <span class="info-label">时间限制：</span>
              <span class="info-value">C/C++ {{ problem.timeLimit }}MS，其他语言 {{ problem.timeLimit * 2 }}MS</span>
            </div>
            <div class="info-item">
              <span class="info-label">内存限制：</span>
              <span class="info-value">C/C++ {{ problem.memoryLimit }}MB，其他语言 {{ problem.memoryLimit * 2 }}MB</span>
            </div>
            <div class="info-item">
              <span class="info-label">难度：</span>
              <el-tag size="small" :type="getDifficultyType(problem.difficulty)" effect="plain">
                {{ problem.difficultyText }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">分数：</span>
              <span class="info-value">{{ problem.ioScore || 100 }} OI排行榜分数: {{ calculateRankScore() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">出题人：</span>
              <span class="info-value">{{ problem.author || 'root' }}</span>
            </div>
          </div>

          <!-- 题目内容区域 -->
          <div class="problem-content">
            <!-- 题目描述 -->
            <section class="content-section">
              <h3 class="section-title">描述</h3>
              <div class="section-content" v-html="descriptionHTML"></div>
            </section>

            <!-- 输入描述 -->
            <section class="content-section">
              <h3 class="section-title">输入描述</h3>
              <div class="section-content" v-html="inputDescHTML"></div>
            </section>

            <!-- 输出描述 -->
            <section class="content-section">
              <h3 class="section-title">输出描述</h3>
              <div class="section-content" v-html="outputDescHTML"></div>
            </section>

            <!-- 第一个样例 -->
            <section class="content-section" v-if="problem.parsedExamples && problem.parsedExamples.length > 0">
              <h3 class="section-title">
                用例输入 1
                <el-tag size="small" type="info" class="sample-copy"
                  @click="copyToInput(problem.parsedExamples[0].input)">复制</el-tag>
              </h3>
              <div class="sample-content">
                <pre>{{ problem.parsedExamples[0].input }}</pre>
              </div>
            </section>

            <section class="content-section" v-if="problem.parsedExamples && problem.parsedExamples.length > 0">
              <h3 class="section-title">
                用例输出 1
                <el-tag size="small" type="info" class="sample-copy"
                  @click="copyOutput(problem.parsedExamples[0].output)">复制</el-tag>
              </h3>
              <div class="sample-content">
                <pre>{{ problem.parsedExamples[0].output }}</pre>
              </div>
            </section>

            <!-- 其他样例(如果有多个) -->
            <template v-for="(sample, index) in (problem.parsedExamples ? problem.parsedExamples.slice(1) : [])"
              :key="index">
              <section class="content-section">
                <h3 class="section-title">
                  用例输入 {{ index + 2 }}
                  <el-tag size="small" type="info" class="sample-copy" @click="copyToInput(sample.input)">复制</el-tag>
                </h3>
                <div class="sample-content">
                  <pre>{{ sample.input }}</pre>
                </div>
              </section>

              <section class="content-section">
                <h3 class="section-title">
                  用例输出 {{ index + 2 }}
                  <el-tag size="small" type="info" class="sample-copy" @click="copyOutput(sample.output)">复制</el-tag>
                </h3>
                <div class="sample-content">
                  <pre>{{ sample.output }}</pre>
                </div>
              </section>
            </template>

            <!-- 提示信息 -->
            <section class="content-section" v-if="problem.hint">
              <h3 class="section-title">提示</h3>
              <div class="section-content" v-html="hintHTML"></div>
            </section>

            <!-- 来源 -->
            <section class="content-section" v-if="problem.source">
              <h3 class="section-title">来源</h3>
              <div class="section-content">{{ problem.source || 'CodesOnline' }}</div>
            </section>
          </div>
        </div>

        <!-- 我的提交内容 -->
        <div v-else-if="activeLeftTab === 'submissions'" class="submissions-content-wrapper">
          <!-- 提交列表表格 -->
          <el-table :data="mySubmissionsList" v-loading="loadingSubmissions" style="width: 100%"
            class="submission-table">
            <el-table-column prop="submitId" label="提交ID" width="100" />
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getSubmissionStatusType(scope.row.status)"
                  :effect="scope.row.status === 0 ? 'light' : 'plain'">
                  {{ getSubmissionStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="language" label="语言" width="100" />
            <el-table-column label="提交时间" width="180">
              <template #default="scope">
                {{ formatSubmissionTime(scope.row.submitTime) }}
              </template>
            </el-table-column>
            <el-table-column label="耗时" width="100">
              <template #default="scope">
                {{ scope.row.time }}ms
              </template>
            </el-table-column>
            <el-table-column label="内存" width="100">
              <template #default="scope">
                {{ scope.row.memory }}KB
              </template>
            </el-table-column>
            <el-table-column label="分数" width="80">
              <template #default="scope">
                <span v-if="scope.row.score !== null">{{ scope.row.score }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="text" size="small" @click="viewSubmissionDetail(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 -->
          <div class="pagination-container">
            <el-pagination :current-page="submissionPage.current" :page-size="submissionPage.size"
              :total="submissionPage.total" layout="prev, pager, next, jumper"
              @current-change="handleSubmissionPageChange" />
          </div>

          <!-- 提交详情对话框 -->
          <el-dialog v-model="showSubmissionDetail" title="提交详情" width="80%" destroy-on-close>
            <div v-if="currentSubmission" class="submission-detail">
              <div class="submission-info">
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">提交ID：</span>
                    <span>{{ currentSubmission.submitId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">状态：</span>
                    <el-tag :type="getSubmissionStatusType(currentSubmission.status)"
                      :effect="currentSubmission.status === 0 ? 'light' : 'plain'">
                      {{ getSubmissionStatusText(currentSubmission.status) }}
                    </el-tag>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">提交时间：</span>
                    <span>{{ formatSubmissionTime(currentSubmission.submitTime) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">语言：</span>
                    <span>{{ currentSubmission.language }}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">运行时间：</span>
                    <span>{{ currentSubmission.time }}ms</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">运行内存：</span>
                    <span>{{ currentSubmission.memory }}KB</span>
                  </div>
                </div>
              </div>
              <div class="submission-code">
                <h3>提交代码</h3>
                <!-- 这里使用代码高亮组件显示代码，如果有 source 字段的话 -->
                <pre class="code-block">{{ currentSubmission.source || '代码内容不可见' }}</pre>
              </div>
            </div>
          </el-dialog>
        </div>
      </el-card>
    </div>

    <!-- 右侧代码编辑器 -->
    <div class="code-editor">
      <el-card class="editor-card">
        <!-- 编辑器顶部工具栏 -->
        <template #header>
          <div class="card-header">
            <div class="editor-tools">
              <el-select v-model="language" placeholder="选择语言" size="small">
                <el-option v-for="lang in languages" :key="lang.value" :label="lang.label" :value="lang.value" />
              </el-select>
              <el-button-group>
                <el-button size="small" @click="resetCode">
                  <el-icon>
                    <RefreshLeft />
                  </el-icon> 重置
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <!-- 代码编辑区域 -->
        <div class="editor-main">
          <div ref="editorContainer" class="monaco-editor-container"></div>
        </div>

        <!-- 编辑器底部按钮区域 -->
        <div class="editor-bottom-actions">
          <el-button size="large" type="success" @click="toggleOnlineTest">
            <el-icon>
              <Check />
            </el-icon> 在线自测
          </el-button>
          <el-button size="large" type="primary" :loading="submitting" @click="submitCode">
            <el-icon>
              <Upload />
            </el-icon> 提交评测
          </el-button>
        </div>
        <!-- 问题解决状态提示 -->
        <div v-if="problemSolved && !judgeStatus.show" class="problem-solved-status">
          <el-alert title="你已经解决了该问题" type="success" :closable="false" show-icon />
        </div>

        <!-- 评测状态显示 -->
        <div v-if="judgeStatus.show" class="judge-status">
          <el-alert :title="judgeStatus.message" :type="judgeStatus.type" :closable="false" show-icon>
            <template #default v-if="judgeStatus.details">
              <div class="judge-details">
                <span>耗时: {{ judgeStatus.details.time }}ms</span>
                <span>内存: {{ judgeStatus.details.memory }}KB</span>
              </div>
            </template>
          </el-alert>
        </div>

        <!-- 在线测试面板 -->
        <div v-if="showTestPanel" class="online-test-panel">
          <el-tabs v-model="testTab" class="test-tabs">
            <!-- 测试用例标签页 -->
            <el-tab-pane label="测试用例" name="testCase">
              <div class="test-io-section">
                <div class="io-label">自测输入</div>
                <el-input v-model="testInput" type="textarea" :rows="3" placeholder="输入测试数据..." />
                <div class="test-actions">
                  <el-button size="small" type="success" @click="runOnlineTest">
                    <el-icon>
                      <VideoPlay />
                    </el-icon> 运行自测
                  </el-button>
                  <el-button size="small" text @click="loadSampleInput">
                    加载示例输入
                  </el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 运行结果标签页 -->
            <el-tab-pane label="运行结果" name="testResult">
              <!-- 等待输入状态 -->
              <div v-if="testStatus === 'waiting'" class="test-waiting">
                <el-icon>
                  <Loading />
                </el-icon>
                <span>输入测试用例后，点击运行自测，这里将会显示运行结果</span>
              </div>

              <!-- 测试中状态 -->
              <div v-else-if="testStatus === 'testing'" class="test-loading">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>正在测评中...</span>
              </div>

              <!-- 测试成功状态 -->
              <div v-else-if="testStatus === 'success'" class="test-result success">
                <div class="test-result-header">
                  <div class="test-status">
                    <el-icon>
                      <CircleCheckFilled />
                    </el-icon>
                    <span>Success</span>
                  </div>
                  <div class="test-info">
                    <span class="test-time">
                      <el-icon>
                        <Timer />
                      </el-icon> 运行时间 {{ testResult.time }}ms
                    </span>
                    <span class="test-memory">
                      <el-icon>
                        <Files />
                      </el-icon> 运行内存 {{ testResult.memory }}KB
                    </span>
                  </div>
                </div>

                <div class="test-io-section">
                  <div class="io-label">自测输入</div>
                  <el-input v-model="testInput" type="textarea" :rows="3" readonly />
                </div>

                <div class="test-io-section">
                  <div class="io-label">实际输出</div>
                  <el-input v-model="testResult.userOutput" type="textarea" :rows="3" readonly />
                </div>
              </div>

              <!-- 测试失败状态 -->
              <div v-else-if="testStatus === 'error'" class="test-result error">
                <div class="test-result-header">
                  <div class="test-status error">
                    <el-icon>
                      <CircleCloseFilled />
                    </el-icon>
                    <span>Error</span>
                  </div>
                  <div class="test-info">
                    <span class="test-time">
                      <el-icon>
                        <Timer />
                      </el-icon> 运行时间 {{ testResult.time }}ms
                    </span>
                    <span class="test-memory">
                      <el-icon>
                        <Files />
                      </el-icon> 运行内存 {{ testResult.memory }}KB
                    </span>
                  </div>
                </div>

                <div class="test-io-section">
                  <div class="io-label">自测输入</div>
                  <el-input v-model="testInput" type="textarea" :rows="3" readonly />
                </div>

                <div class="test-io-section">
                  <div class="io-label">错误信息</div>
                  <el-input v-model="testResult.output" type="textarea" :rows="3" readonly />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, reactive } from 'vue'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check, Upload, Loading, Timer, Files, CircleCheckFilled,
  VideoPlay, Document, ArrowDown, Position, DataAnalysis,
  SwitchButton, RefreshLeft, CircleCloseFilled
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { getProblemInfo, getTestJudgeResult, submitProblemTestJudge, getSubmission, submitProblemJudge, getUserProblemStatus } from '@/api/problem'
import { ProblemCountVO, ProblemEntity, SubmitJudgeDTO, TestJudgeDTO } from '@/api/problem/type'
import { getJudgeList } from '@/api/judge'
// 导入图表组件和相关功能
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import type { EChartsOption } from 'echarts/types/dist/shared'
const activeLeftTab = ref('description') // 'description' 或 'submissions'

const router = useRouter()
// 添加跳转方法
const goToJudgePage = () => {
  router.push({ name: 'judge' })
}

// ===== 问题解决状态 =====
const problemSolved = ref(false)
const judgeStatus = reactive({
  show: false,
  type: 'info',
  message: '评测中...',
  details: null as { time: number, memory: number } | null
})

// ===== 提交详情查看 =====
const showSubmissionDetail = ref(false)
const currentSubmission = ref<any>(null)

// 检查问题是否已解决
const checkProblemStatus = async () => {
  try {
    // 调用 API 获取用户题目状态
    const response = await getUserProblemStatus({
      pidList: [problem.value.id]
    })

    console.log('用户题目状态接口返回:', response.data)

    if (response.data && response.data.code === 200) {
      const statusMap = response.data.data || {}
      const problemId = String(problem.value.id)

      // 支持两种可能的数据结构
      if (typeof statusMap[problemId] === 'object') {
        problemSolved.value = statusMap[problemId]?.status === 0
      } else {
        problemSolved.value = statusMap[problemId] === 0
      }

      console.log(`题目${problemId}已解决状态:`, problemSolved.value)
    }
  } catch (error) {
    console.error('检查题目解决状态失败:', error)
  }
}
// 在提交评测后更新状态
const updateJudgeStatus = (submissionData: any) => {
  // 确保状态栏显示
  judgeStatus.show = true

  // 设置状态样式和消息
  judgeStatus.type = getSubmissionStatusType(submissionData.status)
  judgeStatus.message = `${getSubmissionStatusText(submissionData.status)}${submissionData.errorMessage ? ': ' + submissionData.errorMessage : ''}`

  // 更新详情信息
  if (typeof submissionData.time === 'number' && typeof submissionData.memory === 'number') {
    judgeStatus.details = {
      time: submissionData.time,
      memory: submissionData.memory
    }
  } else {
    judgeStatus.details = null
  }

  // 如果评测通过，也更新问题解决状态
  if (submissionData.status === 0) {
    problemSolved.value = true
    // 保持评测状态显示，不设置自动隐藏
  }
}

// 监听标签页切换，加载对应数据
watch(activeLeftTab, async (newTab) => {
  if (newTab === 'submissions') {
    await fetchMySubmissions()
  }
})

// ===== 我的提交相关 =====
const showMySubmissions = ref(false)
const mySubmissionsList = ref<any[]>([])
const loadingSubmissions = ref(false)
const submissionPage = ref({
  current: 1,
  size: 10,
  total: 0
})

// 获取我的提交列表
const fetchMySubmissions = async (page: number = 1) => {
  loadingSubmissions.value = true

  try {
    // 准备请求参数
    const params = {
      onlyMine: true,
      currentPage: page,
      problemID: problem.value.problemId,
      contestID: 0,
      completeProblemID: true,
      limit: submissionPage.value.size
    }

    // 调用API获取提交记录
    const response = await getJudgeList(params)
    console.log('获取提交记录:', response);

    if (response.data && response.data.code === 200) {
      const data = response.data.data

      mySubmissionsList.value = data.records || []
      submissionPage.value = {
        current: data.current,
        size: data.size,
        total: data.total
      }
    } else {
      ElMessage.error(response.data?.msg || '获取提交记录失败')
    }
  } catch (error) {
    console.error('获取提交记录失败:', error)
    ElMessage.error('获取提交记录失败，请检查网络连接')
  } finally {
    loadingSubmissions.value = false
  }
}

// 页码变更处理
const handleSubmissionPageChange = (page: number) => {
  fetchMySubmissions(page)
}

// 获取提交状态文本
const getSubmissionStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'AC', // 通过
    1: 'TLE', // 超时
    2: 'MLE', // 内存超限
    3: 'RE', // 运行错误
    4: 'CE', // 编译错误
    5: 'Pending', // 等待评测
    6: 'Judging', // 评测中
    7: 'WA', // 答案错误
    8: 'SE', // 系统错误
    9: 'PE', // 格式错误
    10: 'PA', // 部分通过
    '-1': 'Pending', // 特殊状态：等待评测
    '-2': 'Compiling' // 特殊状态：编译中
  }

  return statusMap[status] || '未知状态'
}

// 获取提交状态类型（用于标签颜色）
const getSubmissionStatusType = (status: number): string => {
  const typeMap: Record<number, string> = {
    0: 'success',   // AC - 成功
    1: 'warning',   // TLE - 警告
    2: 'info',      // MLE - 信息
    3: 'danger',    // RE - 危险
    4: 'info',      // CE - 信息
    5: 'info',      // Pending - 信息
    6: 'info',      // Judging - 信息 
    7: 'danger',    // WA - 危险
    8: 'danger',    // SE - 危险
    9: 'warning',   // PE - 警告
    10: 'success',  // PA - 成功
    '-1': 'info',   // 特殊状态：等待评测
    '-2': 'info'    // 特殊状态：编译中
  }

  return typeMap[status] || 'info'
}

// 格式化提交时间
const formatSubmissionTime = (dateString: string): string => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (error) {
    return dateString
  }
}

// 查看提交详情
const viewSubmissionDetail = (submission: any) => {
  currentSubmission.value = submission
  showSubmissionDetail.value = true
}

// 监听对话框打开
watch(showMySubmissions, (newVal) => {
  if (newVal) {
    // 当对话框打开时，加载数据
    fetchMySubmissions()
  }
})

// ===== 初始化 ECharts =====
use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

// ===== 路由与基本数据初始化 =====
const route = useRoute()
const pid = ref(route.params.pid)
const problemId = ref(route.params.pid || '')
const title = ref(route.query.title || '')

// ===== 问题状态和数据 =====
const problem = ref<ProblemEntity & { problemCount?: ProblemCountVO }>({
  id: Number(pid.value),
  problemId: String(route.params.pid),
  title: title.value?.toString() || 'A+B 问题',
  author: 'root',
  type: 0, // ACM模式
  judgeMode: 'default',
  judgeCaseMode: 'default',
  difficulty: 3,
  difficultyText: '基础',
  timeLimit: 1000,
  memoryLimit: 128,
  stackLimit: 128,
  description: '输入两个整数a,b，输出它们的和。',
  input: '两个以空格分分隔的整数。',
  output: '一个整数。',
  examples: '',
  hint: '注意处理负数的情况。',
  source: 'CodesOnline',
  isRemote: false,
  auth: 1,
  ioScore: 100,
  codeShare: true,
  spjCode: null,
  spjLanguage: null,
  userExtraFile: null,
  judgeExtraFile: null,
  isRemoveEndBlank: false,
  openCaseResult: true,
  isUploadCase: false,
  caseVersion: '1',
  modifiedUser: 'admin',
  applyPublicProgress: null,
  isFileIO: false,
  ioReadFileName: null,
  ioWriteFileName: null,
  gmtCreate: new Date().toISOString(),
  gmtModified: new Date().toISOString(),

  // 前端扩展属性
  parsedExamples: [
    { input: '20 30', output: '50' },
    { input: '-10 5', output: '-5' }
  ],
  tags: ['模拟', '数学', '入门']
})

// ===== UI 状态控制 =====
const isAC = ref(true)
const loading = ref(true)
const showTagTooltip = ref(false)
const showStatistics = ref(false)

// ===== 编辑器相关 =====
// Monaco 编辑器
const editorContainer = ref<HTMLElement | null>(null)
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 编辑器状态
const language = ref('cpp')
const code = ref('')
const languages = ref<{ label: string, value: string }[]>([])

// 语言映射
const languageMap: Record<string, string> = {
  'cpp': 'cpp',
  'java': 'java',
  'python': 'python'
}

// 代码模板
const templates = ref<Record<string, string>>({})

// ===== 在线测试相关 =====
const showTestPanel = ref(false)
const testTab = ref('testCase')
const testStatus = ref('input') // 'input', 'waiting', 'testing', 'success', 'error'
const testInput = ref('')
const testResult = ref<any>(null)
const activeCollapse = ref(['testCase'])
const testing = ref(false)

// ===== 提交相关 =====
const submitting = ref(false)
const submissions = ref([
  {
    submitTime: '2025-04-13 10:30:45',
    status: 'AC',
    language: 'C++',
    time: 1,
    memory: 128
  },
  {
    submitTime: '2025-04-13 10:29:30',
    status: 'WA',
    language: 'C++',
    time: 1,
    memory: 128
  }
])

// ===== Markdown 处理 =====
// 初始化 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
      } catch (__) { }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
}).use(mk) // 使用 KaTeX 插件

// 渲染 Markdown 内容
const renderMarkdown = (content: string): string => {
  if (!content) return ''
  return md.render(content)
}

// Markdown 内容计算属性
const descriptionHTML = computed(() => renderMarkdown(problem.value.description || ''))
const inputDescHTML = computed(() => renderMarkdown(problem.value.input || ''))
const outputDescHTML = computed(() => renderMarkdown(problem.value.output || ''))
const hintHTML = computed(() => renderMarkdown(problem.value.hint || ''))

// ===== 状态颜色映射 =====
const statusColorMap = {
  'AC': '#1ac951', // 通过 - 绿色
  'WA': '#f56c6c', // 答案错误 - 红色
  'TLE': '#e6a23c', // 超时 - 黄色
  'MLE': '#909399', // 内存超限
  'RE': '#ff9900',  // 运行错误 - 橙色
  'CE': '#F9A700',  // 编译错误 - 金色
  'SE': '#97a8be',  // 系统错误
  'PE': '#b0bec5',  // 格式错误 
  'PA': '#67c23a'   // 部分通过
}

// ===== 工具方法 =====
// 获取难度标签类型
const getDifficultyType = (difficulty: string | number) => {
  const typeMap: Record<string, string> = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger',
    '1': 'info',    // 语法
    '2': 'info',    // 入门
    '3': 'success', // 基础
    '4': 'success', // 普及
    '5': 'warning', // 提高
    '6': 'warning', // 进阶
    '7': 'danger',  // 省选
    '8': 'danger',  // NOI
    '9': 'danger'   // 国集
  }
  return typeMap[String(difficulty)] || 'info'
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'AC': 'success',
    'WA': 'danger',
    'TLE': 'warning',
    'MLE': 'info',
    'RE': 'error',
    'CE': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取评测状态文本
const getStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'AC', // 通过
    1: 'TLE', // 超时
    2: 'MLE', // 内存超限
    3: 'RE', // 运行错误
    4: 'CE', // 编译错误
    5: 'Pending', // 等待评测
    6: 'Judging', // 评测中
    7: 'WA', // 答案错误
    8: 'SE', // 系统错误
    9: 'PE', // 格式错误
    10: 'PA', // 部分通过
  }

  return statusMap[status] || '未知状态'
}

// 获取难度的文本表示
const getDifficultyText = (difficulty: number): string => {
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
  };

  return difficultyMap[difficulty] || '未知';
}

// 解析题目样例字符串为结构化数据
const parseProblemExamples = (examples: string): { input: string, output: string }[] => {
  if (!examples) return [];

  try {
    // 尝试解析JSON格式
    return JSON.parse(examples);
  } catch (e) {
    // 如果不是JSON格式，尝试其他格式解析
    const samples = [];
    try {
      // 尝试处理不同格式
      if (examples.includes('|')) {
        // 假设格式为 "input1:output1|input2:output2"
        const samplePairs = examples.split('|');

        for (const pair of samplePairs) {
          const [input, output] = pair.split(':');
          if (input && output) {
            samples.push({ input: input.trim(), output: output.trim() });
          }
        }
      } else if (examples.includes('\n')) {
        // 假设格式为多行文本
        const lines = examples.split('\n');
        for (let i = 0; i < lines.length; i += 2) {
          if (i + 1 < lines.length) {
            samples.push({
              input: lines[i].trim(),
              output: lines[i + 1].trim()
            });
          }
        }
      }
    } catch (err) {
      console.error('解析样例失败:', err);
    }

    return samples.length > 0 ? samples : [{ input: '示例数据', output: '示例输出' }];
  }
}

// 计算排行榜分数
const calculateRankScore = (): string => {
  const baseScore = problem.value.score || 100;
  const difficulty = problem.value.difficulty || 3;
  const rankScore = Math.round((0.1 * baseScore + 2 * difficulty) * 10) / 10;

  return `${rankScore}(0.1*分数+2*难度)`;
}

// ===== 用户交互方法 =====
// 切换测试面板显示/隐藏
const toggleOnlineTest = () => {
  showTestPanel.value = !showTestPanel.value
}

// 复制输出样例
const copyOutput = (output: string) => {
  navigator.clipboard.writeText(output)
  ElMessage.success('已复制到剪贴板')
}

// 复制样例到输入
const copyToInput = (input: string) => {
  navigator.clipboard.writeText(input)
  ElMessage.success('已复制到输入框')
}

// 加载示例输入
const loadSampleInput = () => {
  if (problem.value.parsedExamples && problem.value.parsedExamples.length > 0) {
    testInput.value = problem.value.parsedExamples[0].input;
    ElMessage.success('已加载样例输入');
  } else {
    ElMessage.warning('没有可用的样例输入');
  }
}

// 重置代码
const resetCode = () => {
  const hasTemplate = templates.value && templates.value[language.value];

  let confirmMessage = hasTemplate
    ? '确定要重置代码到初始模板吗？'
    : '没有可用的代码模板，将清空编辑器内容。确定要继续吗？';

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (monacoEditor) {
      // 如果有模板，使用模板；否则清空编辑器
      const resetValue = hasTemplate ? templates.value[language.value] : '';
      monacoEditor.setValue(resetValue);
      code.value = resetValue;
    }
    ElMessage.success(hasTemplate ? '代码已重置为模板' : '编辑器内容已清空');
  }).catch(() => {
    // 用户取消操作
  });
}

// 获取编辑器内容
const getCode = () => {
  return monacoEditor?.getValue() || ''
}

// ===== 编辑器相关方法 =====
// 初始化编辑器
const initEditor = () => {
  if (editorContainer.value) {
    // 初始空字符串，稍后由API返回数据填充
    monacoEditor = monaco.editor.create(editorContainer.value, {
      value: '',
      language: 'plaintext', // 稍后更新为实际语言
      theme: 'vs', // 改为浅色主题
      automaticLayout: true,
      minimap: {
        enabled: true
      },
      fontSize: 14,
      fontFamily: "'Consolas', 'Courier New', monospace",
      scrollBeyondLastLine: false,
      tabSize: 4,
      renderWhitespace: 'selection',
      folding: true,
      lineNumbers: 'on',
      glyphMargin: true,
      lineDecorationsWidth: 5,
      renderLineHighlight: 'all',
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    })

    // 监听编辑器内容变化
    monacoEditor.onDidChangeModelContent(() => {
      code.value = monacoEditor?.getValue() || ''
    })
  }
}

// 更新编辑器语言
const updateEditorLanguage = (newLang: string) => {
  if (monacoEditor) {
    const model = monacoEditor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, languageMap[newLang])
    }
  }
}

// ===== API 调用方法 =====
// 获取题目详情
const fetchProblemDetail = async () => {
  loading.value = true
  try {
    const problemIdString = Array.isArray(problemId.value) ? problemId.value[0] : String(problemId.value);
    const response = await getProblemInfo(problemIdString)

    if (response.data && response.data.code === 200) {
      const data = response.data.data;

      // 处理题目基本信息
      if (data.problem) {
        // 尝试解析样例
        const parsedExamples = parseProblemExamples(data.problem.examples);

        // 更新题目基本信息
        problem.value = {
          ...problem.value,
          ...data.problem,
          title: data.problem.title || title.value,
          // 将数值难度转换为文本表示
          difficultyText: getDifficultyText(data.problem.difficulty),
          // 处理题目样例
          parsedExamples: parsedExamples,
          // 输入输出描述
          input: data.problem.input || '',
          output: data.problem.output || '',
          // 其他字段
          tags: data.tags?.map(tag => tag.name) || [],
          // 添加题目统计数据
          problemCount: data.problemCount || {
            total: 0,
            ac: 0,
            wa: 0,
            tle: 0,
            mle: 0,
            re: 0,
            ce: 0,
            se: 0,
            pe: 0,
            pa: 0
          }
        };

        // 如果有样例，设置第一个样例到测试输入
        if (parsedExamples.length > 0) {
          testInput.value = parsedExamples[0].input;
        }
      }

      // 更新支持的语言列表
      if (data.languages && data.languages.length > 0) {
        // 根据后端返回的语言列表更新前端语言选项
        const newLanguages = data.languages.map(lang => {
          const langKey = lang.toLowerCase().replace(/[^a-z0-9]/g, '');
          let value = '';

          // 映射语言名称到编辑器语言ID
          if (langKey.includes('c++') || langKey.includes('cpp')) {
            value = 'cpp';
          } else if (langKey.includes('java')) {
            value = 'java';
          } else if (langKey.includes('python')) {
            value = 'python';
          } else {
            // 默认使用原始值
            value = langKey;
          }

          return { label: lang, value };
        });

        languages.value = newLanguages;

        // 更新当前选择的语言为第一个支持的语言
        if (languages.value.length > 0) {
          language.value = languages.value[0].value;
        }
      }

      // 处理代码模板
      if (data.codeTemplate) {
        templates.value = processCodeTemplates(data.codeTemplate);

        // 更新当前编辑器内容
        if (monacoEditor && languages.value.length > 0) {
          const currentLang = language.value;
          const template = templates.value[currentLang];

          if (template) {
            monacoEditor.setValue(template);
          }
        }
      }

    } else {
      ElMessage.warning(response.data?.msg || '获取题目详情失败');
    }
  } catch (error) {
    console.error('加载题目详情失败:', error);
    ElMessage.error('加载题目详情失败');
  } finally {
    loading.value = false;
  }
}

// 处理后端返回的代码模板数据
const processCodeTemplates = (codeTemplate: any): Record<string, string> => {
  const newTemplates = {} as Record<string, string>;

  // 处理不同格式的模板
  if (typeof codeTemplate === 'object') {
    for (const [lang, template] of Object.entries(codeTemplate)) {
      if (typeof template === 'string') {
        const langKey = lang.toLowerCase().replace(/[^a-z0-9]/g, '');
        let mappedKey = '';

        // 映射语言名称到模板键
        if (langKey.includes('c++') || langKey.includes('cpp')) {
          mappedKey = 'cpp';
        } else if (langKey.includes('java')) {
          mappedKey = 'java';
        } else if (langKey.includes('python')) {
          mappedKey = 'python';
        } else {
          // 默认使用原始值
          mappedKey = langKey;
        }

        // 更新对应语言的模板
        newTemplates[mappedKey] = template;
      }
    }
  }

  return newTemplates;
};

// 运行在线测试
const runOnlineTest = async () => {
  if (!testInput.value) {
    ElMessage.warning('请输入测试数据')
    return
  }

  if (!code.value) {
    ElMessage.warning('请输入代码')
    return
  }

  testStatus.value = 'testing'
  testing.value = true

  // 切换到结果标签页
  testTab.value = 'testResult'

  try {
    // 准备评测数据
    const testJudgeData: TestJudgeDTO = {
      pid: problem.value.id,
      language: languages.value.find(l => l.value === language.value)?.label || 'C++',
      code: code.value,
      type: "public",
      userInput: testInput.value,
      mode: "text/x-c++src",
      isRemoteJudge: false
    }

    // 使用API函数而非直接fetch
    const response = await submitProblemTestJudge(testJudgeData)

    if (response.data && response.data.code === 200) {
      // 获取评测结果的key
      const testJudgeKey = response.data.data

      // 获取评测结果
      await getTestResult(testJudgeKey)
    } else {
      ElMessage.error(response.data?.msg || '评测提交失败')
      testStatus.value = 'input'
    }
  } catch (error) {
    console.error('测试请求失败:', error)
    ElMessage.error('评测请求失败')
    testStatus.value = 'input'
  } finally {
    testing.value = false
  }
}

// 获取测试结果
const getTestResult = async (testJudgeKey: string) => {
  try {
    // 等待 2 秒后获取测试结果
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 调用 API 获取评测结果
    const response = await getTestJudgeResult(testJudgeKey);

    if (response.data && response.data.code === 200) {
      const testData = response.data.data;

      // 检查是否是有效数据
      if (testData && testData.status !== undefined) {
        if (testData.status === 0) { // 成功且数据有效
          testResult.value = {
            status: 'AC',
            output: testData.userOutput,
            userOutput: testData.userOutput,
            time: testData.time,
            memory: testData.memory
          };
          testStatus.value = 'success';
        } else { // 错误且数据有效
          testResult.value = {
            status: 'ERROR',
            output: testData.stderr || '运行错误',
            userOutput: testData.userOutput || '',
            time: testData.time,
            memory: testData.memory
          };
          testStatus.value = 'error';
        }
        // 确保显示在运行结果标签页
        testTab.value = 'testResult';
      } else {
        ElMessage.info('评测结果尚未生成，请稍后在提交记录中查看');
        testStatus.value = 'input';
      }
    } else {
      ElMessage.error(response.data?.msg || '获取评测结果失败');
      testStatus.value = 'input';
    }
  } catch (error) {
    console.error('获取测试结果失败:', error);
    ElMessage.error('获取评测结果失败');
    testStatus.value = 'input';
  }
}

// 提交代码进行评测
const submitCode = async () => {
  if (!code.value.trim()) {
    ElMessage.warning('请输入代码')
    return
  }

  submitting.value = true

  // 无论是否已解决，都显示评测状态，隐藏已解决提示
  judgeStatus.show = true
  judgeStatus.type = 'info'
  judgeStatus.message = '评测中...'
  judgeStatus.details = null

  try {
    // 准备评测数据
    const submitJudgeData: SubmitJudgeDTO = {
      pid: problem.value.problemId, // 使用题目ID
      language: languages.value.find(l => l.value === language.value)?.label || 'C++',
      code: code.value,
      tid: null,
      isRemote: false,
    }

    // 使用API函数提交评测
    const response = await submitProblemJudge(submitJudgeData)

    if (response.data && response.data.code === 200) {
      // 获取提交ID
      const submitId = response.data.data.submitId
      // 获取评测结果
      await pollSubmissionResult(submitId)
    } else {
      // 提交失败时更新评测状态
      judgeStatus.type = 'error'
      judgeStatus.message = response.data?.msg || '提交失败'
      ElMessage.error(response.data?.msg || '提交失败')
    }
  } catch (error) {
    console.error('提交代码失败:', error)

    // 提交异常时更新评测状态
    judgeStatus.type = 'error'
    judgeStatus.message = '提交失败，请检查网络连接'
    ElMessage.error('提交失败，请检查网络连接')
  } finally {
    submitting.value = false
  }
}

// 获取提交结果
const pollSubmissionResult = async (submitId: number) => {
  try {
    // 等待 2 秒
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 发送一次请求获取结果
    const response = await getSubmission(submitId);
    console.log('获取提交结果:', response);

    if (response.data && response.data.code === 200) {
      const submissionData = response.data.data.submission;

      // 检查评测状态
      if (submissionData) {
        updateJudgeStatus(submissionData)
      } else {
        ElMessage.info('评测结果尚未生成，请稍后在提交记录中查看');
      }
    } else {
      ElMessage.error(response.data?.msg || '获取评测结果失败');
    }
  } catch (error) {
    console.error('获取提交结果失败:', error);
    ElMessage.error('获取评测结果失败，请在提交记录中查看');
  }
}

// ===== 计算属性 =====
// 统计图表数据配置
const chartOption = computed<EChartsOption>(() => {
  // 统计数据处理
  const count = problem.value?.problemCount || {
    total: 0,
    ac: 0,
    wa: 0,
    tle: 0,
    mle: 0,
    re: 0,
    ce: 0,
    se: 0,
    pe: 0,
    pa: 0
  }

  // 计算总提交数
  const total = count.total ||
    (count.ac + count.wa + count.tle + count.mle +
      count.re + count.ce + count.se + count.pe + count.pa)

  // 两个环形图数据系列
  const innerData = [
    { value: count.ac, name: 'AC', itemStyle: { color: statusColorMap.AC } },
    { value: count.re, name: 'RE', itemStyle: { color: statusColorMap.RE } },
    { value: count.ce, name: 'CE', itemStyle: { color: statusColorMap.CE } },
    { value: count.wa, name: 'WA', itemStyle: { color: statusColorMap.WA } }
  ].filter(item => item.value > 0)

  // 如果没有数据，添加占位
  if (innerData.length === 0) {
    innerData.push({
      value: 1,
      name: '暂无数据',
      itemStyle: { color: '#dcdfe6' }
    })
  }

  // 计算各状态百分比和标签文本
  const makeLabel = (params: any) => {
    const percent = total > 0 ? Math.round((params.value / total) * 10000) / 100 : 0
    return `${params.name}: ${params.value}\n${percent}%`
  }

  // 图表配置
  return {
    legend: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '提交状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'outside',
          formatter: makeLabel
        },
        data: innerData
      }
    ]
  }
})

// 计算总提交数
const totalSubmissions = computed(() => {
  const count = problem.value?.problemCount || {
    ac: 0, wa: 0, tle: 0, mle: 0, re: 0, ce: 0, se: 0, pe: 0, pa: 0
  }
  return count.total ||
    (count.ac + count.wa + count.tle + count.mle +
      count.re + count.ce + count.se + count.pe + count.pa)
})

// ===== 监听器 =====
// 监听语言变化
watch(language, (newLang) => {
  updateEditorLanguage(newLang)
  if (templates.value[newLang]) {
    // 只有在模板存在且编辑器内容为空或与旧模板匹配时才更新
    if (!code.value || code.value === templates.value[language.value]) {
      if (monacoEditor) {
        monacoEditor.setValue(templates.value[newLang])
      }
    }
  }
})

// ===== 生命周期钩子 =====
onMounted(async () => {
  await fetchProblemDetail()
  initEditor()

  // 如果有代码模板，则在初始化后设置编辑器的值和语言
  if (languages.value.length > 0 && templates.value[language.value]) {
    if (monacoEditor) {
      monacoEditor.setValue(templates.value[language.value])
      updateEditorLanguage(language.value)
    }
  }

  // 自定义语法高亮颜色，使其在浅色主题中更突出
  monaco.editor.defineTheme('custom-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },       // 关键词：蓝色
      { token: 'string', foreground: 'a31515' },                           // 字符串：红色
      { token: 'identifier', foreground: '001080' },                       // 标识符：深蓝色
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },     // 注释：绿色斜体
      { token: 'number', foreground: '098658' },                           // 数字：青绿色
      { token: 'operator', foreground: '000000', fontStyle: 'bold' },      // 运算符：黑色加粗
      { token: 'type', foreground: '267f99' },                             // 类型：湖蓝色
      { token: 'delimiter', foreground: '000000' }                         // 分隔符：黑色
    ],
    colors: {
      'editor.foreground': '#000000',
      'editor.background': '#ffffff',
      'editor.selectionBackground': '#add6ff',
      'editor.lineHighlightBackground': '#f0f0f0',
      'editorCursor.foreground': '#000000',
      'editorWhitespace.foreground': '#d3d3d3'
    }
  })

  // 应用自定义主题
  monaco.editor.setTheme('custom-light')
  await checkProblemStatus()
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (monacoEditor) {
    monacoEditor.dispose()
  }
})
</script>

<style scoped>
/* 问题解决状态样式 */
.problem-solved-status {
  margin: 16px 0;
}

.judge-status {
  margin-top: 16px;
}

.judge-details {
  margin-top: 8px;
  display: flex;
  gap: 16px;
  font-size: 14px;
}

/* 对话框样式优化 */
:deep(.el-dialog__body) {
  padding: 16px 24px;
}

:deep(.el-table) {
  margin-bottom: 10px;
}

.test-result.error .test-status {
  color: #f56c6c;
}

.test-result.error .test-status .el-icon {
  color: #f56c6c;
  font-size: 24px;
}

/* 测试结果通用样式 */
.test-result {
  padding: 16px;
  border-radius: 8px;
}

.test-result.success {
  background-color: rgba(103, 194, 58, 0.05);
}

.test-result.error {
  background-color: rgba(245, 108, 108, 0.05);
}

/* 编辑器底部按钮区域 */
.editor-bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

/* 在线测试面板 */
.online-test-panel {
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.test-tabs {
  padding: 0 16px;
}

.test-io-section {
  margin-bottom: 16px;
}

.io-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #606266;
}

.test-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.test-result {
  padding: 16px;
}

.test-result.success {
  border-radius: 4px;
}

.test-result-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.test-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.test-status .el-icon {
  color: #67c23a;
  font-size: 24px;
}

.test-info {
  display: flex;
  gap: 16px;
  color: #606266;
}

.test-time,
.test-memory {
  display: flex;
  align-items: center;
  gap: 4px;
}

.test-waiting,
.test-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
  gap: 16px;
}

.test-waiting .el-icon,
.test-loading .el-icon {
  font-size: 32px;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

.test-panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 统计弹窗样式 */
.statistics-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 5px;
}

.statistics-chart {
  width: 100%;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 更新统计弹窗样式，确保居中显示 */
:deep(.el-dialog) {
  margin: 0 auto !important;
  /* 水平居中 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 精确定位到屏幕中心 */
  max-height: 90vh;
  /* 限制最大高度 */
  overflow-y: auto;
  /* 内容过多时允许滚动 */
}

:deep(.el-dialog__body) {
  max-height: calc(90vh - 120px);
  /* 减去头部和底部预留空间 */
  overflow-y: auto;
}

/* 使弹窗背景覆盖整个屏幕 */
:deep(.el-overlay) {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* Markdown 内容样式 */
.section-content :deep(h1) {
  font-size: 1.8em;
  margin: 1em 0 0.5em;
}

.section-content :deep(h2) {
  font-size: 1.6em;
  margin: 1em 0 0.5em;
}

.section-content :deep(h3) {
  font-size: 1.4em;
  margin: 1em 0 0.5em;
}

.section-content :deep(p) {
  margin: 0.5em 0;
  line-height: 1.6;
}

.section-content :deep(ul),
.section-content :deep(ol) {
  padding-left: 2em;
  margin: 0.5em 0;
}

.section-content :deep(li) {
  margin: 0.3em 0;
}

.section-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
}

.section-content :deep(pre) {
  margin: 0.5em 0;
  padding: 0.5em;
  background-color: #f6f8fa;
  border-radius: 4px;
  overflow-x: auto;
}

.section-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.section-content :deep(blockquote) {
  margin: 0.5em 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

.section-content :deep(table) {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.section-content :deep(th),
.section-content :deep(td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.section-content :deep(th) {
  background-color: #f6f8fa;
}

/* KaTeX 数学公式支持 */
.section-content :deep(.katex) {
  font-size: 1.1em;
}

/* 标签气泡样式 */
.tag-tooltip {
  max-width: 300px !important;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
}

:deep(.el-tooltip__popper) {
  max-width: 300px;
}

.problem-header-tabs {
  margin-bottom: 10px;
}

.problem-title {
  font-size: 22px;
  margin: 15px 0;
  text-align: left;
  color: #333;
}

.problem-actions {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.problem-info {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #606266;
  width: 80px;
}

.section-title {
  color: #409EFF;
  font-size: 18px;
  margin: 20px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
}

.content-section {
  margin-bottom: 20px;
}

.section-content {
  line-height: 1.6;
  color: #303133;
}

.sample-content {
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}

.sample-content pre {
  margin: 0;
  padding: 12px;
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.sample-copy {
  margin-left: 10px;
  cursor: pointer;
}

.sample-copy:hover {
  background-color: #ecf5ff;
}

/* ========== 主要布局 ========== */
.problem-container {
  display: flex;
  max-width: 2000px;
  margin: 0 auto;
  padding: 20px;
  gap: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

.problem-description {
  flex: 0 0 45%;
  max-width: 45%;
}

.code-editor {
  flex: 0 0 55%;
  max-width: 55%;
  display: flex;
  flex-direction: column;
}

/* ========== 卡片通用样式 ========== */
.description-card,
.editor-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 24px;
  height: 100%;
}

.description-card:hover,
.editor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

/* ========== 题目内容样式 ========== */
.problem-header {
  width: 100%;
}

.problem-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.problem-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.limit-info {
  color: #606266;
  font-size: 14px;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.problem-tag {
  font-size: 12px;
}

.ac-alert {
  margin-top: 16px;
}

.section-subtitle {
  margin: 24px 0 16px;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.description-content {
  line-height: 1.6;
  color: #303133;
}

/* ========== 样例部分 ========== */
.sample-case {
  margin: 16px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.sample-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.sample-case pre {
  margin: 0;
  padding: 12px;
  background-color: #fafafa;
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ========== 编辑器样式 ========== */
.editor-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.editor-main {
  padding: 16px;
  flex: 1;
}

.monaco-editor-container {
  width: 100%;
  height: 600px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background-color: #ffffff;
  /* 确保背景为白色 */
}

/* 编辑器主题自定义 */
:deep(.monaco-editor) {
  padding: 8px 0;
}

:deep(.monaco-editor .margin) {
  background-color: #f5f7fa;
  /* 行号区域背景色 */
}

/* 确保代码区域背景色 */
:deep(.monaco-editor .monaco-scrollable-element) {
  background-color: #ffffff;
}

/* ========== 测试区域样式 ========== */
.test-area {
  border-top: 1px solid #dcdfe6;
}

.test-input,
.test-output {
  padding: 16px;
}

.input-header,
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-info {
  margin-top: 8px;
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 14px;
}

:deep(.el-textarea__inner) {
  font-family: 'Consolas', monospace;
  font-size: 14px;
}

/* ========== 提交记录表格样式 ========== */
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

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: bold;
  padding: 0 8px;
}

:deep(.el-collapse-item__content) {
  padding: 8px;
}

/* 自定义滚动条 */
.problem-description:deep(::-webkit-scrollbar) {
  width: 6px;
}

.problem-description:deep(::-webkit-scrollbar-thumb) {
  background-color: #909399;
  border-radius: 3px;
}

.problem-description:deep(::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}

/* ========== 响应式设计 ========== */
@media screen and (max-width: 1400px) {
  .problem-container {
    padding: 20px 5%;
  }
}

@media screen and (max-width: 1200px) {
  .problem-container {
    padding: 20px 16px;
  }

  .problem-title {
    font-size: 20px;
  }
}

@media screen and (max-width: 768px) {
  .problem-container {
    flex-direction: column;
  }

  .problem-description,
  .code-editor {
    flex: none;
    max-width: 100%;
  }

  .monaco-editor-container {
    height: 400px;
  }
}
</style>