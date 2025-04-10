import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
      name: 'Login',
    },
    {
      path: '/',
      component: () => import('@/views/Home.vue'),
      name: 'Home',
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
