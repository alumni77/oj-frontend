<template>
  <div class="users-container">
    <el-card class="users-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon">
              <User />
            </el-icon>
            <span>用户管理</span>
          </div>
          <el-button type="primary" @click="handleAddUser">添加用户</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input v-model="searchQuery" placeholder="搜索用户名、邮箱..." clearable @clear="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 用户表格 -->
      <el-table :data="userList" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column prop="lastLogin" label="最后登录" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)"
              :disabled="scope.row.role === 'admin'">
              删除
            </el-button>
            <el-button size="small" :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)">
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalUsers" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>

      <!-- 用户表单对话框 -->
      <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @close="resetForm">
        <el-form ref="userForm" :model="userForm" :rules="userRules" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" />
          </el-form-item>
          <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
            <el-input v-model="userForm.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="userForm.role" placeholder="请选择角色">
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="userForm.status">
              <el-radio :label="1">正常</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { User, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 用户列表数据
const userList = ref([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 1,
    createTime: '2023-01-01 08:00:00',
    lastLogin: '2023-04-17 10:30:00'
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    status: 1,
    createTime: '2023-01-02 09:15:00',
    lastLogin: '2023-04-16 14:20:00'
  },
  {
    id: 3,
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    status: 0,
    createTime: '2023-01-03 10:20:00',
    lastLogin: '2023-04-10 11:45:00'
  }
])

// 搜索和分页
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(100)

// 表单对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = ref('添加用户')
const userForm = reactive({
  id: 0,
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 1
})
const userFormRef = ref<FormInstance>()
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 初始化
onMounted(() => {
  fetchUserList()
})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    // 模拟API请求
    setTimeout(() => {
      // 这里应该是真实的API调用
      // const response = await getUserList({
      //   page: currentPage.value,
      //   pageSize: pageSize.value,
      //   search: searchQuery.value
      // })
      // userList.value = response.data.list
      // totalUsers.value = response.data.total
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
    loading.value = false
  }
}

// 搜索用户
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置搜索
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

// 添加用户
const handleAddUser = () => {
  dialogType.value = 'add'
  dialogTitle.value = '添加用户'
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 这里应该是真实的API调用
      // await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 切换用户状态
const handleToggleStatus = (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(
    `确定要${statusText}用户 ${row.username} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 这里应该是真实的API调用
      // await updateUserStatus(row.id, newStatus)
      row.status = newStatus
      ElMessage.success(`${statusText}成功`)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()

    if (dialogType.value === 'add') {
      // 添加用户
      // await createUser(userForm)
      ElMessage.success('添加成功')
    } else {
      // 编辑用户
      // await updateUser(userForm)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  Object.assign(userForm, {
    id: 0,
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 1
  })
}
</script>

<style scoped>
.users-container {
  margin-bottom: 20px;
}

.users-card {
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
  margin-bottom: 20px;
  gap: 10px;
}

.search-area .el-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>