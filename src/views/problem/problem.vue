<template>
  <div class="problem-detail">
    <h1>题目详情</h1>
    <p>题目编号: {{ problemId }}</p>
  </div>
</template>

<script setup lang="ts" name="problemDetail">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// 获取当前路由对象
const route = useRoute()

// 从路由参数中获取数据
const problemId = ref(route.params)

// 可以在组件挂载时输出参数进行调试
onMounted(() => {
  console.log('路由参数:', problemId.value)
})
</script>