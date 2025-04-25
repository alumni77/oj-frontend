<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <svg-icon name="icon-404" width="300px" height="300px" />
      <h1>页面不存在</h1>
      <p>您访问的页面已被移动、删除或不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
}

.not-found-content h1 {
  font-size: 2.5rem;
  color: #333;
  margin: 20px 0;
}

.not-found-content p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
}
</style>