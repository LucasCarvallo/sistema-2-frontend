import { createRouter, createWebHistory } from 'vue-router'
import RootView from '../views/RootView.vue'
import { useSessionStore } from '@/stores/session'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: RootView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/Account.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/permissions',
      name: 'permissions',
      component: () => import('../views/PermissionsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('../views/ClientsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/HelpView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const session = useSessionStore()
  const isAuthenticated = Boolean(session.user)

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/'
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return '/'
  }

  return true
})

export default router
