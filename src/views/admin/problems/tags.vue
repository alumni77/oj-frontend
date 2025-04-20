<template>
  <div class="tags-container">
    <!-- 标签管理卡片 -->
    <el-card class="tags-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <Collection />
            </el-icon>
            <span>标签管理</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="openTagDialog">
              <el-icon>
                <Plus />
              </el-icon>
              添加标签
            </el-button>
            <el-button type="primary" @click="openClassificationDialog">
              <el-icon>
                <FolderAdd />
              </el-icon>
              添加分类
            </el-button>
          </div>
        </div>
      </template>

      <div class="tips-area">
        <span>提示: 默认无标签分类栏位，所有标签都未分类。请点击左上角【添加标签分类】添加新的标签分类。</span>
      </div>

      <!-- 过滤区域 -->
      <div class="filter-area">
        <el-select v-model="filterOj" placeholder="OJ来源" clearable @change="filterTags">
          <el-option label="所有" value="" />
          <el-option v-for="oj in ojOptions" :key="oj.value" :label="oj.label" :value="oj.value" />
        </el-select>
      </div>

      <!-- 标签分类展示区域 -->
      <div v-if="tagClassifications.length > 0" class="tag-classifications">
        <div v-for="classification in filteredClassifications" :key="classification.id" class="classification-item">
          <div class="classification-header">
            <span class="classification-name">{{ classification.name }}</span>
            <div class="classification-actions">
              <el-tooltip content="编辑分类" placement="top">
                <el-button type="primary" size="small" circle @click="editClassification(classification)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除分类" placement="top">
                <el-button type="danger" size="small" circle @click="confirmDeleteClassification(classification)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="classification-tags">
            <el-tag v-for="tag in getTagsByClassification(classification.name)" :key="tag.id"
              :style="{ backgroundColor: tag.color || '#409EFF', color: getContrastTextColor(tag.color || '#409EFF') }"
              class="tag-item" @click="editTag(tag)">
              {{ tag.name }}
            </el-tag>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无标签分类" />

      <!-- 未分类标签展示 -->
      <div class="unclassified-tags-section">
        <div class="section-header">
          <span class="section-title">未分类标签</span>
        </div>
        <div class="unclassified-tags">
          <el-tag v-for="tag in unclassifiedTags" :key="tag.id"
            :style="{ backgroundColor: tag.color || '#409EFF', color: getContrastTextColor(tag.color || '#409EFF') }"
            class="tag-item" @click="editTag(tag)">
            {{ tag.name }}
          </el-tag>
          <el-empty v-if="unclassifiedTags.length === 0" description="暂无未分类标签" :image-size="60" />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑标签对话框 -->
    <el-dialog :title="tagDialog.isEdit ? '编辑标签' : '添加标签'" v-model="tagDialog.visible" width="500px"
      @close="resetTagForm">
      <el-form ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="例如：数组、哈希表、动态规划" />
        </el-form-item>

        <!-- 标签类型 -->
        <el-form-item label="标签类型" prop="oj">
          <el-radio-group v-model="tagForm.oj">
            <el-radio label="ME">本地标签</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 标签分类 -->
        <el-form-item label="标签分类" prop="classification">
          <el-select v-model="tagForm.classification" placeholder="请选择标签分类" filterable clearable
            @change="handleClassificationChange">
            <el-option v-for="item in tagClassifications" :key="item.id" :label="item.name" :value="item.name" />
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

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="tagDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitTagForm" :loading="tagDialog.loading">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog :title="classificationDialog.isEdit ? '编辑分类' : '添加标签分类'" v-model="classificationDialog.visible"
      width="500px" @close="resetClassificationForm">
      <el-form ref="classificationFormRef" :model="classificationForm" :rules="classificationRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="classificationForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="分类归属" prop="oj">
          <el-select v-model="classificationForm.oj" placeholder="请选择分类归属">
            <el-option label="本地(ME)" value="ME" />
          </el-select>
        </el-form-item>

        <el-form-item label="排序顺序" prop="rank">
          <el-input-number v-model="classificationForm.rank" :min="0" :step="1" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="classificationDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitClassificationForm"
            :loading="classificationDialog.loading">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Collection, Plus, FolderAdd, Edit, Delete } from '@element-plus/icons-vue'
import {
  addTagClassification,
  updateTagClassification,
  deleteTagClassification,
  addTag,
  updateTag,
} from '@/api/admin'
import { Tag, } from '@/api/problem/type'
import { TagClassification } from '@/api/admin/type'
import { getProblemTagsAndClassification } from '@/api/problem'

// ===== 状态管理 =====
const loading = ref(false)
const filterOj = ref('')
const ojOptions = [
  { label: '本地(ME)', value: 'ME' }
]

// 标签和分类数据
const allTags = ref<Tag[]>([])
const tagClassifications = ref<TagClassification[]>([])

