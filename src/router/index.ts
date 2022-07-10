import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import Dashboard from '@/views/Dashboard.vue'
import AddSecret from '@/views/AddSecret/AddSecret.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      meta: { requiresAuth: false },
      component: Dashboard
    },
    {
      path: '/new',
      name: 'add-secret',
      meta: { requiresAuth: true },
      component: AddSecret
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
      path: '/register',
      name: 'register',
      meta: { layout: 'auth', guestOnly: true },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Register.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: { layout: 'auth', guestOnly: true },
      component: () => import('../views/Login.vue')
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

  // if it needs guarding tho, we guard
  const authStore = useAuthStore()
  const someonesLoggedIn = authStore.signedIn;

  if (guestOnly && someonesLoggedIn) {
    return next('/')
  }

  if (requiresAuth && !someonesLoggedIn) {
    return next('/login')
  }

  return next();
})

export default router
