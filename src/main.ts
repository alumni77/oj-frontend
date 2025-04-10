import { createApp } from 'vue'
import App from '@/App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'virtual:svg-icons-register'
import gloalComponent from '@/components'
import router from './router'
import pinia from './store'

const app = createApp(App)

app.use(gloalComponent)
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.use(pinia)
app.mount('#app')