// 计算未分类的标签
const unclassifiedTags = computed(() => {
  return allTags.value.filter(tag => {
    // 过滤OJ
    if (filterOj.value && tag.oj !== filterOj.value) {
      return false
    }

    // 检查是否归属于某个分类
    const isClassified = tagClassifications.value.some(classification => {
      const classificationTags = getTagsByClassification(classification.name)
      return classificationTags.some(t => t.id === tag.id)
    })

    return !isClassified
  })
})

// 过滤后的分类列表
const filteredClassifications = computed(() => {
  if (!filterOj.value) return tagClassifications.value

  return tagClassifications.value.filter(classification =>
    classification.oj === filterOj.value
  )
})

// ===== 标签对话框相关 =====
const tagDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false
})

const tagFormRef = ref<FormInstance>()
// 标签表单
const tagForm = reactive({
  id: undefined as number | undefined,
  name: '',
  oj: 'ME',
  color: '#409EFF',
  classification: '',
  tcid: undefined as number | undefined // 添加tcid字段
})

const tagRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { max: 20, message: '标签名称长度不能超过20个字符', trigger: 'blur' }
  ],
  oj: [
    { required: true, message: '请选择标签类型', trigger: 'change' }
  ],
  color: [
    { required: true, message: '请选择标签颜色', trigger: 'change' },
    { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, message: '请输入有效的颜色代码', trigger: 'change' }
  ]
})

// ===== 分类对话框相关 =====
const classificationDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false
})

const classificationFormRef = ref<FormInstance>()
// 分类表单
const classificationForm = reactive<TagClassification>({
  id: 0,
  name: '',
  oj: 'ME', // 改为ME
  rank: 0,
  gmtCreate: '',
  gmtModified: ''
})
const classificationRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 30, message: '分类名称长度不能超过30个字符', trigger: 'blur' }
  ],
  oj: [
    { required: true, message: '请选择分类归属', trigger: 'change' }
  ],
  rank: [
    { required: true, message: '请输入排序顺序', trigger: 'change' }
  ]
})

// ===== 生命周期钩子 =====
onMounted(() => {
  fetchTagsAndClassifications()
})

