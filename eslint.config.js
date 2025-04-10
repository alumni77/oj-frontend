import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig([
  // 添加忽略配置
  {
    ignores: ['**/node_modules/**', '**/dist/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        jsxPragma: 'React',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  // 通用规则
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    rules: {
      // eslint 规则
      'no-var': 'error', // 要求使用let或const而不是var
      'no-multiple-empty-lines': ['warn', { max: 1 }], // 不允许多个空行
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unexpected-multiline': 'error', // 禁止空余的多行
      'no-useless-escape': 'off', // 禁止不必要的转义字符
    },
  },
  // TypeScript 规则
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error', // 禁止定义未使用的变量
      '@typescript-eslint/prefer-ts-expect-error': 'error', // 禁止使用 @ts-ignore
      '@typescript-eslint/no-explicit-any': 'off', // 禁止使用any类型
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-namespace': 'off', // 禁止使用自定义 TypeScript模块和命名空间
      '@typescript-eslint/semi': 'off',
    },
  },
  // Vue 规则
  {
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off', // 要求组件名称始终为"-"连接的单词
      'vue/no-mutating-props': 'off', // 不允许组件prop的改变
      'vue/attribute-hyphenation': 'off', // 对模板中的自定义组件强制执行属性命名样式
    },
  },
])
