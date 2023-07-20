import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from '@/auth/firebase'
import Dashboard from '@/views/Dashboard.vue'
import Download from '@/views/Download.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/download/:id',
      name: 'download',
      meta: { requiresAuth: false, layout: 'auth' },
      component: Download
    },
    {
      path: '/',
      name: 'dashboard',
      meta: { requiresAuth: true },
      component: Dashboard
    },
    {
      path: '/send',
      name: 'send',
      meta: { requiresAuth: true },
      component: () => import('../views/Upload.vue')
    },
    {
      path: '/plans/choose',
      name: 'choose-plan',
      meta: { requiresAuth: true },
      component: () => import('../views/ChoosePlan.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      meta: { requiresAuth: true },
      component: () => import('../views/Settings.vue')
    },
    {
      path: '/tests',
      name: 'tests',
      meta: { requiresAuth: true },
      component: () => import('../views/Experimenting.vue')
    },
    {
      path: '/register',
      name: 'register',
      meta: { layout: 'auth', },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Register.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: { layout: 'auth' },
      component: () => import('../views/Login.vue')
    },
    {
      path: '/templates/new',
      name: 'new-template',
      meta: { requiresAuth: true },
      component: () => import('../views/CreateTemplate/CreateTemplate.vue')
    },
  ]
})

/**
 * Auth route guard
 */
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);

  // If we don't need to guard this page (i.e. it's ok for every
  // kind of user to see), we can move forward quickly
  if (requiresAuth === undefined || guestOnly === undefined) {
    return next()
  }

  // if it needs guarding tho, we'll let Cloud Identity load up its
  // initial (authentication) state before we make our decision.
  getCurrentUser()
    .then(user => {
      const someonesLoggedIn = user !== null;

      if (guestOnly && someonesLoggedIn) {
        return next('/')
      }

      if (requiresAuth && !someonesLoggedIn) {
        return next('/register')
      }

      return next();
    })
})

export default router
