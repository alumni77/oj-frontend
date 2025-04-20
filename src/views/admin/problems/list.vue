<template>
  <div class="problems-container">
    <!-- 题目管理卡片 -->
    <el-card class="problems-card">
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <Document />
            </el-icon>
            <span>题目管理</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddProblem">
              <el-icon>
                <Plus />
              </el-icon>
              添加题目
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和过滤区域 -->
      <div class="search-area">
        <el-input v-model="searchQuery" placeholder="搜索题目..." clearable @clear="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button @click="handleImport">
          <el-icon>
            <Upload />
          </el-icon>
          导入题目
        </el-button>
      </div>

      <!-- 筛选选项 -->
      <div class="filter-area">
        <el-select v-model="filterDifficulty" placeholder="难度" clearable @change="handleFilter">
          <el-option v-for="(label, value) in difficultyMap" :key="value" :label="label" :value="Number(value)" />
        </el-select>
        <el-select v-model="filterTag" placeholder="标签" clearable @change="handleFilter">
          <el-option-group v-for="group in tagGroups" :key="group.category" :label="group.category">
            <el-option v-for="tag in group.tags" :key="tag.value" :label="tag.label" :value="tag.value" />
          </el-option-group>
        </el-select>
      </div>

      <!-- 题目数据表格 -->
      <el-table :data="problemList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
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

        <!-- 权限列 -->
        <el-table-column label="权限" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.auth === 1 ? 'success' : 'info'">
              {{ scope.row.auth === 1 ? '公开' : '私有' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 题目内容 -->
        <el-table-column label="题目内容" width="100" align="center">
          <template #default="scope">
            <el-tooltip content="预览题目描述">
              <el-button size="small" @click="handlePreview(scope.row)" text>
                <el-icon>
                  <View />
                </el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">{{ formatDate(scope.row.gmtCreate) }}</template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <el-button size="small" type="success" @click="handleDownloadTestcase(scope.row)">下载评测数据</el-button>
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalProblems" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>

      <!-- 题目表单对话框 -->
      <el-dialog :title="dialogTitle" v-model="dialogVisible" width="900px" @close="resetForm">
        <el-form ref="problemFormRef" :model="problemForm" :rules="problemRules" label-width="100px">
          <!-- 基本信息 -->
          <el-form-item label="题目ID" prop="id" v-if="dialogType === 'edit'">
            <el-input v-model="problemForm.id" disabled />
          </el-form-item>

          <el-form-item label="题号" prop="problemId">
            <el-input v-model="problemForm.problemId" />
          </el-form-item>

          <el-form-item label="题目名称" prop="title">
            <el-input v-model="problemForm.title" />
          </el-form-item>

          <el-form-item label="作者" prop="author">
            <el-input v-model="problemForm.author" />
          </el-form-item>

          <el-form-item label="难度" prop="difficulty">
            <el-select v-model="problemForm.difficulty" placeholder="请选择难度">
              <el-option v-for="(label, value) in difficultyMap" :key="value" :label="label" :value="Number(value)" />
            </el-select>
          </el-form-item>

          <el-form-item label="权限" prop="auth">
            <el-radio-group v-model="problemForm.auth">
              <el-radio :label="1">
                <el-tag type="success" effect="light">公开</el-tag>
              </el-radio>
              <el-radio :label="0">
                <el-tag type="info" effect="light">私有</el-tag>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="限制" prop="limits">
            <div class="limits-container">
              <div class="limit-item">
                <span>时间限制</span>
                <el-input-number v-model="problemForm.timeLimit" :min="1" :step="100" controls-position="right" />
                <span class="limit-unit">ms</span>
              </div>

              <div class="limit-item">
                <span>内存限制</span>
                <el-input-number v-model="problemForm.memoryLimit" :min="1" :step="32" controls-position="right" />
                <span class="limit-unit">MB</span>
              </div>

              <div class="limit-item">
                <span>栈限制</span>
                <el-input-number v-model="problemForm.stackLimit" :min="1" :step="32" controls-position="right" />
                <span class="limit-unit">MB</span>
              </div>
            </div>
          </el-form-item>

          <!-- 题目内容 -->
          <el-form-item label="题目描述" prop="description">
            <el-input v-model="problemForm.description" type="textarea" :rows="4" />
          </el-form-item>

          <el-form-item label="输入描述" prop="input">
            <el-input v-model="problemForm.input" type="textarea" :rows="3" />
          </el-form-item>

          <el-form-item label="输出描述" prop="output">
            <el-input v-model="problemForm.output" type="textarea" :rows="3" />
          </el-form-item>

          <!-- 示例部分 -->
          <el-form-item label="示例" prop="examples">
            <div class="examples-container">
              <el-button type="primary" size="small" @click="addExample">
                <el-icon>
                  <Plus />
                </el-icon> 添加示例
              </el-button>

              <div v-for="(example, index) in parsedFormExamples" :key="index" class="example-item">
                <div class="example-header">
                  <span>示例 {{ index + 1 }}</span>
                  <el-button type="danger" size="small" @click="removeExample(index)" :icon="Delete" circle />
                </div>

                <el-form-item :label="'输入'" :prop="`examples.${index}.input`" class="nested-form-item">
                  <el-input v-model="example.input" type="textarea" :rows="3" @change="updateExamplesJson" />
                </el-form-item>

                <el-form-item :label="'输出'" :prop="`examples.${index}.output`" class="nested-form-item">
                  <el-input v-model="example.output" type="textarea" :rows="3" @change="updateExamplesJson" />
                </el-form-item>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="提示" prop="hint">
            <el-input v-model="problemForm.hint" type="textarea" :rows="3" />
          </el-form-item>

          <el-form-item label="题目来源" prop="source">
            <el-input v-model="problemForm.source" />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">确认</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 导入题目对话框 -->
      <el-dialog title="导入题目" v-model="importDialogVisible" width="500px">
        <div class="import-guide">
          <ol>
            <li>题目导入支持JSON或ZIP格式的题目数据。</li>
            <li>JSON格式需要符合指定的结构，包含题目标题、描述、输入输出等信息。</li>
            <li>ZIP格式需包含题目描述文件和测试数据，目录结构请参考说明文档。</li>
          </ol>
        </div>

        <div class="import-actions">
          <el-upload class="upload-demo" action="#" :auto-upload="false" :limit="1" :on-change="handleFileChange"
            :on-exceed="handleExceed" accept=".json,.zip">
            <el-button type="primary">
              <el-icon>
                <Upload />
              </el-icon> 选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">支持JSON或ZIP格式</div>
            </template>
          </el-upload>

          <el-button type="success" :disabled="!importFile" :loading="importLoading" @click="submitImportProblem">
            <el-icon>
              <Check />
            </el-icon> 提交导入
          </el-button>
        </div>
      </el-dialog>

      <!-- 预览对话框 -->
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Document, Search, Upload, Plus, Check, View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getProblemList, getProblem, deleteProblem, updateProblem, addProblem, getProblemCases } from '@/api/admin'
import { getProblemTagsAndClassification } from '@/api/problem'
import { ProblemCase, ProblemDTO } from '@/api/admin/type'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
import { useRouter } from 'vue-router'

// ===== Markdown处理 =====
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

// ===== 状态与数据 =====
const loading = ref(false)
const problemList = ref([])
const totalProblems = ref(0)

// 分页与搜索
const currentPage = ref(1)
const pageSize = ref(5)
const searchQuery = ref('')

// 筛选
const filterDifficulty = ref('')
const filterTag = ref('')
const tagOptions = ref([])

// 难度映射
const difficultyMap: Record<number, string> = {
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

// ===== 计算属性 =====
// 按分类分组的标签
const tagGroups = computed(() => {
  const groups = {}

  tagOptions.value.forEach(tag => {
    if (!groups[tag.category]) {
      groups[tag.category] = {
        category: tag.category,
        tags: []
      }
    }
    groups[tag.category].tags.push(tag)
  })

  return Object.values(groups)
})

// ===== 题目表单与对话框 =====
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => dialogType.value === 'add' ? '添加题目' : '编辑题目')
const submitting = ref(false)
const problemFormRef = ref<FormInstance>()

// 题目表单数据
const problemForm = reactive({
  id: 0,
  pid: 0,
  problemId: '',
  title: '',
  author: 'root',
  type: 0,
  judgeMode: 'default',
  judgeCaseMode: 'default',
  timeLimit: 1000,
  memoryLimit: 256,
  stackLimit: 128,
  description: '',
  input: '',
  output: '',
  examples: '[]',
  isRemote: false,
  source: '原创题目',
  difficulty: 0,
  hint: '',
  auth: 1,
  ioScore: 100,
  codeShare: true,
  isRemoveEndBlank: true,
  openCaseResult: true
})

// 表单验证规则
const problemRules = {
  problemId: [
    { required: true, message: '题号不能为空', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '题目名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '题目描述不能为空', trigger: 'blur' }
  ],
  input: [
    { required: true, message: '输入描述不能为空', trigger: 'blur' }
  ],
  output: [
    { required: true, message: '输出描述不能为空', trigger: 'blur' }
  ],
  timeLimit: [
    { required: true, message: '时间限制不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '时间限制必须为正数', trigger: 'blur' }
  ],
  memoryLimit: [
    { required: true, message: '内存限制不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '内存限制必须为正数', trigger: 'blur' }
  ],
  stackLimit: [
    { required: true, message: '栈限制不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '栈限制必须为正数', trigger: 'blur' }
  ]
}

// 表单示例处理
const parsedFormExamples = ref<{ input: string, output: string }[]>([])

// 监听examples字段变化
watch(() => problemForm.examples, (newValue) => {
  try {
    parsedFormExamples.value = JSON.parse(newValue)
  } catch (e) {
    parsedFormExamples.value = []
  }
}, { immediate: true })

// ===== 导入题目 =====
const importDialogVisible = ref(false)
const importFile = ref(null)
const importLoading = ref(false)

// ===== 题目预览 =====
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
  fetchProblemList()
  fetchTagOptions()
})

// ===== 方法 =====
// 获取题目列表
const fetchProblemList = async () => {
  loading.value = true
  try {
    const params = {
      limit: pageSize.value,
      currentPage: currentPage.value
    }

    // 可选参数
    if (searchQuery.value?.trim()) {
      params.keyword = searchQuery.value.trim()
    }
    if (filterDifficulty.value !== '') {
      params.difficulty = filterDifficulty.value
    }
    if (filterTag.value) {
      params.tagId = filterTag.value
    }

    console.log('发送请求参数:', params)
    const response = await getProblemList(params)

    if (response?.data?.code === 200) {
      problemList.value = response.data.data.records
      totalProblems.value = response.data.data.total
    } else {
      ElMessage.error(response?.data?.msg || '获取题目列表失败')
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('获取题目列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 获取标签数据
const fetchTagOptions = async () => {
  try {
    const response = await getProblemTagsAndClassification()
    if (response?.data?.code === 200) {
      const data = response.data.data
      const options = []

      data.forEach((category) => {
        category.tagList.forEach((tag) => {
          options.push({
            value: tag.id,
            label: tag.name,
            category: category.classification.name
          })
        })
      })

      tagOptions.value = options
    } else {
      ElMessage.error(response?.data?.msg || '获取标签数据失败')
    }
  } catch (error) {
    console.error('获取标签数据失败:', error)
    ElMessage.error('获取标签数据失败')
  }
}

// 搜索与过滤
const handleSearch = () => {
  currentPage.value = 1
  fetchProblemList()
}

const resetSearch = () => {
  searchQuery.value = ''
  filterDifficulty.value = ''
  filterTag.value = ''
  currentPage.value = 1
  fetchProblemList()
}

const handleFilter = () => {
  currentPage.value = 1
  fetchProblemList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchProblemList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchProblemList()
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

// 难度文本与样式
const getDifficultyText = (difficulty: number) => {
  return difficultyMap[difficulty] || '未知'
}

const getDifficultyType = (difficulty: number) => {
  if (difficulty <= 2) return 'info'
  if (difficulty <= 4) return 'success'
  if (difficulty <= 6) return 'warning'
  return 'danger'
}

// 示例处理
const addExample = () => {
  parsedFormExamples.value.push({ input: '', output: '' })
  updateExamplesJson()
}

const removeExample = (index: number) => {
  parsedFormExamples.value.splice(index, 1)
  updateExamplesJson()
}

const updateExamplesJson = () => {
  problemForm.examples = JSON.stringify(parsedFormExamples.value)
}

// 从examples解析ProblemCase数组
const parseProblemCasesFromExamples = (examplesJson: string): ProblemCase[] => {
  try {
    const examples = JSON.parse(examplesJson)
    return examples.map((example: any, index: number) => ({
      input: example.input || '',
      output: example.output || '',
      score: 0,
      groupNum: index + 1
    }))
  } catch (e) {
    console.error('解析示例失败:', e)
    return []
  }
}

// 表单操作
const router = useRouter()
const handleAddProblem = () => {
  router.push('/admin/problems/create')
}

const resetForm = () => {
  if (problemFormRef.value) {
    problemFormRef.value.resetFields()
  }

  Object.assign(problemForm, {
    id: 0,
    pid: 0,
    problemId: '',
    title: '',
    author: 'root',
    type: 0,
    judgeMode: 'default',
    judgeCaseMode: 'default',
    timeLimit: 1000,
    memoryLimit: 256,
    stackLimit: 128,
    description: '',
    input: '',
    output: '',
    examples: '[]',
    isRemote: false,
    source: '原创题目',
    difficulty: 0,
    hint: '',
    auth: 1,
    ioScore: 100,
    codeShare: true,
    isRemoveEndBlank: true,
    openCaseResult: true
  })
}

const handleEdit = async (row) => {
  dialogType.value = 'edit'

  try {
    const response = await getProblem(row.id)

    if (!response) {
      ElMessage.error('获取题目详情失败：服务器未返回数据')
      return
    }

    if (response?.data?.code === 200) {
      const problemData = response.data.data
      resetForm()

      // 处理不同的返回数据结构
      if (problemData.problem) {
        const problemFields = problemData.problem
        for (const key in problemForm) {
          if (key in problemFields) {
            problemForm[key] = problemFields[key]
          }
        }
        if (problemFields.pid) {
          problemForm.id = problemFields.pid
        }
      } else {
        for (const key in problemForm) {
          if (key in problemData) {
            problemForm[key] = problemData[key]
          }
        }
      }

      dialogVisible.value = true
    } else {
      ElMessage.error(response?.data?.msg || '获取题目详情失败')
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败，请重试')
  }
}

const submitForm = async () => {
  if (!problemFormRef.value) return

  try {
    await problemFormRef.value.validate()
    submitting.value = true

    try {
      JSON.parse(problemForm.examples)
    } catch (e) {
      problemForm.examples = '[]'
    }

    // 构建ProblemDTO对象
    const problemDTO: ProblemDTO = {
      problem: {
        ...problemForm,
        pid: problemForm.id,
        tags: []
      },
      samples: parseProblemCasesFromExamples(problemForm.examples),
      isUploadTestCase: false,
      judgeMode: problemForm.judgeMode || 'default',
      changeModeCode: false,
      changeJudgeCaseMode: false,
      languages: [],
      tags: [],
      codeTemplates: []
    }

    const api = dialogType.value === 'add' ? addProblem : updateProblem
    const response = await api(problemDTO)

    if (response?.data?.code === 200) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchProblemList()
    } else {
      ElMessage.error(response?.data?.msg || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
  } finally {
    submitting.value = false
  }
}

// 删除题目
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除题目 ${row.problemId}: ${row.title} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const response = await deleteProblem(row.id)

        if (response?.data?.code === 200) {
          ElMessage.success('删除成功')
          fetchProblemList()
        } else {
          ElMessage.error(response?.data?.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败，请重试')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 下载评测数据
const handleDownloadTestcase = async (row) => {
  try {
    ElMessage.info(`正在准备下载 ${row.problemId} 的评测数据...`)
    const response = await getProblemCases({ pid: row.id })

    if (response?.data?.code === 200) {
      const testcaseData = response.data.data
      const jsonContent = JSON.stringify(testcaseData, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `testcase_${row.problemId}.json`
      document.body.appendChild(link)

      ElMessage.success(`${row.problemId} 评测数据准备完成，开始下载`)

      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      ElMessage.error(response?.data?.msg || '获取评测数据失败')
    }
  } catch (error) {
    console.error('下载评测数据失败:', error)
    ElMessage.error('下载评测数据失败，请重试')
  }
}

// 导入题目
const handleImport = () => {
  importDialogVisible.value = true
  importFile.value = null
}

const handleFileChange = (file) => {
  if (file?.raw) {
    const fileType = file.raw.name.split('.').pop().toLowerCase()
    if (['json', 'zip'].indexOf(fileType) === -1) {
      ElMessage.warning('请上传JSON或ZIP格式的文件')
      importFile.value = null
      return false
    }
    importFile.value = file.raw
  }
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

const submitImportProblem = async () => {
  if (!importFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }

  importLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', importFile.value)

    // 模拟API调用
    setTimeout(() => {
      ElMessage.success('题目导入成功')
      importDialogVisible.value = false
      fetchProblemList()
      importLoading.value = false
    }, 2000)
  } catch (error) {
    console.error('导入题目失败:', error)
    ElMessage.error('导入题目失败，请检查文件格式')
    importLoading.value = false
  }
}

// 预览题目
const handlePreview = async (row: any) => {
  try {
    ElMessage.info(`正在加载题目 ${row.problemId} 预览...`)
    const response = await getProblem(row.id)

    if (!response) {
      ElMessage.error('获取题目详情失败：服务器未返回数据')
      return
    }

    if (response?.data?.code === 200) {
      previewProblem.value = response.data.data
      previewDialogVisible.value = true
    } else {
      ElMessage.error(response?.data?.msg || '获取题目详情失败')
    }
  } catch (error: any) {
    console.error('获取题目详情失败:', error)
    const errorMsg = error.response ?
      `获取题目详情失败: ${error.response.status} ${error.response.statusText}` :
      `获取题目详情失败: ${error.message || '未知错误'}`
    ElMessage.error(errorMsg)
  }
}
</script>

<style scoped>
/* ===== Markdown 样式 ===== */
.preview-section :deep(h1) {
  font-size: 1.8em;
  margin: 1em 0 0.5em;
}

.preview-section :deep(h2) {
  font-size: 1.6em;
  margin: 1em 0 0.5em;
}

.preview-section :deep(h3) {
  font-size: 1.4em;
  margin: 1em 0 0.5em;
}

.preview-section :deep(p) {
  margin: 0.5em 0;
  line-height: 1.6;
}

.preview-section :deep(ul),
.preview-section :deep(ol) {
  padding-left: 2em;
  margin: 0.5em 0;
}

.preview-section :deep(li) {
  margin: 0.3em 0;
}

.preview-section :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
}

.preview-section :deep(pre) {
  margin: 0.5em 0;
  padding: 0.5em;
  background-color: #f6f8fa;
  border-radius: 4px;
  overflow-x: auto;
}

.preview-section :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.preview-section :deep(blockquote) {
  margin: 0.5em 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

.preview-section :deep(table) {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.preview-section :deep(th),
.preview-section :deep(td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.preview-section :deep(th) {
  background-color: #f6f8fa;
}

.preview-section :deep(.katex) {
  font-size: 1.1em;
}

/* ===== 示例样式 ===== */
.examples-container {
  margin-top: 10px;
}

.examples-container .example-item {
  border: 1px solid #ebeef5;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #f9fafb;
}

.examples-container .example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 500;
}

.nested-form-item {
  margin-bottom: 15px;
  margin-left: 0;
}

:deep(.nested-form-item .el-form-item__label) {
  padding-right: 8px;
  color: #606266;
}

/* ===== 布局样式 ===== */
.problems-container {
  margin-bottom: 20px;
}

.problems-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
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

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
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

/* ===== 搜索和筛选区域 ===== */
.search-area {
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
}

.search-area .el-input {
  width: 300px;
}

.filter-area {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.filter-area .el-select {
  width: 150px;
}

/* ===== 分页样式 ===== */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* ===== 对话框样式 ===== */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #eee;
  padding: 15px 20px;
}

:deep(.el-dialog__body) {
  padding: 25px 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #eee;
  padding: 15px 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* ===== 表单样式 ===== */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

.limits-container {
  display: flex;
  gap: 20px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.limit-unit {
  color: #606266;
}

/* ===== 导入题目样式 ===== */
.import-guide {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  padding: 0 15px;
}

.import-guide ol {
  padding-left: 20px;
}

.import-actions {
  padding: 20px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

:deep(.el-upload) {
  width: auto;
}

:deep(.el-upload-list) {
  margin-top: 10px;
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