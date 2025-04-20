<template>
  <div class="add-problem-container">
    <el-card class="add-problem-card">
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <DocumentAdd />
            </el-icon>
            <span>{{ isEdit ? '编辑题目' : '添加题目' }}</span>
          </div>
          <div class="header-actions">
            <el-button @click="$router.push('/admin/problems/list')">返回列表</el-button>
          </div>
        </div>
      </template>

      <!-- 表单部分 -->
      <el-form ref="problemFormRef" :model="problemForm" :rules="problemRules" label-width="120px" class="problem-form">
        <!-- 基本信息部分 -->
        <el-divider content-position="left">基本信息</el-divider>
        <div class="form-row">
          <el-form-item label="题目ID" prop="problemId" required>
            <el-input v-model="problemForm.problemId" placeholder="请输入题目ID，如 HOJ-1001" />
          </el-form-item>
          <el-form-item label="题目标题" prop="title" required>
            <el-input v-model="problemForm.title" placeholder="请输入题目标题" />
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="作者" prop="modifiedUser">
            <el-input v-model="problemForm.modifiedUser" placeholder="请输入作者名称" />
          </el-form-item>
          <el-form-item label="来源" prop="source">
            <el-input v-model="problemForm.source" placeholder="请输入题目来源" />
          </el-form-item>
        </div>

        <!-- 标签管理部分 -->
        <el-divider content-position="left">标签管理</el-divider>
        <div class="tags-section">
          <div class="tags-header">
            <span class="tags-title">题目标签</span>
            <el-button type="primary" size="small" @click="showTagInputDialog">
              <el-icon>
                <Plus />
              </el-icon>添加标签
            </el-button>
          </div>

          <!-- 当前已选标签展示 -->
          <div class="tags-container">
            <template v-if="selectedTags.length > 0">
              <div v-for="(groupTags, category) in groupedSelectedTags" :key="category" class="tag-category">
                <div class="tag-category-title">{{ category }}</div>
                <div class="tag-category-content">
                  <el-tag v-for="tag in groupTags" :key="tag.id || tag.name"
                    :style="{ backgroundColor: tag.color, color: getContrastTextColor(tag.color) }" class="tag-item"
                    closable @close="removeTag(tag)">
                    {{ tag.name }}
                  </el-tag>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无标签" :image-size="60" />
          </div>
        </div>

        <!-- 判题设置 -->
        <el-divider content-position="left">判题设置</el-divider>
        <div class="form-row">
          <el-form-item label="判题模式" prop="judgeMode">
            <el-select v-model="problemForm.judgeMode" placeholder="请选择判题模式">
              <el-option v-for="item in judgeModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="测试点模式" prop="judgeCaseMode">
            <el-select v-model="problemForm.judgeCaseMode" placeholder="请选择测试点模式">
              <el-option v-for="item in judgeCaseModeOptions" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="时间限制(ms)" prop="timeLimit" required>
            <el-input-number v-model="problemForm.timeLimit" :min="100" :max="30000" :step="100" />
          </el-form-item>
          <el-form-item label="内存限制(MB)" prop="memoryLimit" required>
            <el-input-number v-model="problemForm.memoryLimit" :min="32" :max="1024" :step="32" />
          </el-form-item>
          <el-form-item label="栈限制(MB)" prop="stackLimit">
            <el-input-number v-model="problemForm.stackLimit" :min="32" :max="1024" :step="32" />
          </el-form-item>
        </div>

        <!-- 题目描述 -->
        <el-divider content-position="left">题目描述</el-divider>
        <el-form-item label="题目描述" prop="description" required>
          <div class="markdown-editor-container">
            <div class="editor-wrapper">
              <el-input v-model="problemForm.description" type="textarea" :rows="10" placeholder="支持Markdown语法"
                class="markdown-editor" />
            </div>
            <div class="preview-wrapper">
              <div class="preview-title">预览</div>
              <div class="markdown-preview" v-html="renderedDescription"></div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="输入描述" prop="input" required>
          <div class="markdown-editor-container">
            <div class="editor-wrapper">
              <el-input v-model="problemForm.input" type="textarea" :rows="5" placeholder="请描述输入格式"
                class="markdown-editor" />
            </div>
            <div class="preview-wrapper">
              <div class="preview-title">预览</div>
              <div class="markdown-preview" v-html="renderedInput"></div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="输出描述" prop="output" required>
          <div class="markdown-editor-container">
            <div class="editor-wrapper">
              <el-input v-model="problemForm.output" type="textarea" :rows="5" placeholder="请描述输出格式"
                class="markdown-editor" />
            </div>
            <div class="preview-wrapper">
              <div class="preview-title">预览</div>
              <div class="markdown-preview" v-html="renderedOutput"></div>
            </div>
          </div>
        </el-form-item>

        <!-- 示例部分 -->
        <el-divider content-position="left">输入输出示例</el-divider>
        <div class="examples-container">
          <div class="examples-header">
            <el-button type="primary" size="small" @click="addExample">
              <el-icon>
                <Plus />
              </el-icon>添加示例
            </el-button>
          </div>

          <div v-for="(example, index) in parsedFormExamples" :key="index" class="example-item">
            <div class="example-header">
              <span>示例 {{ index + 1 }}</span>
              <el-button type="danger" size="small" @click="removeExample(index)"
                :disabled="parsedFormExamples.length <= 1">
                <el-icon>
                  <Delete />
                </el-icon>删除
              </el-button>
            </div>
            <div class="example-content">
              <div class="example-input">
                <el-form-item class="nested-form-item" :label="'输入'" :prop="`examples.${index}.input`">
                  <el-input v-model="example.input" type="textarea" :rows="5" placeholder="输入样例"
                    @input="updateExamplesJson" />
                </el-form-item>
              </div>
              <div class="example-output">
                <el-form-item class="nested-form-item" :label="'输出'" :prop="`examples.${index}.output`">
                  <el-input v-model="example.output" type="textarea" :rows="5" placeholder="输出样例"
                    @input="updateExamplesJson" />
                </el-form-item>
              </div>
            </div>
          </div>
        </div>

        <!-- 代码模板 -->
        <el-divider content-position="left">代码模板</el-divider>
        <div class="code-templates-section">
          <div class="language-tabs">
            <el-tabs v-model="activeLanguage" type="card">
              <el-tab-pane v-for="lang in languages" :key="lang.value" :label="lang.name" :name="lang.name">
                <el-input v-model="codeTemplates[lang.name]" type="textarea" :rows="10" class="code-editor" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 提示和备注 -->
        <el-divider content-position="left">提示和备注</el-divider>
        <el-form-item label="提示" prop="hint">
          <div class="markdown-editor-container">
            <div class="editor-wrapper">
              <el-input v-model="problemForm.hint" type="textarea" :rows="5" placeholder="提示信息（可选）"
                class="markdown-editor" />
            </div>
            <div class="preview-wrapper">
              <div class="preview-title">预览</div>
              <div class="markdown-preview" v-html="renderedHint"></div>
            </div>
          </div>
        </el-form-item>
        <!-- 测试用例数据 -->
        <el-divider content-position="left">测试用例数据</el-divider>
        <div class="testcase-section">
          <div class="testcase-options">
            <el-radio-group v-model="testcaseInputMethod">
              <el-radio label="manual">手动输入</el-radio>
              <el-radio label="upload">上传文件</el-radio>
            </el-radio-group>
          </div>

          <!-- 手动输入测试用例 -->
          <div v-if="testcaseInputMethod === 'manual'" class="manual-testcases">
            <div v-for="(testcase, index) in testcases" :key="index" class="testcase-item">
              <div class="testcase-header">
                <span>测试点 {{ index + 1 }}</span>
                <div class="testcase-actions">
                  <el-button type="danger" size="small" @click="removeTestcase(index)"
                    :disabled="testcases.length <= 1">
                    <el-icon>
                      <Delete />
                    </el-icon>删除
                  </el-button>
                </div>
              </div>
              <div class="testcase-content">
                <div class="testcase-input">
                  <el-form-item :label="'输入'" :prop="`testcases[${index}].input`">
                    <el-input v-model="testcase.input" type="textarea" :rows="4" placeholder="输入数据" />
                  </el-form-item>
                </div>
                <div class="testcase-output">
                  <el-form-item :label="'输出'" :prop="`testcases[${index}].output`">
                    <el-input v-model="testcase.output" type="textarea" :rows="4" placeholder="期望输出" />
                  </el-form-item>
                </div>
              </div>
              <el-form-item :label="'描述'" :prop="`testcases[${index}].description`">
                <el-input v-model="testcase.description" placeholder="测试用例描述，如：基础测试用例、边界测试等" />
              </el-form-item>
            </div>
            <div class="testcase-add-btn">
              <el-button type="primary" @click="addTestcase" plain>
                <el-icon>
                  <Plus />
                </el-icon>添加测试点
              </el-button>
            </div>
          </div>

          <!-- 上传测试用例文件 -->
          <div v-else class="upload-testcases">
            <el-upload class="testcase-uploader" action="" :auto-upload="false" :on-change="handleTestcaseUpload"
              :on-remove="handleTestcaseRemove" :file-list="fileList" :limit="1">
              <el-button type="primary">
                <el-icon>
                  <Upload />
                </el-icon>选择文件
              </el-button>
              <template #tip>
                <div class="el-upload__tip">上传zip格式的测试用例文件，包含输入和输出数据</div>
              </template>
            </el-upload>
          </div>
        </div>

        <!-- 底部按钮区域 -->
        <el-divider />
        <div class="form-actions">
          <el-button type="primary" @click="submitProblem" :loading="submitting" size="large">
            {{ isEdit ? '保存修改' : '提交题目' }}
          </el-button>
          <el-button @click="confirmReset" size="large">重置表单</el-button>
        </div>

      </el-form>
    </el-card>

    <!-- 添加标签对话框 -->
    <el-dialog title="添加标签" v-model="tagDialogVisible" width="500px" @close="resetTagForm">
      <div class="tag-dialog-content">
        <!-- 标签选择模式切换 -->
        <div class="tag-mode-selector">
          <el-radio-group v-model="tagMode" size="large">
            <el-radio-button label="select">选择已有标签</el-radio-button>
            <el-radio-button label="create">创建新标签</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 选择已有标签 -->
        <div v-if="tagMode === 'select'" class="existing-tags-container">
          <!-- 分类筛选下拉框 -->
          <el-select v-model="selectedCategory" clearable placeholder="按分类筛选标签" class="category-filter">
            <el-option v-for="category in availableCategories" :key="category" :label="category" :value="category" />
          </el-select>

          <!-- 按分类展示可选标签 -->
          <div class="available-tags">
            <div v-for="(categoryTags, category) in filteredTagsByCategory" :key="category" class="tag-category">
              <div class="tag-category-title">{{ category }}</div>
              <div class="tag-category-content">
                <el-tag v-for="tag in categoryTags" :key="tag.id || tag.name"
                  :style="{ backgroundColor: tag.color, color: getContrastTextColor(tag.color) }"
                  class="tag-item available-tag" @click="selectExistingTag(tag)" :disabled="isTagSelected(tag)">
                  {{ tag.name }}
                  <el-icon v-if="isTagSelected(tag)" class="tag-selected-icon">
                    <Check />
                  </el-icon>
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 创建新标签 -->
        <el-form v-else ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="100px">
          <el-form-item label="标签名称" prop="name">
            <el-input v-model="tagForm.name" placeholder="例如：数组、哈希表、动态规划" />
          </el-form-item>

          <!-- 标签分类选择 -->
          <el-form-item label="标签分类" prop="category">
            <el-select v-model="tagForm.category" placeholder="请选择标签分类" filterable>
              <el-option v-for="item in tagCategories" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>

          <!-- 标签颜色 -->
          <el-form-item label="标签颜色" prop="color">
            <el-input v-model="tagForm.color">
              <template #append>
                <el-color-picker v-model="tagForm.color" show-alpha color-format="hex" @change="handleTagColorChange" />
              </template>
            </el-input>
          </el-form-item>

          <!-- 标签预览 -->
          <el-form-item label="预览">
            <div class="tag-preview">
              <el-tag :style="{ backgroundColor: tagForm.color, color: getContrastTextColor(tagForm.color) }">
                {{ tagForm.name || '标签预览' }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="tagDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="tagMode === 'create' ? addTag() : closeTagDialog()"
            :loading="tagSubmitting">
            {{ tagMode === 'create' ? '创建并添加' : '完成选择' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="adminProblemsCreate">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Plus, Delete, DocumentAdd, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { addProblem, getProblem, updateProblem } from '@/api/admin'
import { getProblemTagsAndClassification } from '@/api/problem'
import { ProblemDTO } from '@/api/admin/type'
import { Tag } from '@/api/problem/type'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'

// ===== 路由和基础状态 =====
const router = useRouter()
const route = useRoute()
const isEdit = computed(() => route.params.id !== undefined)
const problemFormRef = ref<FormInstance>()
const submitting = ref(false)

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
const renderMarkdown = (content: string) => {
  if (!content) return ''
  return md.render(content)
}

// ===== 题目表单数据 =====
const problemForm = reactive({
  id: 0,
  pid: 0,
  problemId: '',
  title: '',
  modifiedUser: 'root',
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
    { required: true, message: '请输入题目ID', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9\-_]+$/, message: '题目ID只能包含字母、数字、下划线和短横线', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' },
    { min: 2, max: 100, message: '题目标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入题目描述', trigger: 'blur' }
  ],
  timeLimit: [
    { required: true, message: '请输入时间限制', trigger: 'blur' },
    { type: 'number', min: 100, max: 30000, message: '时间限制应在100-30000之间', trigger: 'blur' }
  ],
  memoryLimit: [
    { required: true, message: '请输入内存限制', trigger: 'blur' },
    { type: 'number', min: 32, max: 1024, message: '内存限制应在32-1024之间', trigger: 'blur' }
  ]
}

// ===== 判题模式选项 =====
const judgeModeOptions = [
  { label: '默认模式', value: 'default' },
  { label: 'Special Judge', value: 'special' },
  { label: '交互题', value: 'interactive' }
]

const judgeCaseModeOptions = [
  { label: '默认模式', value: 'default' },
  { label: '子任务模式', value: 'subtask' }
]

// 支持的编程语言
const languages = [
  { name: 'C', value: 'c' },
  { name: 'C++', value: 'cpp' },
  { name: 'Java', value: 'java' },
  { name: 'Python', value: 'python' },
]
const activeLanguage = ref(languages[0].name)
const codeTemplates = reactive({
  'C': `#include <stdio.h>\n\nint main() {\n    // 在此处编写代码\n    \n    return 0;\n}`,
  'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在此处编写代码\n    \n    return 0;\n}`,
  'Java': `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // 在此处编写代码\n        \n    }\n}`,
  'Python': `# 在此处编写代码\n\ndef main():\n    # 主函数\n    pass\n\nif __name__ == \"__main__\":\n    main()`
})

// ===== 标签管理相关 =====
// 标签模式：选择已有标签或创建新标签
const tagMode = ref('select')
// 现有标签数据
const allAvailableTags = ref<Tag[]>([])
// 标签分类数据
const tagCategories = ref<Array<{ id: number, name: string, oj: string, rank?: number }>>([])
// 选择已有标签时的分类过滤
const selectedCategory = ref('')

// 选中的标签列表
const selectedTags = ref<Array<{
  id?: number;
  name: string;
  oj: string;
  color: string;
  tcid?: number;
  category?: string;
}>>([])

// 标签对话框状态
const tagDialogVisible = ref(false)
const tagSubmitting = ref(false)
const tagFormRef = ref<FormInstance>()

// 标签表单数据
const tagForm = reactive({
  name: '',
  oj: 'ME',
  color: '#409EFF',
  tcid: undefined as number | undefined,
  category: ''
})

// 标签表单验证规则
const tagRules = {
  name: [
    { required: true, message: '标签名称不能为空', trigger: 'blur' },
    { max: 20, message: '标签名称不能超过20个字符', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择颜色', trigger: 'change' },
    { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, message: '请输入有效的颜色代码', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择标签分类', trigger: 'change' }
  ]
}

// 测试用例相关
const testcaseInputMethod = ref('manual')
const fileList = ref([])
const testcases = ref([
  { input: '', output: '', description: '基础测试用例' }
])

// 添加测试用例
const addTestcase = () => {
  testcases.value.push({
    input: '',
    output: '',
    description: `测试用例 ${testcases.value.length + 1}`
  })
}

// 移除测试用例
const removeTestcase = (index) => {
  testcases.value.splice(index, 1)
}

// 处理测试用例文件上传
const handleTestcaseUpload = (file) => {
  // 这里可以验证文件类型
  if (file.raw.type !== 'application/zip' && !file.name.endsWith('.zip')) {
    ElMessage.error('请上传zip格式的测试用例文件')
    fileList.value = []
    return false
  }
  fileList.value = [file]
  return false // 阻止自动上传
}

// 处理测试用例文件移除
const handleTestcaseRemove = () => {
  fileList.value = []
}

// 表单重置确认
const confirmReset = () => {
  ElMessageBox.confirm('确定要重置表单吗？所有已填写的内容将会丢失。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    resetForm()
  }).catch(() => {
    // 取消重置
  })
}

// 重置表单
const resetForm = () => {
  // 重置主表单
  if (problemFormRef.value) {
    problemFormRef.value.resetFields()
  }

  // 重置测试用例
  testcases.value = [{ input: '', output: '', description: '基础测试用例' }]

  // 重置标签
  selectedTags.value = []

  // 重置代码模板
  Object.assign(codeTemplates, {
    'C': `#include <stdio.h>\n\nint main() {\n    // 在此处编写代码\n    \n    return 0;\n}`,
    'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在此处编写代码\n    \n    return 0;\n}`,
    'Java': `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // 在此处编写代码\n        \n    }\n}`,
    'Python': `# 在此处编写代码\n\ndef main():\n    # 主函数\n    pass\n\nif __name__ == \"__main__\":\n    main()`
  })

  ElMessage.success('表单已重置')
}

// ===== 计算属性 =====
// 获取可用的标签分类
const availableCategories = computed(() => {
  const categories = [...new Set(allAvailableTags.value.map(tag => tag.category))]
  return categories.filter(Boolean) // 过滤掉undefined或null
})

// 按分类过滤标签
const filteredTagsByCategory = computed(() => {
  const result = {}

  // 先按分类分组所有标签
  allAvailableTags.value.forEach(tag => {
    if (!tag.category) return

    if (!result[tag.category]) {
      result[tag.category] = []
    }

    result[tag.category].push(tag)
  })

  // 如果选择了分类过滤，只返回该分类的标签
  if (selectedCategory.value) {
    return { [selectedCategory.value]: result[selectedCategory.value] || [] }
  }

  return result
})

// 已选标签按分类分组
const groupedSelectedTags = computed(() => {
  const result = {}

  selectedTags.value.forEach(tag => {
    const category = tag.category || '未分类'

    if (!result[category]) {
      result[category] = []
    }

    result[category].push(tag)
  })

  return result
})

// 实时渲染的Markdown
const renderedDescription = computed(() => renderMarkdown(problemForm.description))
const renderedInput = computed(() => renderMarkdown(problemForm.input))
const renderedOutput = computed(() => renderMarkdown(problemForm.output))
const renderedHint = computed(() => renderMarkdown(problemForm.hint))

// 表单示例处理
const parsedFormExamples = ref<{ input: string, output: string }[]>([])
watch(() => problemForm.examples, (newValue) => {
  try {
    parsedFormExamples.value = JSON.parse(newValue)
  } catch (e) {
    parsedFormExamples.value = []
  }
}, { immediate: true })

// ===== 生命周期钩子 =====
onMounted(() => {
  // 添加一个默认样例
  if (parsedFormExamples.value.length === 0) {
    addExample()
  }

  // 如果是编辑模式，加载题目数据
  if (isEdit.value && route.params.id) {
    loadProblemData(Number(route.params.id))
  }

  // 获取所有标签和分类
  fetchAllTagsAndCategories()
})

// ===== 方法：标签管理 =====
// 获取所有标签和分类
const fetchAllTagsAndCategories = async () => {
  try {
    const response = await getProblemTagsAndClassification()
    if (response.data && response.data.code === 200) {
      const data = response.data.data

      // 清空现有数据
      allAvailableTags.value = []
      tagCategories.value = []

      if (data && Array.isArray(data)) {
        // 处理分类和标签数据
        data.forEach(item => {
          if (item.classification) {
            // 添加分类
            tagCategories.value.push({
              id: item.classification.id,
              name: item.classification.name,
              oj: item.classification.oj,
              rank: item.classification.rank
            })

            // 添加该分类下的标签
            if (item.tagList && Array.isArray(item.tagList)) {
              item.tagList.forEach(tag => {
                allAvailableTags.value.push({
                  id: tag.id,
                  name: tag.name,
                  oj: tag.oj || 'ME',
                  color: tag.color || '#409EFF',
                  category: item.classification.name,
                  tcid: tag.tcid
                })
              })
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('获取标签数据失败:', error)
    ElMessage.error('获取标签数据失败')
  }
}

// 检查标签是否已被选择
const isTagSelected = (tag: any) => {
  return selectedTags.value.some(t =>
    t.id === tag.id || (t.name === tag.name && t.category === tag.category)
  )
}

// 选择已有标签
const selectExistingTag = (tag: any) => {
  if (isTagSelected(tag)) return

  selectedTags.value.push({
    id: tag.id,
    name: tag.name,
    oj: tag.oj || 'ME',
    color: tag.color || '#409EFF',
    category: tag.category,
    tcid: tag.tcid
  })

  ElMessage.success(`已添加标签: ${tag.name}`)
}

// 添加标签
const addTag = async () => {
  if (!tagFormRef.value) return

  try {
    await tagFormRef.value.validate()
    tagSubmitting.value = true

    // 检查标签是否已存在
    const isExisting = selectedTags.value.some(tag =>
      tag.name === tagForm.name && tag.category === tagForm.category
    )

    if (isExisting) {
      ElMessage.warning('该标签已添加')
      tagSubmitting.value = false
      return
    }

    // 查找分类ID
    let tcid = tagForm.tcid
    if (tagForm.category && !tcid) {
      const classification = tagCategories.value.find(c => c.name === tagForm.category)
      tcid = classification ? classification.id : undefined
    }

    // 添加到已选标签
    selectedTags.value.push({
      name: tagForm.name,
      oj: 'ME',
      color: tagForm.color,
      tcid,
      category: tagForm.category
    })

    ElMessage.success('标签添加成功')
    tagDialogVisible.value = false
    resetTagForm()
  } catch (error) {
    console.error('添加标签失败:', error)
    ElMessage.error('添加标签失败')
  } finally {
    tagSubmitting.value = false
  }
}

// 移除标签
const removeTag = (tag: any) => {
  const index = selectedTags.value.findIndex(item =>
    (item.id && tag.id && item.id === tag.id) ||
    (item.name === tag.name && item.category === tag.category)
  )

  if (index !== -1) {
    selectedTags.value.splice(index, 1)
    ElMessage.success('标签移除成功')
  }
}

// 显示添加标签对话框
const showTagInputDialog = () => {
  tagMode.value = 'select'
  resetTagForm()
  tagDialogVisible.value = true
}

// 关闭标签对话框
const closeTagDialog = () => {
  tagDialogVisible.value = false
}

// 重置标签表单
const resetTagForm = () => {
  if (tagFormRef.value) {
    tagFormRef.value.resetFields()
  }

  Object.assign(tagForm, {
    name: '',
    oj: 'ME',
    color: '#409EFF',
    tcid: undefined,
    category: ''
  })
}

// 标签颜色选择器变化处理函数
const handleTagColorChange = (color: string) => {
  if (color && !color.startsWith('#')) {
    tagForm.color = color.startsWith('rgba') || color.startsWith('rgb')
      ? rgbToHex(color)
      : `#${color}`
  }
}

// 根据背景颜色计算文本颜色
const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000'

  let hex = hexColor.substring(1)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return (yiq >= 128) ? '#000000' : '#FFFFFF'
}

// RGB颜色转十六进制
const rgbToHex = (rgb: string): string => {
  const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d?\.?\d*))?\)/
  const match = rgb.match(rgbRegex)

  if (!match) return '#000000'

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// ===== 方法：题目管理 =====
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

// 加载题目数据（编辑模式）
const loadProblemData = async (id: number) => {
  try {
    const response = await getProblem(id)
    if (response?.data?.code === 200) {
      const problemData = response.data.data

      if (problemData.problem) {
        // 处理题目基本信息
        Object.assign(problemForm, problemData.problem)

        // 处理示例
        if (problemData.problem.examples) {
          try {
            parsedFormExamples.value = JSON.parse(problemData.problem.examples)
          } catch (e) {
            parsedFormExamples.value = []
          }
        }

        // 处理代码模板
        if (problemData.codeTemplates && Array.isArray(problemData.codeTemplates)) {
          problemData.codeTemplates.forEach(template => {
            const lang = languages.find(l => l.value === template.language.toLowerCase())
            if (lang) {
              codeTemplates[lang.name] = template.code
            }
          })
        }

        // 处理标签
        if (problemData.tags && Array.isArray(problemData.tags)) {
          selectedTags.value = problemData.tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            oj: tag.oj || 'ME',
            color: tag.color || '#409EFF',
            tcid: tag.tcid,
            category: tag.category
          }))
        }
      }

      ElMessage.success('题目数据加载成功')
    } else {
      ElMessage.error(response?.data?.msg || '获取题目数据失败')
    }
  } catch (error) {
    console.error('获取题目数据失败:', error)
    ElMessage.error('获取题目数据失败，请重试')
  }
}

// 提交题目
const submitProblem = async () => {
  if (!problemFormRef.value) return

  try {
    await problemFormRef.value.validate()
    submitting.value = true

    // 准备测试用例数据
    const sampleTestcases = parsedFormExamples.value.map((example, index) => ({
      input: example.input || '',
      output: example.output || '',
      description: `示例 ${index + 1}`
    }))

    // 构建ProblemDTO对象
    const problemDTO: ProblemDTO = {
      problem: {
        ...problemForm,
        pid: problemForm.id,
        isFileIO: false,
        isUploadCase: testcaseInputMethod.value === 'upload',
      },
      samples: testcases.value.map(tc => ({
        input: tc.input || '',
        output: tc.output || '',
        description: tc.description || '基础测试用例'
      })),
      isUploadTestCase: false,
      uploadTestcaseDir: '',
      judgeMode: problemForm.judgeMode || 'default',
      changeModeCode: false,
      changeJudgeCaseMode: false,
      languages: [
        { name: 'C++', description: 'G++ 9.4.0' },
        { name: 'Java', description: 'OpenJDK 1.8' },
        { name: 'Python3', description: 'Python 3.7.5' }
      ],
      tags: selectedTags.value.map(tag => ({
        name: tag.name,
        oj: tag.oj || 'LOCAL'
      })),
      codeTemplates: Object.entries(codeTemplates).map(([langName, code]) => {
        let lid = 0;
        if (langName === 'C++') lid = 3;
        else if (langName === 'C') lid = 2;
        else if (langName === 'Java') lid = 9;
        else if (langName === 'Python') lid = 14;

        return {
          language: langName,
          lid,
          code
        }
      })
    }

    // 调用API
    const api = isEdit.value ? updateProblem : addProblem;
    const response = await api(problemDTO);

    if (response?.data?.code === 200) {
      ElMessage.success(isEdit.value ? '更新题目成功' : '添加题目成功');
      router.push('/admin/problems/list');
    } else {
      ElMessage.error(response?.data?.msg || (isEdit.value ? '更新题目失败' : '添加题目失败'));
    }
  } catch (error) {
    console.error('提交题目失败:', error);
    ElMessage.error(isEdit.value ? '更新题目失败' : '添加题目失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
/* 测试用例部分样式 */
.testcase-section {
  margin-top: 10px;
  margin-bottom: 20px;
}

.testcase-options {
  margin-bottom: 15px;
}

.testcase-item {
  border: 1px solid #ebeef5;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #f9fafb;
}

.testcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 500;
}

.testcase-content {
  display: flex;
  gap: 20px;
}

.testcase-input,
.testcase-output {
  flex: 1;
  min-width: 200px;
}

.testcase-add-btn {
  text-align: center;
  margin: 10px 0;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  gap: 20px;
}

/* 卡片和表单布局 */
.add-problem-container {
  margin-bottom: 20px;
}

.add-problem-card {
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

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.form-row .el-form-item {
  flex: 1;
  min-width: 200px;
}

/* Markdown编辑器 */
.markdown-editor-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.editor-wrapper {
  flex: 1;
  min-width: 300px;
}

.preview-wrapper {
  flex: 1;
  min-width: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  overflow-y: auto;
}

.preview-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px dashed #e0e0e0;
}

.markdown-editor {
  width: 100%;
  font-family: 'Consolas', monospace;
}

.markdown-preview {
  padding: 10px;
  min-height: 100px;
  line-height: 1.6;
}

/* 标签相关样式 */
.tags-section {
  margin-bottom: 20px;
}

.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.tags-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  min-height: 50px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.tag-category {
  margin-bottom: 12px;
}

.tag-category-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
  font-weight: 500;
}

.tag-category-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-mode-selector {
  margin-bottom: 20px;
  text-align: center;
}

.category-filter {
  width: 100%;
  margin-bottom: 15px;
}

.available-tags {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}

.available-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.available-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.tag-selected-icon {
  margin-left: 3px;
  font-size: 12px;
}

.existing-tags-container {
  margin-top: 15px;
}

.tag-preview {
  margin-top: 5px;
}

/* 示例部分 */
.examples-container {
  margin-top: 10px;
}

.examples-header {
  margin-bottom: 15px;
}

.example-item {
  border: 1px solid #ebeef5;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #f9fafb;
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 500;
}

.example-content {
  display: flex;
  gap: 20px;
}

.example-input,
.example-output {
  flex: 1;
  min-width: 200px;
}

.nested-form-item {
  margin-bottom: 0;
}

/* 代码模板 */
.code-editor {
  font-family: 'Consolas', monospace;
  line-height: 1.5;
}
</style>