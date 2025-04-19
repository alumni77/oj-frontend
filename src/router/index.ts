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
      path: '/admin/login',
      component: () => import('@/views/admin/login.vue'),
      name: 'adminLogin',
    },
    {
      path: '/admin',
      component: () => import('@/layout/AdminLayout.vue'),
      name: 'admin',
      redirect: '/admin/login',
      children: [
        {
          path: 'dashboard',
          component: () => import('@/views/admin/dashboard.vue'),
          name: 'dashboard',
          meta: { title: '仪表盘' },
        },
        {
          path: 'users',
          component: () => import('@/views/admin/users.vue'),
          name: 'adminUsers',
          meta: { title: '用户管理' },
        },
        // {
        //   path: 'problems',
        //   redirect: '/admin/problems/list',
        //   name: 'adminProblems',
        //   meta: { title: '题目管理' },
        //   children: [
        //     {
        //       path: 'list',
        //       component: () => import('@/views/admin/problems/list.vue'),
        //       name: 'adminProblemsList',
        //       meta: { title: '题目列表' },
        //     },
        //     {
        //       path: 'create',
        //       component: () => import('@/views/admin/problems/create.vue'),
        //       name: 'adminProblemsCreate',
        //       meta: { title: '创建题目' },
        //     },
        //     {
        //       path: 'tags',
        //       component: () => import('@/views/admin/problems/tags.vue'),
        //       name: 'adminProblemsTags',
        //       meta: { title: '标签管理' },
        //     },
        //   ],
        // },
        // {
        //   path: 'trainings',
        //   redirect: '/admin/trainings/list',
        //   name: 'adminTrainings',
        //   meta: { title: '训练管理' },
        //   children: [
        //     {
        //       path: 'list',
        //       component: () => import('@/views/admin/trainings/list.vue'),
        //       name: 'adminTrainingsList',
        //       meta: { title: '训练列表' },
        //     },
        //     {
        //       path: 'create',
        //       component: () => import('@/views/admin/trainings/create.vue'),
        //       name: 'adminTrainingsCreate',
        //       meta: { title: '创建训练' },
        //     },
        //     {
        //       path: 'categories',
        //       component: () => import('@/views/admin/trainings/categories.vue'),
        //       name: 'adminTrainingsCategories',
        //       meta: { title: '分类管理' },
        //     },
        //   ],
        // },
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
