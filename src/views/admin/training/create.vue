<template>
  <div class="add-training-container">
    <el-card class="add-training-card">
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <Reading />
            </el-icon>
            <span>{{ isEdit ? '编辑训练' : '创建训练' }}</span>
          </div>
          <div class="header-actions">
            <el-button @click="$router.push('/admin/training/list')">返回列表</el-button>
          </div>
        </div>
      </template>

      <!-- 表单部分 -->
      <el-form ref="trainingFormRef" :model="trainingForm" :rules="trainingRules" label-width="120px"
        class="training-form">
        <!-- 基本信息部分 -->
        <el-divider content-position="left">基本信息</el-divider>
        <div class="form-row">
          <el-form-item label="训练标题" prop="title" required>
            <el-input v-model="trainingForm.title" placeholder="请输入训练标题" />
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="作者" prop="author">
            <el-input v-model="trainingForm.author" placeholder="请输入作者名称" />
          </el-form-item>
          <el-form-item label="训练分类" prop="category">
            <el-select v-model="categoryId" placeholder="请选择分类" style="width: 100%">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id">
                <div class="category-option">
                  <div class="color-block" :style="{ backgroundColor: item.color }"></div>
                  <span>{{ item.name }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <!-- 训练排序与权限 -->
        <div class="form-row">
          <el-form-item label="显示顺序" prop="rank">
            <el-input-number v-model="trainingForm.rank" :min="1" :controls="true" />
          </el-form-item>
          <el-form-item label="训练权限" prop="auth">
            <el-select v-model="trainingForm.auth" placeholder="请选择权限" style="width: 100%">
              <el-option label="公开训练" value="Public" />
              <el-option label="私有训练" value="Private" />
            </el-select>
          </el-form-item>
          <el-form-item label="训练状态" prop="status">
            <el-switch v-model="trainingForm.status" />
            <span class="status-text">{{ trainingForm.status ? '可用' : '不可用' }}</span>
          </el-form-item>
        </div>

        <!-- 训练描述 -->
        <el-divider content-position="left">训练描述</el-divider>
        <el-form-item label="训练描述" prop="description" required>

          <div class="markdown-editor-container">
            <div class="editor-toolbar">
              <el-button-group class="toolbar-group">
                <el-tooltip content="粗体" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('**粗体**')">
                    <el-icon>
                      <Bold />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="斜体" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('*斜体*')">
                    <el-icon>
                      <Italic />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="标题" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('## 标题')">
                    <el-icon>
                      <TopRight />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="无序列表" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('- 列表项\n- 列表项')">
                    <el-icon>
                      <List />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="有序列表" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('1. 有序项\n2. 有序项')">
                    <el-icon>
                      <Menu />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="插入链接" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('[链接文本](https://example.com)')">
                    <el-icon>
                      <Link />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="插入图片" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('![图片描述](图片链接)')">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="插入代码块" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('```\n代码块\n```')">
                    <el-icon>
                      <Document />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="插入数学公式" placement="top" effect="light">
                  <el-button size="small" @click="insertMarkdown('$数学公式$')">
                    <el-icon>
                      <DataAnalysis />
                    </el-icon>
                  </el-button>
                </el-tooltip>
              </el-button-group>
            </div>
            <div class="editor-wrapper">
              <el-input v-model="trainingForm.description" type="textarea" :rows="15"
                placeholder="支持Markdown语法，可以添加代码、数学公式、图片等" class="markdown-editor" ref="descriptionEditor" />
            </div>
            <div class="preview-wrapper">
              <div class="preview-title">预览</div>
              <div class="markdown-preview markdown-body" v-html="renderedDescription"></div>
            </div>
          </div>
        </el-form-item>

        <!-- 底部按钮区域 -->
        <el-divider />
        <div class="form-actions">
          <el-button type="primary" @click="submitTraining" :loading="submitting" size="large">
            {{ isEdit ? '保存修改' : '创建训练' }}
          </el-button>
          <el-button @click="confirmReset" size="large">重置表单</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="adminTrainingCreate">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Reading, Edit as Bold, Promotion as Italic, TopRight, List,
  Menu, Link, Picture, Document, DataAnalysis
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { addTraining, getTraining, getTrainingCategoryList, updateTraining } from '@/api/admin'
import { TrainingDTO } from '@/api/admin/type'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
// import 'github-markdown-css/github-markdown.css'

// ===== 路由和基础状态 =====
const router = useRouter()
const route = useRoute()
const isEdit = computed(() => route.params.id !== undefined)
const trainingFormRef = ref<FormInstance>()
const submitting = ref(false)
const descriptionEditor = ref(null)

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

// 在光标位置插入Markdown语法
const insertMarkdown = (text: string) => {
  if (!descriptionEditor.value) return

  const textarea = descriptionEditor.value.$el.querySelector('textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const currentValue = trainingForm.description

  // 在光标位置插入文本
  trainingForm.description = currentValue.substring(0, start) + text + currentValue.substring(end)

  // 恢复焦点并设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.selectionStart = textarea.selectionEnd = start + text.length
  }, 0)
}

