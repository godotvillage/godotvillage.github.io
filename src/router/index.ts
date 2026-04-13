import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home/HomePage.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'article',
        name: 'article-list',
        component: () => import('@/views/article/ArticleList.vue'),
        meta: { title: '文章' }
      },
      {
        path: 'article/create',
        name: 'article-create',
        component: () => import('@/views/article/ArticleCreate.vue'),
        meta: { title: '发布文章', requiresAuth: true }
      },
      {
        path: 'article/:id',
        name: 'article-detail',
        component: () => import('@/views/article/ArticleDetail.vue'),
        meta: { title: '文章详情' }
      },
      {
        path: 'article/:id/edit',
        name: 'article-edit',
        component: () => import('@/views/article/ArticleEdit.vue'),
        meta: { title: '编辑文章', requiresAuth: true }
      },
      {
        path: 'project',
        name: 'project-list',
        component: () => import('@/views/project/ProjectList.vue'),
        meta: { title: '项目' }
      },
      {
        path: 'project/create',
        name: 'project-create',
        component: () => import('@/views/project/ProjectCreate.vue'),
        meta: { title: '创建项目', requiresAuth: true }
      },
      {
        path: 'project/:id',
        name: 'project-detail',
        component: () => import('@/views/project/ProjectDetail.vue'),
        meta: { title: '项目详情' }
      },
      {
        path: 'project/:id/edit',
        name: 'project-edit',
        component: () => import('@/views/project/ProjectEdit.vue'),
        meta: { title: '编辑项目', requiresAuth: true }
      },
      {
        path: 'user/profile',
        name: 'user-profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'user/:id',
        name: 'user-detail',
        component: () => import('@/views/user/UserDetail.vue'),
        meta: { title: '用户详情' }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', guest: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Godot新手村'} - Godot新手村`

  const authStore = useAuthStore()

  // 需要登录的页面
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录访问游客页面（如登录页）
  if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
