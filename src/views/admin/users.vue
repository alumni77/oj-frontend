<template>
  <div class="users-container">
    <!-- 用户管理卡片 -->
    <el-card class="users-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <User />
            </el-icon>
            <span>用户管理</span>
          </div>
          <div class="header-actions">
            <el-button type="danger" :disabled="selectedUsers.length === 0" @click="handleBatchDelete">
              批量删除
            </el-button>
            <el-button type="primary" @click="handleAddUser">添加用户</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input v-model="searchQuery" placeholder="搜索用户名..." clearable @clear="handleSearch">
          <template #prefix><el-icon>
              <Search />
            </el-icon></template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 用户表格 -->
      <el-table :data="userList" border style="width: 100%" v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="#" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="200" align="center" />

        <!-- 角色列 -->
        <el-table-column label="角色" width="200" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.roles && scope.row.roles.some((r: Role) => r.role === 'admin') ? 'danger' : 'primary'">
              {{ scope.row.roles && scope.row.roles[0] ? scope.row.roles[0].description : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" width="200" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'info'">
              {{ scope.row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 时间列 -->
        <el-table-column label="注册时间" width="350" align="center">
          <template #default="scope">{{ formatDate(scope.row.gmtCreate) }}</template>
        </el-table-column>

        <el-table-column label="最后修改" width="350" align="center">
          <template #default="scope">{{ formatDate(scope.row.gmtModified) }}</template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)"
              :disabled="scope.row.roles && scope.row.roles.some((r: Role) => r.role === 'admin')">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalUsers" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>

      <!-- 用户表单对话框 -->
      <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm">
        <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="100px">
          <!-- 基本信息 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" />
          </el-form-item>

          <el-form-item label="真实姓名" prop="realname">
            <el-input v-model="userForm.realname" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" />
          </el-form-item>

          <!-- 密码管理 -->
          <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
            <el-input v-model="userForm.password" type="password" show-password />
          </el-form-item>

          <el-form-item label="重置密码" v-if="dialogType === 'edit'">
            <el-switch v-model="userForm.setNewPwd" />
          </el-form-item>

          <el-form-item label="新密码" prop="password" v-if="dialogType === 'edit' && userForm.setNewPwd">
            <el-input v-model="userForm.password" type="password" show-password />
          </el-form-item>

          <!-- 用户角色和状态 -->
          <el-form-item label="用户角色" prop="type">
            <el-select v-model="userForm.type" placeholder="请选择角色">
              <el-option :label="'管理员'" :value="1001" />
              <el-option :label="'默认用户'" :value="1002" />
              <el-option :label="'禁止提交用户'" :value="1003" />
              <el-option :label="'禁止发贴讨论用户'" :value="1004" />
              <el-option :label="'禁言包括回复讨论发帖用户'" :value="1005" />
              <el-option :label="'禁止提交同时禁止发帖用户'" :value="1006" />
              <el-option :label="'禁言禁提交用户'" :value="1007" />
              <el-option :label="'题目管理员'" :value="1008" />
            </el-select>
          </el-form-item>

          <el-form-item label="用户状态" prop="status">
            <el-radio-group v-model="userForm.status">
              <el-radio :label="0">
                <el-tag type="success" effect="light">正常</el-tag>
              </el-radio>
              <el-radio :label="1">
                <el-tag type="danger" effect="light">禁用</el-tag>
              </el-radio>
            </el-radio-group>
            <div class="status-hint" v-if="dialogType === 'edit'">
              <el-icon v-if="userForm.status === 1">
                <Warning />
              </el-icon>
              <span v-if="userForm.status === 1">禁用后用户将无法登录系统</span>
              <span v-else>用户当前处于正常状态</span>
            </div>
          </el-form-item>

          <!-- 头衔设置 -->
          <el-form-item label="头衔名称" prop="titleName">
            <el-input v-model="userForm.titleName" />
          </el-form-item>

          <el-form-item label="头衔颜色" prop="titleColor">
            <el-input v-model="userForm.titleColor">
              <template #append>
                <el-color-picker v-model="userForm.titleColor" show-alpha color-format="hex"
                  @change="handleColorChange" />
              </template>
            </el-input>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">确认</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>

    <!-- 导入用户卡片 -->
    <el-card class="users-card import-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="section-title">导入用户</span>
          </div>
        </div>
      </template>

      <div class="import-guide">
        <ol>
          <li>用户数据导入仅支持csv格式的用户数据。</li>
          <li>共七列数据：用户名和密码不能为空，邮箱、真实姓名、性别、昵称和学校可选填，否则该行数据可能导入失败。</li>
          <li>第一行不必写（"用户名"，"密码"，"邮箱"，"真实姓名"，"性别"，"昵称"，学校）这七个列名。</li>
          <li>性别为男请使用"male"或"0"，女请使用"female"或"1"，不填默认为"secrecy"。</li>
          <li>请导入保存为UTF8编码的文件，否则中文可能会乱码。</li>
        </ol>
      </div>

      <div class="import-actions">
        <el-upload class="upload-demo" action="#" :auto-upload="false" :limit="1" :on-change="handleFileChange"
          :on-exceed="handleExceed" accept=".csv">
          <el-button type="primary">
            <el-icon>
              <Upload />
            </el-icon> 选择文件
          </el-button>
          <template #tip>
            <div class="el-upload__tip">仅支持CSV格式</div>
          </template>
        </el-upload>
      </div>
    </el-card>

    <!-- 生成用户卡片 -->
    <el-card class="users-card generate-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="section-title">生成用户</span>
          </div>
        </div>
      </template>

      <div class="generate-form">
        <!-- 前缀和后缀 -->
        <div class="form-row">
          <div class="form-item">
            <div class="form-label">前缀</div>
            <el-input v-model="generateForm.prefix" placeholder="Prefix" class="generate-input" />
          </div>
          <div class="form-item">
            <div class="form-label">后缀</div>
            <el-input v-model="generateForm.suffix" placeholder="Suffix" class="generate-input" />
          </div>
        </div>

        <!-- 数字范围 -->
        <div class="form-row">
          <div class="form-item">
            <div class="form-label">
              <span class="required-field">*</span> 开始数字
            </div>
            <el-input-number v-model="generateForm.start" :min="0" controls-position="right" class="generate-input" />
          </div>
          <div class="form-item">
            <div class="form-label">
              <span class="required-field">*</span> 结束数字
            </div>
            <el-input-number v-model="generateForm.end" :min="0" controls-position="right" class="generate-input" />
          </div>
        </div>

        <!-- 密码长度 -->
        <div class="form-row">
          <div class="form-item">
            <div class="form-label">
              <span class="required-field">*</span> 密码长度
            </div>
            <el-input-number v-model="generateForm.password_length" :min="6" :max="20" controls-position="right"
              class="generate-input" />
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="form-action">
          <el-button type="primary" @click="submitGenerateUsers" :loading="generateLoading">
            <el-icon>
              <Plus />
            </el-icon> 生成并下载Excel
          </el-button>
        </div>

        <!-- 提示 -->
        <div class="generate-hint">
          生成的用户名格式:
          {{ generateForm.prefix ? generateForm.prefix : '' }}
          {{ generateForm.start }}-{{ generateForm.end }}
          {{ generateForm.suffix ? '_' + generateForm.suffix : '' }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { User, Search, Warning, Upload, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Role, UserRolesVO } from '@/api/passport/type'
import { deleteUser, editUser, generateUser, getUserList, insertBatchUser } from '@/api/admin'
import { AdminEditUserDTO } from '@/api/admin/type'
import { generateUserExcel } from '@/api/file'

// ===== 通用状态 =====
const loading = ref(false)

// ===== 用户列表相关 =====
const userList = ref<UserRolesVO[]>([])
const selectedUsers = ref<UserRolesVO[]>([])

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const totalUsers = ref(100)

// 初始化
onMounted(() => {
  fetchUserList()
})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const response = await getUserList({
      currentPage: currentPage.value,
      limit: pageSize.value,
      keyword: searchQuery.value,
      onlyAdmin: false
    })

    if (response.data && response.data.code === 200) {
      const pageData = response.data.data
      userList.value = pageData.records || []
      totalUsers.value = pageData.total || 0
      currentPage.value = pageData.current
      pageSize.value = pageData.size
    } else {
      ElMessage.error(response.data?.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

const resetSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchUserList()
}

// 分页事件
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchUserList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchUserList()
}

// 选择变化处理函数
const handleSelectionChange = (selection: UserRolesVO[]) => {
  selectedUsers.value = selection
}

// 日期格式化函数
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

// ===== 用户表单和对话框相关 =====
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => dialogType.value === 'add' ? '添加用户' : '编辑用户')
const submitting = ref(false)
const userFormRef = ref<FormInstance>()

// 用户表单数据模型
const userForm = reactive<AdminEditUserDTO & { setNewPwd?: boolean }>({
  uid: '',
  username: '',
  realname: '',
  email: '',
  password: '',
  type: 1002, // 默认为普通用户
  status: 0, // 默认为正常状态
  setNewPwd: false,
  titleName: '',
  titleColor: ''
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    {
      required: function () {
        return dialogType.value === 'add' || userForm.setNewPwd
      },
      message: '密码不能为空',
      trigger: 'blur'
    },
    { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
  ],
  titleColor: [
    { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, message: '请输入有效的颜色代码', trigger: 'change' }
  ]
}

// 处理添加用户
const handleAddUser = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserRolesVO) => {
  dialogType.value = 'edit'

  // 获取用户角色ID
  let roleId = 1002 // 默认为普通用户
  if (row.roles && row.roles.length > 0) {
    roleId = row.roles[0].id
  }

  // 填充表单数据，实现数据回显
  Object.assign(userForm, {
    uid: row.uid || '',
    username: row.username || '',
    realname: row.realname || '',
    email: row.email || '',
    password: '', // 编辑时不显示原密码
    type: roleId,
    status: row.status,
    setNewPwd: false, // 默认不重置密码
    titleName: row.titleName || '',
    titleColor: row.titleColor || ''
  })

  dialogVisible.value = true
}

// 颜色选择器变化时处理函数
const handleColorChange = (color: string) => {
  // 确保颜色值是十六进制格式
  if (color && !color.startsWith('#')) {
    userForm.titleColor = color.startsWith('rgba') || color.startsWith('rgb')
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

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return

  try {
    // 表单验证
    await userFormRef.value.validate()

    // 准备提交的数据
    submitting.value = true
    const submitData: AdminEditUserDTO = {
      uid: userForm.uid,
      username: userForm.username,
      status: userForm.status,
      type: userForm.type
    }

    // 只添加有值的字段
    if (userForm.realname) submitData.realname = userForm.realname
    if (userForm.email) submitData.email = userForm.email
    if (dialogType.value === 'add' || (dialogType.value === 'edit' && userForm.setNewPwd && userForm.password)) {
      submitData.password = userForm.password
    }
    if (dialogType.value === 'edit') submitData.setNewPwd = userForm.setNewPwd
    if (userForm.titleName) submitData.titleName = userForm.titleName
    if (userForm.titleColor) submitData.titleColor = userForm.titleColor

    // 调用API
    const response = await editUser(submitData)

    // 处理响应
    if (response.data && response.data.code === 200) {
      // 根据操作类型和状态变化给出适当的提示
      let successMsg = dialogType.value === 'add' ? '添加成功' : '更新成功'

      // 如果是编辑操作且状态发生变化，添加状态变更提示
      if (dialogType.value === 'edit') {
        const originalUser = userList.value.find(u => u.uid === userForm.uid)
        if (originalUser && originalUser.status !== userForm.status) {
          const statusText = userForm.status === 1 ? '禁用' : '启用'
          successMsg = `用户已${statusText}，${successMsg}`
        }
      }

      ElMessage.success(successMsg)
      dialogVisible.value = false
      fetchUserList() // 刷新列表
    } else {
      ElMessage.error(response.data?.msg || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  Object.assign(userForm, {
    uid: '',
    username: '',
    realname: '',
    email: '',
    password: '',
    type: 1002, // 默认为普通用户
    status: 0,   // 默认为正常状态
    setNewPwd: false,
    titleName: '',
    titleColor: ''
  })
}

// ===== 删除用户相关 =====

// 批量删除处理函数
const handleBatchDelete = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }

  // 检查是否包含管理员用户
  const hasAdmin = selectedUsers.value.some(user =>
    user.roles && user.roles.some((r: Role) => r.role === 'admin')
  )

  if (hasAdmin) {
    ElMessage.warning('不能删除管理员用户')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 准备要删除的用户ID数组
        const userIds = selectedUsers.value.map(user => user.uid)

        // 调用删除API
        const response = await deleteUser({ ids: userIds })

        if (response.data && response.data.code === 200) {
          ElMessage.success('批量删除成功')
          fetchUserList() // 刷新用户列表
          selectedUsers.value = [] // 清空选择
        } else {
          ElMessage.error(response.data?.msg || '批量删除失败')
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败，请重试')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 删除单个用户
const handleDelete = (row: UserRolesVO) => {
  // 检查是否为管理员
  const isAdmin = row.roles && row.roles.some((r: Role) => r.role === 'admin')

  if (isAdmin) {
    ElMessage.warning('不能删除管理员用户')
    return
  }

  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 调用删除API，传递单个ID的数组
        const response = await deleteUser({ ids: [row.uid] })

        if (response.data && response.data.code === 200) {
          ElMessage.success('删除成功')
          fetchUserList() // 刷新列表
        } else {
          ElMessage.error(response.data?.msg || '删除失败')
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

// ===== 导入用户相关 =====
const importFile = ref<File | null>(null)
const importLoading = ref(false)

// 处理文件变更
const handleFileChange = (file: any) => {
  if (file && file.raw) {
    importFile.value = file.raw
    // 检查文件类型
    const fileType = file.raw.name.split('.').pop().toLowerCase()
    if (['csv'].indexOf(fileType) === -1) {
      ElMessage.warning('请上传CSV文件')
      importFile.value = null
      return false
    }

    // 文件导入处理
    submitImportUsers(file.raw)
  }
}

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 提交导入用户请求
const submitImportUsers = async (file: File) => {
  if (!file) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }

  importLoading.value = true
  try {
    // 读取CSV文件内容
    const csvData = await readCSVFile(file)

    if (!csvData || csvData.length === 0) {
      ElMessage.error('文件为空或格式不正确')
      return
    }

    // 验证数据格式
    const validationError = validateCSVData(csvData)
    if (validationError) {
      ElMessage.error(validationError)
      return
    }

    // 调用API将解析后的数据发送到后端
    const response = await insertBatchUser({ users: csvData })

    if (response.data && response.data.code === 200) {
      ElMessage.success('用户导入成功')
      fetchUserList() // 刷新用户列表
    } else {
      ElMessage.error(response.data?.msg || '导入失败')
    }
  } catch (error) {
    console.error('导入用户失败:', error)
    ElMessage.error('导入用户失败，请检查文件格式')
  } finally {
    importLoading.value = false
  }
}

// CSV文件处理相关函数
const readCSVFile = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        if (!e.target || typeof e.target.result !== 'string') {
          reject(new Error('文件读取失败'))
          return
        }

        const content = e.target.result
        // 按行分割
        const rows = content.split(/\r?\n/).filter(row => row.trim() !== '')

        // 解析每行数据
        const data = rows.map(row => {
          // 处理特殊情况，如字段中包含逗号但被引号包围
          const result = []
          let inQuote = false
          let currentField = ''

          for (let i = 0; i < row.length; i++) {
            const char = row[i]

            if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
              inQuote = !inQuote
            } else if (char === ',' && !inQuote) {
              result.push(currentField)
              currentField = ''
            } else {
              currentField += char
            }
          }

          // 添加最后一个字段
          result.push(currentField)

          // 清理引号
          return result.map(field => {
            // 移除字段两端的引号
            if (field.startsWith('"') && field.endsWith('"')) {
              field = field.substring(1, field.length - 1)
            }
            // 替换双引号转义
            return field.replace(/""/g, '"')
          })
        })

        resolve(data)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取错误'))
    }

    // 以文本方式读取文件
    reader.readAsText(file, 'UTF-8')
  })
}

// 验证CSV数据格式
const validateCSVData = (data: string[][]): string | null => {
  // 验证是否有数据
  if (data.length === 0) {
    return '文件不包含任何数据'
  }

  // 验证每行至少包含用户名和密码
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (row.length < 2) {
      return `第${i + 1}行数据不完整，至少需要提供用户名和密码`
    }

    if (!row[0] || !row[1]) {
      return `第${i + 1}行的用户名或密码不能为空`
    }
  }

  // 验证用户名唯一性
  const usernames = new Set()
  for (let i = 0; i < data.length; i++) {
    const username = data[i][0]
    if (usernames.has(username)) {
      return `发现重复的用户名: ${username}`
    }
    usernames.add(username)
  }

  // 处理性别字段，转换为标准格式
  for (let i = 0; i < data.length; i++) {
    if (data[i].length >= 5) {
      const gender = data[i][4]?.toLowerCase()
      if (gender === 'male' || gender === '0') {
        data[i][4] = 'male'
      } else if (gender === 'female' || gender === '1') {
        data[i][4] = 'female'
      } else if (gender) {
        data[i][4] = 'secrecy' // 默认值
      }
    }
  }

  return null // 没有错误
}

// ===== 生成用户相关 =====
const generateLoading = ref(false)

// 生成用户表单
const generateForm = reactive({
  prefix: 'stu',
  suffix: '2025',
  start: 0,
  end: 10,
  password_length: 6
})

// 提交生成用户请求
const submitGenerateUsers = async () => {
  try {
    // 参数验证
    if (generateForm.start >= generateForm.end) {
      ElMessage.warning('开始数字必须小于结束数字')
      return
    }

    // 验证生成数量不要太多
    const usersCount = generateForm.end - generateForm.start + 1
    if (usersCount > 100) {
      ElMessage.warning('一次生成的用户数量不能超过100个')
      return
    }

    generateLoading.value = true

    // 调用API生成用户
    const response = await generateUser({
      prefix: generateForm.prefix,
      suffix: generateForm.suffix,
      number_from: generateForm.start,
      number_to: generateForm.end,
      password_length: generateForm.password_length
    })

    if (response.data && response.data.code === 200) {
      // 获取返回的key
      const key = response.data.data.key

      if (key) {
        // 调用下载Excel文件的API
        downloadUserExcel(key)
        ElMessage.success(`成功生成 ${usersCount} 个用户，正在下载Excel文件`)
      } else {
        ElMessage.warning('生成用户成功，但未获取到下载密钥')
      }

      // 刷新用户列表
      fetchUserList()
    } else {
      ElMessage.error(response.data?.msg || '生成用户失败')
    }
  } catch (error) {
    console.error('生成用户失败:', error)
    ElMessage.error('生成用户失败，请检查输入参数')
  } finally {
    generateLoading.value = false
  }
}

// 下载用户Excel文件
const downloadUserExcel = (key: string) => {
  generateUserExcel(key)
    .then(response => {
      // 处理二进制文件响应
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // 设置文件名
      const filename = `users_${new Date().getTime()}.xlsx`
      link.setAttribute('download', filename)

      // 添加到DOM并触发下载
      document.body.appendChild(link)
      link.click()

      // 清理
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
        ElMessage.success('Excel文件下载成功')
      }, 100)
    })
    .catch(error => {
      console.error('下载Excel文件失败:', error)
      ElMessage.error('下载Excel文件失败，请重试')
    })
}
</script>

<style scoped>
/* ===== 通用布局样式 ===== */
.users-container {
  margin-bottom: 20px;
}

/* 卡片通用样式 */
.users-card {
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

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

/* ===== 搜索区域样式 ===== */
.search-area {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.search-area .el-input {
  width: 300px;
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

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

.status-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.required-field {
  color: #F56C6C;
  font-weight: bold;
  margin-right: 2px;
}

/* ===== 导入用户卡片样式 ===== */
.import-card {
  margin-top: 20px;
}

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
}

/* ===== 生成用户卡片样式 ===== */
.generate-form {
  padding: 15px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-item {
  flex: 1;
}

.form-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.generate-input {
  width: 100%;
}

.form-action {
  margin-top: 20px;
  padding: 10px 0;
}

.generate-hint {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

/* ===== 卡片显示控制 ===== */
/* 确保批量删除按钮在用户管理卡片中可见 */
.generate-card .header-actions,
.import-card .header-actions {
  display: none;
}

/* 恢复用户管理卡片中的header-actions */
.users-card:not(.generate-card):not(.import-card) .header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ===== 上传控件样式 ===== */
:deep(.el-upload) {
  width: auto;
}

:deep(.el-upload-list) {
  margin-top: 10px;
}
</style>