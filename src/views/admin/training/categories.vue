<template>
  <div class="categories-container">
    <!-- 分类管理卡片 -->
    <el-card class="categories-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <Collection />
            </el-icon>
            <span>训练分类管理</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="openCategoryDialog">
              <el-icon>
                <Plus />
              </el-icon>
              添加分类
            </el-button>
          </div>
        </div>
      </template>

      <div class="tips-area">
        <span>提示: 训练分类用于对训练进行分组，不同分类可以设置不同颜色，帮助学习者快速识别训练类型。</span>
      </div>

      <!-- 分类列表 -->
      <div v-if="categories.length > 0" class="categories-list">
        <el-table :data="categories" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="颜色" width="100">
            <template #default="scope">
              <div class="color-block" :style="{ backgroundColor: scope.row.color }"></div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="分类名称" />
          <el-table-column prop="rank" label="排序" width="100" />
          <el-table-column label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.gmtCreate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button type="primary" size="small" @click="editCategory(scope.row)">
                <el-icon>
                  <Edit />
                </el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="confirmDeleteCategory(scope.row)">
                <el-icon>
                  <Delete />
                </el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-empty v-else description="暂无训练分类" />

      <!-- 分类预览区 -->
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">分类预览</span>
        </div>
        <div class="categories-preview">
          <div v-for="category in categories" :key="category.id" class="category-tag"
            :style="{ backgroundColor: category.color, color: getContrastTextColor(category.color) }">
            {{ category.name }}
          </div>
          <el-empty v-if="categories.length === 0" description="暂无分类" :image-size="60" />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog :title="categoryDialog.isEdit ? '编辑分类' : '添加分类'" v-model="categoryDialog.visible" width="500px"
      @close="resetCategoryForm">
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="排序顺序" prop="rank">
          <el-input-number v-model="categoryForm.rank" :min="0" :step="1" />
        </el-form-item>

        <el-form-item label="分类颜色" prop="color">
          <el-input v-model="categoryForm.color">
            <template #append>
              <el-color-picker v-model="categoryForm.color" show-alpha color-format="hex" @change="handleColorChange" />
            </template>
          </el-input>
        </el-form-item>

        <!-- 分类预览 -->
        <el-form-item label="预览">
          <div class="category-preview">
            <div class="category-tag"
              :style="{ backgroundColor: categoryForm.color, color: getContrastTextColor(categoryForm.color) }">
              {{ categoryForm.name || '分类预览' }}
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm" :loading="categoryDialog.loading">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Collection, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { addTrainingCategory, updateTrainingCategory, deleteTrainingCategory, getTrainingCategoryList } from '@/api/admin'
import { TrainingCategory } from '@/api/admin/type'
import { getTrainingCategory } from '@/api/training'

// ===== 状态管理 =====
const loading = ref(false)
const categories = ref<TrainingCategory[]>([])

// ===== 分类对话框相关 =====
const categoryDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false
})

const categoryFormRef = ref<FormInstance>()
// 分类表单
const categoryForm = reactive<TrainingCategory>({
  id: 0,
  name: '',
  color: '#409EFF',
  rank: 0,
  gmtCreate: '',
  gmtModified: ''
})

const categoryRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 30, message: '分类名称长度不能超过30个字符', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择分类颜色', trigger: 'change' },
    { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, message: '请输入有效的颜色代码', trigger: 'change' }
  ],
  rank: [
    { required: true, message: '请输入排序顺序', trigger: 'change' }
  ]
})

// 添加获取分类列表方法
const fetchCategories = async () => {
  loading.value = true
  try {
    // 使用新增的 getTrainingCategoryList 接口
    const response = await getTrainingCategoryList()

    if (response?.data?.code === 200) {
      categories.value = response.data.data || []
      // 按照 rank 字段排序
      categories.value.sort((a, b) => a.rank - b.rank)
    } else {
      ElMessage.error(response?.data?.msg || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories() // 页面加载时获取分类列表
})

// ===== 工具方法 =====
// 格式化日期的函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '--'
  try {
    const date = new Date(dateStr)

    // 使用 Intl.DateTimeFormat 进行格式化 (原生JS方法)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)

  } catch (e) {
    return dateStr
  }
}
// 根据背景颜色计算文本颜色（黑或白）
const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000'

  // 去掉#前缀
  let hex = hexColor.substring(1)

  // 处理简写的十六进制颜色，如 #FFF
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // 将十六进制转换为RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // 计算亮度 (YIQ公式)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000

  // 亮度大于128使用黑色文本，否则使用白色
  return (yiq >= 128) ? '#000000' : '#FFFFFF'
}

