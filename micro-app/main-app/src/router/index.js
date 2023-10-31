import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChildApp from '../child_app.vue'
import ChildVueApp from '../child_vue_app.vue'
import ChildReactApp from '../child_react_app.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      // 👇 非严格匹配，/my-page/* 都指向 MyPage 页面
      path: '/child-app/:page*',
      name: 'child-app',
      component: ChildApp,
    },
    {
      // 👇 非严格匹配，/my-page/* 都指向 MyPage 页面
      path: '/child-vue-app/:page*',
      name: 'child-vue-app',
      component: ChildVueApp,
    },
    {
      // 👇 非严格匹配，/my-page/* 都指向 MyPage 页面
      path: '/child-react-app/:page*',
      name: 'child-react-app',
      component: ChildReactApp,
    },
  ]
})

export default router
