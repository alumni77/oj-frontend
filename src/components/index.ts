import { App, Component } from 'vue'
import SvgIcon from './SvgIcon/index.vue'

// 定义一个组件映射类型
interface GlobalComponents {
  [key: string]: Component
}

const allGlobalComponents: GlobalComponents = { 'svg-icon': SvgIcon }

export default {
  install(app: App) {
    Object.keys(allGlobalComponents).forEach((key) => {
      // 使用类型断言确保 key 是有效的索引
      app.component(key, allGlobalComponents[key])
    })
  },
}
