export default [
    {
      path: '/account',
      name: 'account',
      component: () => import('../../../views/user/AccountView.vue'),
      meta: { requiresAuth: true },
    }
]