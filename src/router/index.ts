import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
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
        path: 'gamejam',
        name: 'gamejam',
        component: () => import('@/views/gamejam/GameJam5.vue'),
        meta: { title: '第五届GameJam' }
      },
      {
        path: 'gamejam/list',
        name: 'gamejam-list',
        component: () => import('@/views/gamejam/GameJam.vue'),
        meta: { title: '往届记录' }
      },
      {
        path: 'gamejam/1',
        name: 'gamejam-1',
        component: () => import('@/views/gamejam/GameJam1.vue'),
        meta: { title: '第一届GameJam' }
      },
      {
        path: 'gamejam/2',
        name: 'gamejam-2',
        component: () => import('@/views/gamejam/GameJam2.vue'),
        meta: { title: '第二届GameJam' }
      },
      {
        path: 'gamejam/3',
        name: 'gamejam-3',
        component: () => import('@/views/gamejam/GameJam3.vue'),
        meta: { title: '第三届GameJam' }
      },
      {
        path: 'gamejam/4',
        name: 'gamejam-4',
        component: () => import('@/views/gamejam/GameJam4.vue'),
        meta: { title: '第四届GameJam' }
      },
      {
        path: 'gamejam/5',
        name: 'gamejam-5',
        component: () => import('@/views/gamejam/GameJam5.vue'),
        meta: { title: '第五届GameJam' }
      },
      {
        path: 'gamejam/:edition/vote',
        name: 'gamejam-vote',
        component: () => import('@/views/gamejam/GameJamVote.vue'),
        meta: { title: 'GameJam 作品打分', requiresAuth: true }
      },
      {
        path: 'friendlink',
        name: 'friendlink',
        component: () => import('@/views/friendlink/FriendLink.vue'),
        meta: { title: '友链' }
      },
      {
        path: 'tutorial',
        name: 'tutorial-list',
        component: () => import('@/views/tutorial/TutorialList.vue'),
        meta: { title: '教程中心' }
      },
      {
        path: 'tutorial/:category/:page',
        name: 'tutorial-page-nested',
        component: () => import('@/views/tutorial/TutorialPage.vue'),
        meta: { title: '教程详情' }
      },
      {
        path: 'tutorial/:page',
        name: 'tutorial-page',
        component: () => import('@/views/tutorial/TutorialPage.vue'),
        meta: { title: '教程详情' }
      },
      {
        path: 'mascot',
        name: 'mascot',
        component: () => import('@/views/mascot/MascotPage.vue'),
        meta: { title: '看板娘' }
      },
      {
        path: 'talent',
        name: 'talent-list',
        component: () => import('@/views/talent/TalentList.vue'),
        meta: { title: '人才库' }
      },
      {
        path: 'talent/my',
        name: 'talent-my',
        component: () => import('@/views/talent/TalentMy.vue'),
        meta: { title: '我的档案', requiresAuth: true }
      },
      {
        path: 'talent/:id',
        name: 'talent-detail',
        component: () => import('@/views/talent/TalentDetail.vue'),
        meta: { title: '人才详情' }
      },
      {
        path: 'assetweb',
        name: 'assetweb',
        component: () => import('@/views/assetweb/AssetWeb.vue'),
        meta: { title: '资源网站分享' }
      },
      {
        path: 'user/profile',
        name: 'user-profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'user/messages',
        name: 'user-messages',
        component: () => import('@/views/user/UserMessages.vue'),
        meta: { title: '我的消息', requiresAuth: true }
      },
      {
        path: 'user/:id',
        name: 'user-detail',
        component: () => import('@/views/user/UserDetail.vue'),
        meta: { title: '用户详情' }
      },
      {
        path: 'backend',
        component: () => import('@/layouts/BackendLayout.vue'),
        meta: { title: '管理后台', requiresAdmin: true },
        children: [
          {
            path: 'article',
            name: 'backend-article',
            component: () => import('@/views/backend/BackendArticle.vue'),
            meta: { title: '文章管理', requiresAdmin: true }
          },
          {
            path: 'project',
            name: 'backend-project',
            component: () => import('@/views/backend/BackendProject.vue'),
            meta: { title: '项目管理', requiresAdmin: true }
          },
          {
            path: 'user',
            name: 'backend-user',
            component: () => import('@/views/backend/BackendUser.vue'),
            meta: { title: '用户管理', requiresAdmin: true }
          },
          {
            path: 'category',
            name: 'backend-category',
            component: () => import('@/views/backend/BackendCategory.vue'),
            meta: { title: '分类管理', requiresAdmin: true }
          }
        ]
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
  history: createWebHashHistory(),
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

  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    ElMessage.warning('需要管理员权限')
    next({ name: 'home' })
    return
  }

  next()
})

export default router
