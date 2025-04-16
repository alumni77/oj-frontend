import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/user/LoginRegisterForm.vue'),
      name: 'loginRegisterForm',
    },
    {
      path: '/',
      component: () => import('@/layout/index.vue'),
      name: 'layout',
      redirect: '/home',
      children: [
        {
          path: 'home',
          component: () => import('@/views/Home.vue'),
          name: 'home',
          meta: { title: '首页' },
        },
        {
          path: 'problem',
          component: () => import('@/views/problem/index.vue'),
          name: 'problem',
          meta: { title: '题目' },
        },
        {
          path: 'problem/:pid',
          component: () => import('@/views/problem/problem.vue'),
          name: 'problemDetail',
          meta: { title: '题目详情' },
          props: true, // 允许将路由参数作为props传递给组件
        },
        {
          path: 'training',
          component: () => import('@/views/training/index.vue'),
          name: 'training',
          meta: { title: '训练' },
        },
        {
          path: 'training/:tid',
          component: () => import('@/views/training/trainingDetail.vue'),
          name: 'trainingDetail',
          meta: { title: '训练详情' },
          props: true,
        },
        {
          path: 'judge',
          component: () => import('@/views/judge/index.vue'),
          name: 'judge',
          meta: { title: '评测' },
        },
        {
          path: 'rank',
          component: () => import('@/views/rank/index.vue'),
          name: 'rank',
          meta: { title: '排名' },
        },
        {
          path: 'about',
          component: () => import('@/views/about/index.vue'),
          name: 'about',
          meta: { title: '关于' },
        },
        {
          path: 'profile',
          component: () => import('@/views/user/Profile.vue'),
          name: 'profile',
          meta: { title: '个人中心' },
        },
        {
          path: 'submission',
          component: () => import('@/views/user/Submssion.vue'),
          name: 'submission',
          meta: { title: '提交记录' },
        },
        {
          path: 'settings',
          component: () => import('@/views/user/Settings.vue'),
          name: 'settings',
          meta: { title: '账号设置' },
        },
      ],
    },
    {
      path: '/404',
      component: () => import('@/views/404.vue'),
      name: '404',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
      name: 'NotFound',
    },
  ],
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    }
  },
})

export default router
