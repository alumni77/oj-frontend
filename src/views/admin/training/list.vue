<template>
  <div class="trainings-container">
    <!-- 训练管理卡片 -->
    <el-card class="trainings-card">
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <Tickets />
            </el-icon>
            <span>训练列表</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddTraining">
              <el-icon>
                <Plus />
              </el-icon>
              添加训练
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input v-model="searchQuery" placeholder="搜索训练..." clearable @clear="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 训练数据表格 -->
      <el-table :data="trainingList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="rank" label="序号" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="180" align="center" />

        <!-- 权限列 -->
        <el-table-column label="权限" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.auth === 'Public' ? 'success' : 'info'">
              {{ scope.row.auth === 'Public' ? '公开' : '私有' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="是否可用" width="120" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" @change="(val) => handleStatusChange(scope.row, val)"
              :disabled="loading" />
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">
            <div>Created Time: {{ formatDate(scope.row.gmtCreate) }}</div>
            <div>Update Time: {{ formatDate(scope.row.gmtModified) }}</div>
            <div>Creator: {{ scope.row.author }}</div>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleProblems(scope.row)">
              <el-icon>
                <Document />
              </el-icon>
              题目
            </el-button>
            <el-button size="small" type="success" @click="handleEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalTrainings" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 训练表单对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" @close="resetForm">
      <el-form ref="trainingFormRef" :model="trainingForm" :rules="trainingRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="trainingForm.title" placeholder="请输入训练标题" />
        </el-form-item>

        <el-form-item label="作者" prop="author">
          <el-input v-model="trainingForm.author" placeholder="请输入作者名称" />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="trainingForm.categoryId" placeholder="请选择训练分类" style="width: 100%">
            <el-option v-for="category in categoryOptions" :key="category.id" :label="category.name"
              :value="category.id">
              <div style="display: flex; align-items: center">
                <div :style="{
                  backgroundColor: category.color,
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  marginRight: '8px',
                }"></div>
                <span>{{ category.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="序号" prop="rank">
          <el-input-number v-model="trainingForm.rank" :min="1" :max="999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="训练描述" prop="description">
          <el-input v-model="trainingForm.description" type="textarea" :rows="8" placeholder="请输入训练描述，支持Markdown语法" />
        </el-form-item>

        <el-form-item label="权限" prop="auth">
          <el-radio-group v-model="trainingForm.auth">
            <el-radio label="Public">
              <el-tag type="success" effect="light">公开</el-tag>
            </el-radio>
            <el-radio label="Private">
              <el-tag type="info" effect="light">私有</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch v-model="trainingForm.status" />
          <span class="status-description">{{ trainingForm.status ? '可用' : '禁用' }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 训练题目对话框 -->
    <el-dialog title="训练题目管理" v-model="problemsDialogVisible" width="900px">
      <div v-if="currentTraining" class="training-info">
        <h3>{{ currentTraining.title }}</h3>
        <div class="training-description" v-html="renderedDescription"></div>
      </div>

      <!-- 题目搜索和添加区域 -->
      <div class="problems-search-area">
        <el-input v-model="problemSearchQuery" placeholder="搜索题目..." clearable @clear="handleProblemSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleProblemSearch">搜索</el-button>
        <el-button @click="resetProblemSearch">重置</el-button>
        <el-button type="success" @click="handleAddProblem">
          <el-icon>
            <Plus />
          </el-icon>
          添加题目
        </el-button>
      </div>

      <!-- 题目表格 -->
      <el-table :data="trainingProblems" border style="width: 100%" v-loading="problemsLoading" row-key="id">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="displayId" label="题号" width="120" align="center" />
        <el-table-column prop="title" label="题目名称" min-width="180" align="center" />
        <el-table-column prop="author" label="作者" width="100" align="center" />

        <!-- 难度列 -->
        <el-table-column label="难度" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getDifficultyType(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handlePreview(scope.row)">
              <el-icon>
                <View />
              </el-icon>
              预览
            </el-button>
            <el-button size="small" type="danger" @click="handleRemoveProblem(scope.row)">
              <el-icon>
                <Delete />
              </el-icon>
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 题目分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="problemCurrentPage" v-model:page-size="problemPageSize"
          :page-sizes="[5, 10, 15, 20]" layout="total, sizes, prev, pager, next, jumper" :total="totalProblems"
          @size-change="handleProblemSizeChange" @current-change="handleProblemCurrentChange" />
      </div>
    </el-dialog>

    <!-- 添加题目对话框 -->
    <el-dialog title="添加题目" v-model="addProblemDialogVisible" width="800px">
      <div class="add-problem-search">
        <el-input v-model="publicProblemSearchQuery" placeholder="搜索公开题目..." clearable @clear="searchPublicProblems">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="searchPublicProblems">搜索</el-button>
      </div>

      <el-table :data="publicProblems" border style="width: 100%; margin-top: 15px" v-loading="publicProblemsLoading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="problemId" label="题号" width="120" align="center" />
        <el-table-column prop="title" label="题目名称" min-width="180" align="center" />
        <el-table-column prop="author" label="作者" width="100" align="center" />

        <!-- 难度列 -->
        <el-table-column label="难度" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getDifficultyType(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="publicProblemCurrentPage" v-model:page-size="publicProblemPageSize"
          :page-sizes="[5, 10, 15, 20]" layout="total, sizes, prev, pager, next, jumper" :total="totalPublicProblems"
          @size-change="handlePublicProblemSizeChange" @current-change="handlePublicProblemCurrentChange" />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addProblemDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddProblems" :loading="addingProblems">添加选中题目</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览题目对话框 -->
    <el-dialog title="题目预览" v-model="previewDialogVisible" width="700px">
      <div class="preview-content" v-if="previewProblem">
        <h2 class="preview-title">{{ previewProblem.problemId }}: {{ previewProblem.title }}</h2>

        <el-divider content-position="left">题目描述</el-divider>
        <div class="preview-section" v-html="previewDescriptionHTML"></div>

        <el-divider content-position="left">输入描述</el-divider>
        <div class="preview-section" v-html="previewInputHTML"></div>

        <el-divider content-position="left">输出描述</el-divider>
        <div class="preview-section" v-html="previewOutputHTML"></div>

        <el-divider content-position="left">示例</el-divider>
        <div class="preview-examples" v-if="parsedExamples.length > 0">
          <div v-for="(example, index) in parsedExamples" :key="index" class="example-item">
            <div class="example-header">示例 {{ index + 1 }}</div>

            <div class="example-section">
              <div class="example-label">输入:</div>
              <pre class="example-code">{{ example.input }}</pre>
            </div>

            <div class="example-section">
              <div class="example-label">输出:</div>
              <pre class="example-code">{{ example.output }}</pre>
            </div>
          </div>
        </div>
        <div v-else class="no-examples">无示例</div>

        <el-divider content-position="left">提示</el-divider>
        <div class="preview-section hint-section" v-html="previewHintHTML"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Tickets, Search, Edit, Delete, Plus, View, Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getTrainingList,
  getTraining,
  deleteTraining,
  updateTraining,
  addTraining,
  changeTrainingStatus,
  getTrainingProblemList,
  updateProblemInTraining,
  deleteProblemInTraining,
  addProblemFromPublic,
} from '@/api/admin'
import { getProblemList } from '@/api/admin'
import { Training, TrainingCategory, TrainingDTO } from '@/api/admin/type'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'

// Markdown处理
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
}).use(mk)

// 渲染Markdown内容
const renderMarkdown = (content) => {
  if (!content) return ''
  return md.render(content)
}

// ===== 训练列表状态与数据 =====
const loading = ref(false)
const trainingList = ref([])
const totalTrainings = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const submitting = ref(false)

// 难度映射
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

// 训练表单对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => dialogType.value === 'add' ? '添加训练' : '编辑训练')
const trainingFormRef = ref<FormInstance>()

// 训练表单数据
const trainingForm = reactive({
  id: 0,
  title: '',
  description: '',
  author: 'root',
  auth: 'Public',
  status: true,
  rank: 1,
  categoryId: null as number | null
})

// 分类选项
const categoryOptions = ref<TrainingCategory[]>([
  { id: 1, name: '语法入门', color: '#ff6666', gmtCreate: '', gmtModified: '' },
  { id: 2, name: '数据结构', color: '#3498db', gmtCreate: '', gmtModified: '' },
  { id: 3, name: '基础算法', color: '#cc66cc', gmtCreate: '', gmtModified: '' },
  { id: 4, name: '动态规划', color: '#27ae60', gmtCreate: '', gmtModified: '' },
  { id: 5, name: '图论', color: '#f39c12', gmtCreate: '', gmtModified: '' }
])

// 表单验证规则
const trainingRules: FormRules = {
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符之间', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '作者不能为空', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择训练分类', trigger: 'change' }
  ],
  description: [
    { required: true, message: '描述不能为空', trigger: 'blur' }
  ]
}

// ===== 训练题目管理 =====
const problemsDialogVisible = ref(false)
const currentTraining = ref<any>(null)
const trainingProblems = ref<any[]>([])
const problemsLoading = ref(false)
const problemSearchQuery = ref('')
const problemCurrentPage = ref(1)
const problemPageSize = ref(10)
const totalProblems = ref(0)
const renderedDescription = computed(() => {
  return currentTraining.value ? renderMarkdown(currentTraining.value.description) : ''
})

// ===== 添加题目 =====
const addProblemDialogVisible = ref(false)
const publicProblems = ref<any[]>([])
const publicProblemSearchQuery = ref('')
const publicProblemsLoading = ref(false)
const publicProblemCurrentPage = ref(1)
const publicProblemPageSize = ref(10)
const totalPublicProblems = ref(0)
const selectedProblems = ref<any[]>([])
const addingProblems = ref(false)

// ===== 预览题目 =====
const previewDialogVisible = ref(false)
const previewProblem = ref(null)
const parsedExamples = computed(() => {
  if (!previewProblem.value || !previewProblem.value.examples) {
    return []
  }

  try {
    return JSON.parse(previewProblem.value.examples)
  } catch (error) {
    console.error('解析示例失败:', error)
    return []
  }
})

// 预览内容的Markdown渲染
const previewDescriptionHTML = computed(() =>
  previewProblem.value ? renderMarkdown(previewProblem.value.description || '') : ''
)
const previewInputHTML = computed(() =>
  previewProblem.value ? renderMarkdown(previewProblem.value.input || '') : ''
)
const previewOutputHTML = computed(() =>
  previewProblem.value ? renderMarkdown(previewProblem.value.output || '') : ''
)
const previewHintHTML = computed(() =>
  previewProblem.value ? renderMarkdown(previewProblem.value.hint || '') : ''
)

// ===== 初始化 =====
onMounted(() => {
  fetchTrainingList()
})

// ===== 方法：训练管理 =====
// 获取训练列表
const fetchTrainingList = async () => {
  loading.value = true
  try {
    const params = {
      limit: pageSize.value,
      currentPage: currentPage.value,
      keyword: searchQuery.value.trim()
    }

    const response = await getTrainingList(params)
    if (response?.data?.code === 200) {
      trainingList.value = response.data.data.records
      totalTrainings.value = response.data.data.total
    } else {
      ElMessage.error(response?.data?.msg || '获取训练列表失败')
    }
  } catch (error) {
    console.error('获取训练列表失败:', error)
    ElMessage.error('获取训练列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchTrainingList()
}

const resetSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchTrainingList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchTrainingList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchTrainingList()
}

// 日期格式化
const formatDate = (dateString: string) => {
  if (!dateString) return '暂无'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

// 难度处理
const getDifficultyText = (difficulty: number) => {
  return difficultyMap[difficulty] || '未知'
}

const getDifficultyType = (difficulty: number) => {
  if (difficulty <= 2) return 'info'
  if (difficulty <= 4) return 'success'
  if (difficulty <= 6) return 'warning'
  return 'danger'
}

// 训练表单操作
const handleAddTraining = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  dialogType.value = 'edit'
  resetForm()

  try {
    const response = await getTraining(row.id)
    if (response?.data?.code === 200) {
      const data = response.data.data
      const training = data.training
      const category = data.trainingCategory

      // 填充表单
      trainingForm.id = training.id
      trainingForm.title = training.title
      trainingForm.description = training.description
      trainingForm.author = training.author
      trainingForm.auth = training.auth
      trainingForm.status = training.status
      trainingForm.rank = training.rank
      trainingForm.categoryId = category.id

      dialogVisible.value = true
    } else {
      ElMessage.error(response?.data?.msg || '获取训练详情失败')
    }
  } catch (error) {
    console.error('获取训练详情失败:', error)
    ElMessage.error('获取训练详情失败')
  }
}

const resetForm = () => {
  if (trainingFormRef.value) {
    trainingFormRef.value.resetFields()
  }

  Object.assign(trainingForm, {
    id: 0,
    title: '',
    description: '',
    author: 'root',
    auth: 'Public',
    status: true,
    rank: 1,
    categoryId: null
  })
}

const submitForm = async () => {
  if (!trainingFormRef.value) return

  try {
    await trainingFormRef.value.validate()
    submitting.value = true

    // 查找对应的分类对象
    const category = categoryOptions.value.find(c => c.id === trainingForm.categoryId)
    if (!category) {
      ElMessage.error('无法找到所选分类')
      submitting.value = false
      return
    }

    const trainingDTO: TrainingDTO = {
      training: {
        id: trainingForm.id,
        title: trainingForm.title,
        description: trainingForm.description,
        author: trainingForm.author,
        auth: trainingForm.auth,
        status: trainingForm.status,
        rank: trainingForm.rank,
        gmtCreate: '',
        gmtModified: ''
      },
      trainingCategory: {
        id: category.id,
        name: category.name,
        color: category.color,
        gmtCreate: '',
        gmtModified: ''
      }
    }

    const api = dialogType.value === 'add' ? addTraining : updateTraining
    const response = await api(trainingDTO)

    if (response?.data?.code === 200) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchTrainingList()
    } else {
      ElMessage.error(response?.data?.msg || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error('提交表单失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除训练 "${row.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteTraining(row.id)

      if (response?.data?.code === 200) {
        ElMessage.success('删除成功')
        fetchTrainingList()
      } else {
        ElMessage.error(response?.data?.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 修改训练状态
const handleStatusChange = async (row, status) => {

  try {
    const params = {
      tid: row.id,
      author: row.author,
      status: status
    }
    const response = await changeTrainingStatus(params)

    if (response?.data?.code === 200) {
      ElMessage.success(`训练已${status ? '启用' : '禁用'}`)
    } else {
      // 状态更改失败，回滚UI状态
      row.status = !status
      ElMessage.error(response?.data?.msg || '状态更改失败')
    }
  } catch (error) {
    // 出现错误，回滚UI状态
    row.status = !status
    console.error('修改状态失败:', error)
    ElMessage.error('修改状态失败')
  }
}

// ===== 方法：题目管理 =====
// 打开题目管理对话框
const handleProblems = async (row) => {
  currentTraining.value = row
  problemsDialogVisible.value = true
  problemCurrentPage.value = 1
  problemSearchQuery.value = ''
  await fetchTrainingProblems()
}

// 获取训练的题目列表
const fetchTrainingProblems = async () => {
  if (!currentTraining.value) return

  problemsLoading.value = true
  try {
    const params = {
      tid: currentTraining.value.id,
      limit: problemPageSize.value,
      currentPage: problemCurrentPage.value,
      keyword: problemSearchQuery.value.trim(),
      queryExisted: true
    }

    const response = await getTrainingProblemList(params)

    if (response?.data?.code === 200) {
      const data = response.data.data
      // 处理返回的数据，合并题目信息和训练题目关系
      const problemMap = data.trainingProblemMap || {}
      const problems = data.problemList.records || []

      trainingProblems.value = problems.map(problem => {
        // 获取对应的TrainingProblem关系数据
        const trainingProblemInfo = problemMap[problem.id] || {}
        return {
          ...problem,
          trainingProblemId: trainingProblemInfo.id,
          rank: trainingProblemInfo.rank || 0
        }
      })

      totalProblems.value = data.problemList.total || 0
    } else {
      ElMessage.error(response?.data?.msg || '获取训练题目列表失败')
    }
  } catch (error) {
    console.error('获取训练题目列表失败:', error)
    ElMessage.error('获取训练题目列表失败')
  } finally {
    problemsLoading.value = false
  }
}

// 题目搜索处理
const handleProblemSearch = () => {
  problemCurrentPage.value = 1
  fetchTrainingProblems()
}

const resetProblemSearch = () => {
  problemSearchQuery.value = ''
  problemCurrentPage.value = 1
  fetchTrainingProblems()
}

// 题目分页处理
const handleProblemSizeChange = (size: number) => {
  problemPageSize.value = size
  fetchTrainingProblems()
}

const handleProblemCurrentChange = (page: number) => {
  problemCurrentPage.value = page
  fetchTrainingProblems()
}

// 预览题目
const handlePreview = (problem) => {
  previewProblem.value = problem
  previewDialogVisible.value = true
}

// 添加题目相关方法
const handleAddProblem = () => {
  if (!currentTraining.value) return

  publicProblemSearchQuery.value = ''
  publicProblemCurrentPage.value = 1
  selectedProblems.value = []
  addProblemDialogVisible.value = true
  searchPublicProblems()
}

// 搜索公开题目
const searchPublicProblems = async () => {
  publicProblemsLoading.value = true
  try {
    const params = {
      limit: publicProblemPageSize.value,
      currentPage: publicProblemCurrentPage.value,
      keyword: publicProblemSearchQuery.value.trim(),
      auth: 1 // 只搜索公开题目
    }

    const response = await getProblemList(params)

    if (response?.data?.code === 200) {
      publicProblems.value = response.data.data.records
      totalPublicProblems.value = response.data.data.total
    } else {
      ElMessage.error(response?.data?.msg || '获取公开题目失败')
    }
  } catch (error) {
    console.error('获取公开题目失败:', error)
    ElMessage.error('获取公开题目失败')
  } finally {
    publicProblemsLoading.value = false
  }
}

// 公开题目分页处理
const handlePublicProblemSizeChange = (size: number) => {
  publicProblemPageSize.value = size
  searchPublicProblems()
}

const handlePublicProblemCurrentChange = (page: number) => {
  publicProblemCurrentPage.value = page
  searchPublicProblems()
}

// 多选处理
const handleSelectionChange = (selection) => {
  selectedProblems.value = selection
}

// 提交添加题目
const submitAddProblems = async () => {
  if (selectedProblems.value.length === 0) {
    ElMessage.warning('请至少选择一个题目')
    return
  }

  addingProblems.value = true
  try {
    const promises = selectedProblems.value.map(problem => {
      return addProblemFromPublic({
        pid: problem.id,
        tid: currentTraining.value.id,
        displayId: problem.problemId
      })
    })

    await Promise.all(promises)

    ElMessage.success(`成功添加${selectedProblems.value.length}个题目`)
    addProblemDialogVisible.value = false
    fetchTrainingProblems()
  } catch (error) {
    console.error('添加题目失败:', error)
    ElMessage.error('添加题目失败')
  } finally {
    addingProblems.value = false
  }
}

// 移除题目
const handleRemoveProblem = (problem) => {
  ElMessageBox.confirm(
    `确定要从训练中移除题目 "${problem.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteProblemInTraining({
        pid: problem.id,
        tid: currentTraining.value.id
      })

      if (response?.data?.code === 200) {
        ElMessage.success('移除成功')
        fetchTrainingProblems()
      } else {
        ElMessage.error(response?.data?.msg || '移除失败')
      }
    } catch (error) {
      console.error('移除题目失败:', error)
      ElMessage.error('移除题目失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped>
/* ===== 训练列表页面样式 ===== */
.trainings-container {
  margin-bottom: 20px;
}

.trainings-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.header-icon {
  font-size: 20px;
  color: #409EFF;
}

.search-area {
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
}

.search-area .el-input {
  width: 300px;
}

/* ===== 表格样式 ===== */
:deep(.el-table .cell) {
  text-align: center;
}

:deep(.el-table th) {
  text-align: center;
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

/* ===== 分页样式 ===== */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* ===== 表单样式 ===== */
.status-description {
  margin-left: 10px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ===== 训练题目管理样式 ===== */
.training-info {
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.training-info h3 {
  margin: 0 0 10px;
  color: #303133;
  font-weight: 600;
}

.training-description {
  color: #606266;
  font-size: 14px;
  max-height: 150px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9fafb;
  border-radius: 4px;
}

.problems-search-area {
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
}

.problems-search-area .el-input {
  width: 300px;
}

/* ===== 添加题目样式 ===== */
.add-problem-search {
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
}

.add-problem-search .el-input {
  width: 300px;
}

/* ===== Markdown 样式 ===== */
.training-description :deep(h1),
.preview-section :deep(h1) {
  font-size: 1.8em;
  margin: 1em 0 0.5em;
}

.training-description :deep(h2),
.preview-section :deep(h2) {
  font-size: 1.6em;
  margin: 1em 0 0.5em;
}

.training-description :deep(h3),
.preview-section :deep(h3) {
  font-size: 1.4em;
  margin: 1em 0 0.5em;
}

.training-description :deep(p),
.preview-section :deep(p) {
  margin: 0.5em 0;
  line-height: 1.6;
}

.training-description :deep(ul),
.preview-section :deep(ul),
.training-description :deep(ol),
.preview-section :deep(ol) {
  padding-left: 2em;
  margin: 0.5em 0;
}

.training-description :deep(li),
.preview-section :deep(li) {
  margin: 0.3em 0;
}

.training-description :deep(code),
.preview-section :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
}

.training-description :deep(pre),
.preview-section :deep(pre) {
  margin: 0.5em 0;
  padding: 0.5em;
  background-color: #f6f8fa;
  border-radius: 4px;
  overflow-x: auto;
}

.training-description :deep(pre code),
.preview-section :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.training-description :deep(.katex),
.preview-section :deep(.katex) {
  font-size: 1.1em;
}

/* ===== 预览样式 ===== */
.preview-content {
  padding: 10px;
}

.preview-title {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
}

.preview-section {
  padding: 10px 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.example-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
}

.example-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #409EFF;
}

.example-section {
  margin-bottom: 10px;
}

.example-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.example-code {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  overflow-x: auto;
}

.no-examples {
  color: #909399;
  font-style: italic;
  padding: 10px;
}

.hint-section {
  color: #606266;
  font-style: italic;
}
</style>