// 颜色选择器变化处理函数
const handleColorChange = (color: string) => {
  // 确保颜色值是十六进制格式
  if (color && !color.startsWith('#')) {
    categoryForm.color = color.startsWith('rgba') || color.startsWith('rgb')
      ? rgbToHex(color)
      : `#${color}`
  }
}

// RGB 颜色转十六进制
const rgbToHex = (rgb: string): string => {
  // 处理 rgba(r,g,b,a) 或 rgb(r,g,b) 格式
  const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d?\.?\d*))?\)/
  const match = rgb.match(rgbRegex)

  if (!match) return '#000000'

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  // 转换为十六进制
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// ===== 分类操作 =====
// 打开添加分类对话框
const openCategoryDialog = () => {
  categoryDialog.isEdit = false
  resetCategoryForm()
  categoryDialog.visible = true
}

// 打开编辑分类对话框
const editCategory = (category: TrainingCategory) => {
  categoryDialog.isEdit = true
  Object.assign(categoryForm, category)
  categoryDialog.visible = true
}

// 重置分类表单
const resetCategoryForm = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields()
  }
  Object.assign(categoryForm, {
    id: 0,
    name: '',
    color: '#409EFF',
    rank: 0,
    gmtCreate: '',
    gmtModified: ''
  })
}

// 提交分类表单
const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return

  try {
    await categoryFormRef.value.validate()
    categoryDialog.loading = true

    // 根据是否是编辑模式选择 API
    const response = categoryDialog.isEdit
      ? await updateTrainingCategory(categoryForm)
      : await addTrainingCategory(categoryForm)

    if (response?.data?.code === 200) {
      ElMessage.success(categoryDialog.isEdit ? '分类更新成功' : '分类添加成功')
      categoryDialog.visible = false
      fetchCategories()  // 刷新数据
    } else {
      ElMessage.error(response?.data?.msg || (categoryDialog.isEdit ? '分类更新失败' : '分类添加失败'))
    }
  } catch (error) {
    console.error(categoryDialog.isEdit ? '更新分类失败:' : '添加分类失败:', error)
    ElMessage.error(categoryDialog.isEdit ? '分类更新失败' : '分类添加失败')
  } finally {
    categoryDialog.loading = false
  }
}

// 确认删除分类
const confirmDeleteCategory = (category: TrainingCategory) => {
  ElMessageBox.confirm(
    `确定要删除分类 "${category.name}" 吗？此操作可能会影响使用此分类的训练。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteTrainingCategory(category.id)

      if (response?.data?.code === 200) {
        ElMessage.success('分类删除成功')
        fetchCategories()  // 刷新数据
      } else {
        ElMessage.error(response?.data?.msg || '分类删除失败')
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      ElMessage.error('分类删除失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped>
/* 分类管理容器 */
.categories-container {
  margin-bottom: 20px;
}

/* 卡片样式 */
.categories-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 卡片头部样式 */
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
  gap: 10px;
}

/* 提示区域样式 */
.tips-area {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  border-left: 4px solid #409EFF;
}

/* 分类列表样式 */
.categories-list {
  margin-bottom: 24px;
}

/* 颜色块 */
.color-block {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  margin: 0 auto;
}

/* 预览区域样式 */
.preview-section {
  margin-top: 24px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.categories-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

/* 分类标签样式 */
.category-tag {
  cursor: default;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.category-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 分类预览 */
.category-preview {
  margin-top: 5px;
  display: flex;
}

/* 对话框样式 */
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

/* 表单样式 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-color-picker) {
  margin-left: 10px;
  vertical-align: middle;
}

:deep(.el-input-group__append) {
  padding: 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style>