// ===== 表单数据 =====
const trainingForm = reactive({
  id: 0,
  title: '',
  description: '',
  author: 'root',
  auth: 'Public',
  status: true,
  rank: 1
})

const categoryOptions = ref<TrainingCategory[]>([])

// 添加获取分类列表的方法
const fetchCategories = async () => {
  try {
    const response = await getTrainingCategoryList()

    if (response?.data?.code === 200) {
      categoryOptions.value = response.data.data || []
      // 按照 rank 字段排序
      categoryOptions.value.sort((a, b) => a.rank - b.rank)
    } else {
      ElMessage.error(response?.data?.msg || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 在 onMounted 中添加获取分类列表的调用
onMounted(() => {
  // 获取分类列表
  fetchCategories()

  // 保留原有代码
  if (isEdit.value && route.params.id) {
    loadTrainingData(Number(route.params.id))
  }
})

const categoryId = ref<number>(null)

// 表单验证规则
const trainingRules: FormRules = {
  title: [
    { required: true, message: '请输入训练标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2到50个字符之间', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请填写训练描述', trigger: 'blur' }
  ]
}

// ===== 计算属性 =====
const renderedDescription = computed(() => renderMarkdown(trainingForm.description))

// ===== 生命周期钩子 =====
onMounted(() => {
  // 如果是编辑模式，加载训练数据
  if (isEdit.value && route.params.id) {
    loadTrainingData(Number(route.params.id))
  }
})

// ===== 方法 =====
// 修改加载训练数据方法
const loadTrainingData = async (id: number) => {
  try {
    const response = await getTraining(id)
    if (response?.data?.code === 200) {
      const data = response.data.data

      if (data.training) {
        // 填充训练基本信息
        Object.assign(trainingForm, data.training)

        // 设置分类ID
        if (data.trainingCategory && data.trainingCategory.id) {
          categoryId.value = data.trainingCategory.id
        } else {
          // 如果没有分类信息，设置为null或默认值
          categoryId.value = null
        }
      }

      ElMessage.success('训练数据加载成功')
    } else {
      ElMessage.error(response?.data?.msg || '获取训练数据失败')
    }
  } catch (error) {
    console.error('获取训练数据失败:', error)
    ElMessage.error('获取训练数据失败，请重试')
  }
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
  if (trainingFormRef.value) {
    trainingFormRef.value.resetFields()
  }

  categoryId.value = null

  Object.assign(trainingForm, {
    id: 0,
    title: '',
    description: '',
    author: 'root',
    auth: 'Public',
    status: true,
    rank: 1
  })

  ElMessage.success('表单已重置')
}

// 提交训练
const submitTraining = async () => {
  if (!trainingFormRef.value) return

  if (!categoryId.value) {
    ElMessage.warning('请选择训练分类')
    return
  }

  try {
    await trainingFormRef.value.validate()
    submitting.value = true

    // 查找选择的分类
    const selectedCategory = categoryOptions.value.find(c => c.id === categoryId.value)
    if (!selectedCategory) {
      ElMessage.error('无法找到所选分类')
      submitting.value = false
      return
    }

    // 构建TrainingDTO对象
    const trainingDTO: TrainingDTO = {
      training: {
        ...trainingForm,
        // 编辑模式传递ID，新增模式不传
        ...(isEdit.value ? { id: trainingForm.id } : {})
      },
      trainingCategory: {
        id: selectedCategory.id,
        name: selectedCategory.name,
        color: selectedCategory.color,
        gmtCreate: '',
        gmtModified: ''
      }
    }

    // 调用API
    // const api = isEdit.value ? updateTraining : addTraining
    const response = await addTraining(trainingDTO)

    if (response?.data?.code === 200) {
      ElMessage.success(isEdit.value ? '更新训练成功' : '创建训练成功')
      router.push('/admin/training/list')
    } else {
      ElMessage.error(response?.data?.msg || (isEdit.value ? '更新训练失败' : '创建训练失败'))
    }
  } catch (error) {
    console.error('提交训练失败:', error)
    ElMessage.error(isEdit.value ? '更新训练失败' : '创建训练失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 卡片和表单布局 */
.add-training-container {
  margin-bottom: 20px;
}

.add-training-card {
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

.category-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-block {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.status-text {
  margin-left: 8px;
  color: #606266;
}

/* Markdown编辑器 */
.markdown-editor-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.editor-toolbar {
  margin-bottom: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 5px;
  background-color: #f5f7fa;
}

.toolbar-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.editor-wrapper {
  flex: 1;
  min-width: 300px;
}

.preview-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  min-height: 300px;
  margin-top: 10px;
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
  line-height: 1.6;
}

.markdown-preview {
  padding: 10px;
  min-height: 200px;
  line-height: 1.6;
}

/* 表单操作区 */
.form-actions {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  gap: 20px;
}

/* Markdown 编辑器样式 */
:deep(.markdown-body) {
  background-color: transparent;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
}

:deep(.markdown-body pre) {
  background-color: #f6f8fa;
  border-radius: 3px;
}

:deep(.markdown-body code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

:deep(.markdown-body pre code) {
  padding: 0;
  background-color: transparent;
}

:deep(.markdown-body .katex) {
  font-size: 1.1em;
}
</style>