// ===== 数据获取方法 =====
const fetchTagsAndClassifications = async () => {
  loading.value = true
  try {
    // 获取标签和分类数据
    const response = await getProblemTagsAndClassification()
    if (response.data && response.data.code === 200) {
      const data = response.data.data

      console.log("后端返回数据:", data); // 调试日志

      if (data && Array.isArray(data)) {
        // 清空现有数据
        allTags.value = []
        tagClassifications.value = []

        // 处理分类和标签数据
        data.forEach(item => {
          if (item.classification) {
            // 添加分类
            tagClassifications.value.push({
              id: item.classification.id,
              name: item.classification.name,
              oj: item.classification.oj,
              rank: item.classification.rank,
              gmtCreate: item.classification.gmtCreate,
              gmtModified: item.classification.gmtModified
            })

            // 添加该分类下的标签
            if (item.tagList && Array.isArray(item.tagList)) {
              item.tagList.forEach(tag => {
                allTags.value.push({
                  id: tag.id,
                  name: tag.name,
                  oj: tag.oj,
                  color: tag.color || '#409EFF', // 设置默认颜色
                  classification: item.classification.name, // 关联到分类名称
                  tcid: tag.tcid
                })
              })
            }
          }
        })

        console.log("解析后的分类:", tagClassifications.value); // 调试日志
        console.log("解析后的标签:", allTags.value); // 调试日志
      }
    } else {
      ElMessage.error(response.data?.msg || '获取标签数据失败')
    }
  } catch (error) {
    console.error('获取标签数据失败:', error)
    ElMessage.error('获取标签数据失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 根据分类获取标签
const getTagsByClassification = (classificationName: string) => {
  if (filterOj.value) {
    return allTags.value.filter(tag =>
      tag.classification === classificationName && tag.oj === filterOj.value
    )
  }
  return allTags.value.filter(tag => tag.classification === classificationName)
}

// 过滤标签
const filterTags = () => {
  // 过滤逻辑已在计算属性中实现
}

// ===== 工具方法 =====
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

// 标签颜色选择器变化处理函数
const handleTagColorChange = (color: string) => {
  // 确保颜色值是十六进制格式
  if (color && !color.startsWith('#')) {
    tagForm.color = color.startsWith('rgba') || color.startsWith('rgb')
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

// ===== 标签操作 =====
// 打开添加标签对话框
const openTagDialog = () => {
  tagDialog.isEdit = false
  resetTagForm()
  tagDialog.visible = true
}

// 打开编辑标签对话框
const editTag = (tag: Tag) => {
  tagDialog.isEdit = true
  Object.assign(tagForm, {
    id: tag.id,
    name: tag.name,
    oj: tag.oj,
    color: tag.color || '#409EFF',
    classification: tag.classification || '',
    tcid: tag.tcid // 确保加载标签的tcid
  })
  console.log('编辑标签:', tagForm) // 调试日志
  tagDialog.visible = true
}
// 处理分类选择变化
const handleClassificationChange = (value: string) => {
  if (value) {
    const classification = tagClassifications.value.find(c => c.name === value)
    tagForm.tcid = classification ? classification.id : undefined
  } else {
    tagForm.tcid = undefined
  }
  console.log('分类变更后的表单:', tagForm) // 调试日志
}

// 重置标签表单时也要重置tcid
const resetTagForm = () => {
  if (tagFormRef.value) {
    tagFormRef.value.resetFields()
  }
  Object.assign(tagForm, {
    id: undefined,
    name: '',
    oj: 'ME',
    color: '#409EFF',
    classification: '',
    tcid: undefined // 重置tcid
  })
}
// 提交标签表单
const submitTagForm = async () => {
  if (!tagFormRef.value) return

  try {
    await tagFormRef.value.validate()
    tagDialog.loading = true

    // 查找对应分类的ID
    let tcid = null
    if (tagForm.classification) {
      const classification = tagClassifications.value.find(c => c.name === tagForm.classification)
      tcid = classification ? classification.id : null
    }

    // 准备提交的数据
    const tagData = {
      id: tagForm.id,
      name: tagForm.name,
      oj: tagForm.oj,
      color: tagForm.color,
      classification: tagForm.classification || null,
      tcid: tcid // 添加分类ID
    }

    console.log('提交标签数据:', tagData) // 调试日志

    // 根据是否是编辑模式选择API
    const response = tagDialog.isEdit
      ? await updateTag(tagData)
      : await addTag(tagData)

    if (response.data && response.data.code === 200) {
      ElMessage.success(tagDialog.isEdit ? '标签更新成功' : '标签添加成功')
      tagDialog.visible = false
      fetchTagsAndClassifications()  // 刷新数据
    } else {
      ElMessage.error(response.data?.msg || (tagDialog.isEdit ? '标签更新失败' : '标签添加失败'))
    }
  } catch (error) {
    console.error(tagDialog.isEdit ? '更新标签失败:' : '添加标签失败:', error)
    ElMessage.error(tagDialog.isEdit ? '标签更新失败' : '标签添加失败')
  } finally {
    tagDialog.loading = false
  }
}
// ===== 分类操作 =====
// 打开添加分类对话框
const openClassificationDialog = () => {
  classificationDialog.isEdit = false
  resetClassificationForm()
  classificationDialog.visible = true
}

// 打开编辑分类对话框
const editClassification = (classification: TagClassification) => {
  classificationDialog.isEdit = true
  Object.assign(classificationForm, classification)
  classificationDialog.visible = true
}

// 重置分类表单
const resetClassificationForm = () => {
  if (classificationFormRef.value) {
    classificationFormRef.value.resetFields()
  }
  Object.assign(classificationForm, {
    id: 0,
    name: '',
    oj: 'ME',
    rank: 0,
    gmtCreate: '',
    gmtModified: ''
  })
}

// 提交分类表单
const submitClassificationForm = async () => {
  if (!classificationFormRef.value) return

  try {
    await classificationFormRef.value.validate()
    classificationDialog.loading = true

    // 根据是否是编辑模式选择API
    const response = classificationDialog.isEdit
      ? await updateTagClassification(classificationForm)
      : await addTagClassification(classificationForm)

    if (response.data && response.data.code === 200) {
      ElMessage.success(classificationDialog.isEdit ? '分类更新成功' : '分类添加成功')
      classificationDialog.visible = false
      fetchTagsAndClassifications()  // 刷新数据
    } else {
      ElMessage.error(response.data?.msg || (classificationDialog.isEdit ? '分类更新失败' : '分类添加失败'))
    }
  } catch (error) {
    console.error(classificationDialog.isEdit ? '更新分类失败:' : '添加分类失败:', error)
    ElMessage.error(classificationDialog.isEdit ? '分类更新失败' : '分类添加失败')
  } finally {
    classificationDialog.loading = false
  }
}

// 确认删除分类
const confirmDeleteClassification = (classification: TagClassification) => {
  ElMessageBox.confirm(
    `确定要删除分类 "${classification.name}" 吗？此操作会导致该分类下的标签归为未分类状态。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteTagClassification(classification.id)

      if (response.data && response.data.code === 200) {
        ElMessage.success('分类删除成功')
        fetchTagsAndClassifications()  // 刷新数据
      } else {
        ElMessage.error(response.data?.msg || '分类删除失败')
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
/* 标签管理容器 */
.tags-container {
  margin-bottom: 20px;
}

/* 卡片样式 */
.tags-card {
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

/* 过滤区域样式 */
.filter-area {
  margin-bottom: 20px;
}

/* 标签分类区域样式 */
.tag-classifications {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.classification-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9fafc;
}

.classification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.classification-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.classification-actions {
  display: flex;
  gap: 8px;
}

.classification-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

/* 未分类标签区域样式 */
.unclassified-tags-section {
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

.unclassified-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

/* 标签样式 */
.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 5px 10px;
  margin: 3px;
  border: none;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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

/* 标签预览 */
.tag-preview {
  margin-top: 5px;
}

/* 表单样式 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-color-picker) {
  margin-left: 10px;
  vertical-align: middle;
}

:deep(.el-select) {
  width: 100%;
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

  .filter-area {
    flex-direction: column;
  }
}
</style>