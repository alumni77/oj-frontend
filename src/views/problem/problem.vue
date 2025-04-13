<template>
  <div class="problem-container">
    <!-- 左侧题目描述 -->
    <div class="problem-description">
      <el-card class="description-card">
        <template #header>
          <div class="card-header">
            <el-icon>
              <Document />
            </el-icon>
            <span>题目详情</span>
          </div>
        </template>

        <!-- 题目标题 -->
        <h2 class="problem-title">{{ problem.title }}</h2>

        <!-- 题目操作按钮 -->
        <div class="problem-actions">
          <el-tooltip effect="light" :content="problem.tags && problem.tags.length > 0 ? '' : '暂无标签'"
            :visible="showTagTooltip" placement="right" popper-class="tag-tooltip" :hide-after="0">
            <el-button size="small" plain @mouseenter="showTagTooltip = true" @mouseleave="showTagTooltip = false">
              显示标签 <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </el-button>

            <!-- 在 Tooltip 内自定义内容显示标签 -->
            <template #content v-if="problem.tags && problem.tags.length > 0">
              <div class="tag-list">
                <el-tag v-for="tag in problem.tags" :key="tag" size="small" class="problem-tag" style="margin: 4px">
                  {{ tag }}
                </el-tag>
              </div>
            </template>
          </el-tooltip>

          <div class="action-buttons">
            <el-button size="small" type="primary" plain>
              <el-icon>
                <Position />
              </el-icon> 做题清单
            </el-button>
            <el-button size="small" plain>
              <el-icon>
                <DataAnalysis />
              </el-icon> 题目统计
            </el-button>
            <el-button size="small" plain>
              <el-icon>
                <SwitchButton />
              </el-icon> 全部提交
            </el-button>
          </div>
        </div>

        <!-- 题目基本信息 -->
        <div class="problem-info">
          <div class="info-item">
            <span class="info-label">时间限制：</span>
            <span class="info-value">C/C++ {{ problem.timeLimit }}MS，其他语言 {{ problem.timeLimit * 2 }}MS</span>
          </div>
          <div class="info-item">
            <span class="info-label">内存限制：</span>
            <span class="info-value">C/C++ {{ problem.memoryLimit }}MB，其他语言 {{ problem.memoryLimit * 2 }}MB</span>
          </div>
          <div class="info-item">
            <span class="info-label">难度：</span>
            <el-tag size="small" :type="getDifficultyType(problem.difficulty)" effect="plain">{{ problem.difficultyText
            }}</el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">分数：</span>
            <span class="info-value">{{ problem.score || 100 }} OI排行榜分数: {{ calculateRankScore() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">出题人：</span>
            <span class="info-value">{{ problem.author || 'root' }}</span>
          </div>
        </div>

        <!-- 题目内容区域 -->
        <div class="problem-content">
          <!-- 题目描述 -->
          <section class="content-section">
            <h3 class="section-title">描述</h3>
            <div class="section-content" v-html="problem.description"></div>
          </section>

          <!-- 输入描述 -->
          <section class="content-section">
            <h3 class="section-title">输入描述</h3>
            <div class="section-content" v-html="problem.inputDesc"></div>
          </section>

          <!-- 输出描述 -->
          <section class="content-section">
            <h3 class="section-title">输出描述</h3>
            <div class="section-content" v-html="problem.outputDesc"></div>
          </section>

          <!-- 样例 -->
          <section class="content-section">
            <h3 class="section-title">用例输入 {{ problem.samples.length > 0 ? '1' : '' }}
              <el-tag v-if="problem.samples.length > 0" size="small" type="info" class="sample-copy"
                @click="copyToInput(problem.samples[0].input)">复制</el-tag>
            </h3>
            <div class="sample-content" v-if="problem.samples.length > 0">
              <pre>{{ problem.samples[0].input }}</pre>
            </div>
          </section>

          <section class="content-section">
            <h3 class="section-title">用例输出 {{ problem.samples.length > 0 ? '1' : '' }}
              <el-tag v-if="problem.samples.length > 0" size="small" type="info" class="sample-copy"
                @click="copyOutput(problem.samples[0].output)">复制</el-tag>
            </h3>
            <div class="sample-content" v-if="problem.samples.length > 0">
              <pre>{{ problem.samples[0].output }}</pre>
            </div>
          </section>

          <!-- 其他样例(如果有多个) -->
          <template v-for="(sample, index) in problem.samples.slice(1)" :key="index">
            <section class="content-section">
              <h3 class="section-title">用例输入 {{ index + 2 }}
                <el-tag size="small" type="info" class="sample-copy" @click="copyToInput(sample.input)">复制</el-tag>
              </h3>
              <div class="sample-content">
                <pre>{{ sample.input }}</pre>
              </div>
            </section>

            <section class="content-section">
              <h3 class="section-title">用例输出 {{ index + 2 }}
                <el-tag size="small" type="info" class="sample-copy" @click="copyOutput(sample.output)">复制</el-tag>
              </h3>
              <div class="sample-content">
                <pre>{{ sample.output }}</pre>
              </div>
            </section>
          </template>

          <!-- 提示信息 -->
          <section class="content-section" v-if="problem.hint">
            <h3 class="section-title">来源</h3>
            <div class="section-content">{{ problem.source || 'CodesOnline' }}</div>
          </section>
        </div>
      </el-card>
    </div>

    <!-- 右侧代码编辑器 -->
    <div class="code-editor">
      <el-card class="editor-card">
        <template #header>
          <div class="card-header">
            <div class="editor-tools">
              <el-select v-model="language" placeholder="选择语言" size="small">
                <el-option v-for="lang in languages" :key="lang.value" :label="lang.label" :value="lang.value" />
              </el-select>
              <el-button-group>
                <el-button size="small" @click="resetCode">
                  <el-icon>
                    <RefreshLeft />
                  </el-icon>
                  重置
                </el-button>
                <el-button size="small" type="primary" :loading="testing" @click="runTest">
                  <el-icon>
                    <VideoPlay />
                  </el-icon>
                  运行
                </el-button>
                <el-button size="small" type="success" :loading="submitting" @click="submitCode">
                  <el-icon>
                    <Upload />
                  </el-icon>
                  提交
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <!-- 代码编辑区域 -->
        <div class="editor-main">
          <div ref="editorContainer" class="monaco-editor-container"></div>
        </div>

        <!-- 测试区域 -->
        <div class="test-area">
          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="测试用例" name="testCase">
              <div class="test-input">
                <div class="input-header">
                  <span>输入</span>
                  <el-button size="small" text @click="loadSampleInput">
                    加载示例输入
                  </el-button>
                </div>
                <el-input v-model="testInput" type="textarea" :rows="3" placeholder="输入测试数据..." />
              </div>
              <div class="test-output" v-if="testResult">
                <div class="output-header">
                  <span>输出</span>
                  <el-tag :type="getStatusType(testResult.status)" size="small">
                    {{ testResult.status }}
                  </el-tag>
                </div>
                <el-input v-model="testResult.output" type="textarea" :rows="3" readonly />
                <div v-if="testResult.time" class="result-info">
                  <span>执行时间：{{ testResult.time }}ms</span>
                  <span>内存占用：{{ testResult.memory }}KB</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, ArrowDown, Position, DataAnalysis, SwitchButton } from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { getProblemInfo } from '@/api/problem'
import { ProblemEntity } from '@/api/problem/type'

// 获取路由参数
const route = useRoute()
const pid = ref(route.params.pid)
const problemId = ref(route.params.pid || '')
const title = ref(route.query.title || '')

// 状态变量
const isAC = ref(true)
const language = ref('cpp')
const code = ref('')
const testInput = ref('')
const testResult = ref(null)
const activeCollapse = ref(['testCase'])
const testing = ref(false)
const submitting = ref(false)
const loading = ref(true)
// 标签显示控制
const showTagTooltip = ref(false)

// Monaco Editor 相关
const editorContainer = ref<HTMLElement | null>(null)
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 语言映射
const languageMap: Record<string, string> = {
  'cpp': 'cpp',
  'java': 'java',
  'python': 'python'
}

// 支持的编程语言
const languages = [
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Python3', value: 'python' }
]

// 语言模板
const templates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`,
  python: `a, b = map(int, input().split())
print(a + b)`
}

// 静态题目数据 - 实际项目中应该从API获取
const problem: ProblemEntity = ref({
  problemId: route.params.pid,
  title: title.value || 'A+B 问题',
  difficulty: 3,
  difficultyText: '基础',
  timeLimit: 1000,
  memoryLimit: 128,
  description: '输入两个整数a,b，输出它们的和。',
  inputDesc: '两个以空格分分隔的整数。',
  outputDesc: '一个整数。',
  samples: [
    {
      input: '20 30',
      output: '50'
    },
    {
      input: '-10 5',
      output: '-5'
    }
  ],
  hint: '注意处理负数的情况。',
  source: 'CodesOnline',
  tags: ['模拟', '数学', '入门'],
  author: 'root'
})

// 静态提交记录
const submissions = ref([
  {
    submitTime: '2025-04-13 10:30:45',
    status: 'AC',
    language: 'C++',
    time: 1,
    memory: 128
  },
  {
    submitTime: '2025-04-13 10:29:30',
    status: 'WA',
    language: 'C++',
    time: 1,
    memory: 128
  }
])

// 初始化编辑器
const initEditor = () => {
  if (editorContainer.value) {
    monacoEditor = monaco.editor.create(editorContainer.value, {
      value: templates[language.value],
      language: languageMap[language.value],
      theme: 'vs-dark', // 可以改为 'vs' 使用浅色主题
      automaticLayout: true,
      minimap: {
        enabled: true // 是否显示小地图
      },
      fontSize: 14,
      fontFamily: "'Consolas', 'Courier New', monospace",
      scrollBeyondLastLine: false,
      tabSize: 4,
      renderWhitespace: 'selection',
      folding: true,
      lineNumbers: 'on',
      glyphMargin: true,
      lineDecorationsWidth: 5,
      renderLineHighlight: 'all',
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    })

    // 监听编辑器内容变化
    monacoEditor.onDidChangeModelContent(() => {
      code.value = monacoEditor?.getValue() || ''
    })
  }
}

// 更新编辑器语言
const updateEditorLanguage = (newLang: string) => {
  if (monacoEditor) {
    const model = monacoEditor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, languageMap[newLang])
    }
  }
}

// 获取难度标签类型
const getDifficultyType = (difficulty: string | number) => {
  const typeMap: Record<string, string> = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger',
    '1': 'info',    // 语法
    '2': 'info',    // 入门
    '3': 'success', // 基础
    '4': 'success', // 普及
    '5': 'warning', // 提高
    '6': 'warning', // 进阶
    '7': 'danger',  // 省选
    '8': 'danger',  // NOI
    '9': 'danger'   // 国集
  }
  return typeMap[String(difficulty)] || 'info'
}

// 复制输出样例
const copyOutput = (output: string) => {
  navigator.clipboard.writeText(output)
  ElMessage.success('已复制到剪贴板')
}
// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'AC': 'success',
    'WA': 'danger',
    'TLE': 'warning',
    'MLE': 'info',
    'RE': 'error',
    'CE': 'info'
  }
  return typeMap[status] || 'info'
}

// 复制样例到输入
const copyToInput = (input: string) => {
  navigator.clipboard.writeText(input)
  ElMessage.success('已复制到输入框')
}

// 加载示例输入
const loadSampleInput = () => {
  if (problem.value.samples.length > 0) {
    testInput.value = problem.value.samples[0].input
  }
}

// 重置代码
const resetCode = () => {
  ElMessageBox.confirm('确定要重置代码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (monacoEditor) {
      monacoEditor.setValue(templates[language.value])
    }
    ElMessage.success('代码已重置')
  })
}

// 获取编辑器内容
const getCode = () => {
  return monacoEditor?.getValue() || ''
}

// 运行测试
const runTest = async () => {
  if (!testInput.value) {
    ElMessage.warning('请输入测试数据')
    return
  }

  if (!code.value) {
    ElMessage.warning('请输入代码')
    return
  }

  testing.value = true
  setTimeout(() => {
    // 模拟测试结果
    testResult.value = {
      status: 'AC',
      output: '50',
      time: 1,
      memory: 128
    }
    testing.value = false
  }, 1000)
}

// 提交代码
const submitCode = async () => {
  if (!code.value.trim()) {
    ElMessage.warning('请输入代码')
    return
  }

  submitting.value = true
  setTimeout(() => {
    ElMessage.success('提交成功')
    // 添加到提交记录
    submissions.value.unshift({
      submitTime: new Date().toLocaleString(),
      status: 'AC',
      language: languages.find(l => l.value === language.value)?.label || '',
      time: 1,
      memory: 128
    })
    submitting.value = false
  }, 1000)
}

// 获取题目详情
const fetchProblemDetail = async () => {
  loading.value = true
  try {
    const problemIdString = Array.isArray(problemId.value) ? problemId.value[0] : String(problemId.value);
    const response = await getProblemInfo(problemIdString)

    if (response.data && response.data.code === 200) {
      console.log('获取题目详情:', response);
      const data = response.data.data;

      // 处理题目基本信息
      if (data.problem) {
        // 更新题目基本信息
        problem.value = {
          ...problem.value,
          ...data.problem,
          title: data.problem.title || title.value,
          // 将数值难度转换为文本表示
          difficultyText: getDifficultyText(data.problem.difficulty),
          // 处理题目样例
          samples: parseProblemExamples(data.problem.examples),
          // 输入输出描述
          inputDesc: data.problem.input || '',
          outputDesc: data.problem.output || '',
          // 其他字段
          tags: data.tags?.map(tag => tag.name) || []
        };
      }

      // 处理代码模板
      if (data.codeTemplate) {
        // 更新代码模板
        for (const [lang, template] of Object.entries(data.codeTemplate)) {
          if (templates[lang]) {
            templates[lang] = template;
          }
        }

        // 更新当前编辑器内容
        if (monacoEditor && templates[language.value]) {
          monacoEditor.setValue(templates[language.value]);
        }
      }

    } else {
      ElMessage.warning(response.data?.msg || '获取题目详情失败');
    }
  } catch (error) {
    console.error('加载题目详情失败:', error);
    ElMessage.error('加载题目详情失败');
  } finally {
    loading.value = false;
  }
}

// 解析题目样例字符串为结构化数据
const parseProblemExamples = (examples: string): { input: string, output: string }[] => {
  if (!examples) return [];

  try {
    // 尝试解析JSON格式
    return JSON.parse(examples);
  } catch (e) {
    // 如果不是JSON格式，尝试其他格式解析
    // 假设examples格式为"input1:output1|input2:output2"
    const samples = [];
    const samplePairs = examples.split('|');

    for (const pair of samplePairs) {
      const [input, output] = pair.split(':');
      if (input && output) {
        samples.push({ input: input.trim(), output: output.trim() });
      }
    }

    return samples.length > 0 ? samples : [{ input: '示例数据', output: '示例输出' }];
  }
}

// 计算排行榜分数
const calculateRankScore = (): string => {
  const baseScore = problem.value.score || 100;
  const difficulty = problem.value.difficulty || 3;
  const rankScore = Math.round((0.1 * baseScore + 2 * difficulty) * 10) / 10;

  return `${rankScore}(0.1*分数+2*难度)`;
}

// 获取难度的文本表示
const getDifficultyText = (difficulty: number): string => {
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
  };

  return difficultyMap[difficulty] || '未知';
}

// 监听语言变化
watch(language, (newLang) => {
  updateEditorLanguage(newLang)
  if (!code.value || code.value === templates[language.value]) {
    if (monacoEditor) {
      monacoEditor.setValue(templates[newLang])
    }
  }
})

// 组件挂载时初始化编辑器和加载题目数据
onMounted(() => {
  fetchProblemDetail()
  initEditor()
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (monacoEditor) {
    monacoEditor.dispose()
  }
})

// 初始化代码
code.value = templates[language.value]
</script>

<style scoped>
/* 标签气泡样式 */
.tag-tooltip {
  max-width: 300px !important;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
}

:deep(.el-tooltip__popper) {
  max-width: 300px;
}

.problem-header-tabs {
  margin-bottom: 10px;
}

.problem-title {
  font-size: 22px;
  margin: 15px 0;
  text-align: left;
  color: #333;
}

.problem-actions {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.problem-info {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #606266;
  width: 80px;
}

.section-title {
  color: #409EFF;
  font-size: 18px;
  margin: 20px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
}

.content-section {
  margin-bottom: 20px;
}

.section-content {
  line-height: 1.6;
  color: #303133;
}

.sample-content {
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}

.sample-content pre {
  margin: 0;
  padding: 12px;
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.sample-copy {
  margin-left: 10px;
  cursor: pointer;
}

.sample-copy:hover {
  background-color: #ecf5ff;
}

/* ========== 主要布局 ========== */
.problem-container {
  display: flex;
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
  gap: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

.problem-description {
  flex: 0 0 45%;
  max-width: 45%;
}

.code-editor {
  flex: 0 0 55%;
  max-width: 55%;
  display: flex;
  flex-direction: column;
}

/* ========== 卡片通用样式 ========== */
.description-card,
.editor-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 24px;
  height: 100%;
}

.description-card:hover,
.editor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

/* ========== 题目内容样式 ========== */
.problem-header {
  width: 100%;
}

.problem-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.problem-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.limit-info {
  color: #606266;
  font-size: 14px;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.problem-tag {
  font-size: 12px;
}

.ac-alert {
  margin-top: 16px;
}

.section-subtitle {
  margin: 24px 0 16px;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.description-content {
  line-height: 1.6;
  color: #303133;
}

/* ========== 样例部分 ========== */
.sample-case {
  margin: 16px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.sample-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.sample-case pre {
  margin: 0;
  padding: 12px;
  background-color: #fafafa;
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ========== 编辑器样式 ========== */
.editor-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.editor-main {
  padding: 16px;
  flex: 1;
}

.monaco-editor-container {
  width: 100%;
  height: 600px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

/* 编辑器主题自定义 */
:deep(.monaco-editor) {
  padding: 8px 0;
}

:deep(.monaco-editor .margin) {
  background-color: #f5f7fa;
}

/* ========== 测试区域样式 ========== */
.test-area {
  border-top: 1px solid #dcdfe6;
}

.test-input,
.test-output {
  padding: 16px;
}

.input-header,
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-info {
  margin-top: 8px;
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 14px;
}

:deep(.el-textarea__inner) {
  font-family: 'Consolas', monospace;
  font-size: 14px;
}

/* ========== 提交记录表格样式 ========== */
:deep(.el-table) {
  margin-top: 12px;
  background-color: transparent;
  --el-table-border-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: bold;
  padding: 0 8px;
}

:deep(.el-collapse-item__content) {
  padding: 8px;
}

/* 自定义滚动条 */
.problem-description:deep(::-webkit-scrollbar) {
  width: 6px;
}

.problem-description:deep(::-webkit-scrollbar-thumb) {
  background-color: #909399;
  border-radius: 3px;
}

.problem-description:deep(::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}

/* ========== 响应式设计 ========== */
@media screen and (max-width: 1400px) {
  .problem-container {
    padding: 20px 5%;
  }
}

@media screen and (max-width: 1200px) {
  .problem-container {
    padding: 20px 16px;
  }

  .problem-title {
    font-size: 20px;
  }
}

@media screen and (max-width: 768px) {
  .problem-container {
    flex-direction: column;
  }

  .problem-description,
  .code-editor {
    flex: none;
    max-width: 100%;
  }

  .monaco-editor-container {
    height: 400px;
  }
}
</style>