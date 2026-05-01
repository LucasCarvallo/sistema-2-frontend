export default [
    {
      path: '/account',
      name: 'account',
      component: () => import('../../../views/user/AccountView.vue'),
      meta: { requiresAuth: true },
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('../../../views/user/SettingsView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/help',
        name: 'help',
        component: () => import('../../../views/user/HelpView.vue'),
        meta: { requiresAuth: true },
    }
]