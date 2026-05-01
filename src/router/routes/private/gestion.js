export default [
    {
        path: '/clients',
        name: 'clients',
        component: () => import('../../../views/gestion/ClientsView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/reports',
        name: 'reports',
        component: () => import('../../../views/gestion/ReportsView.vue'),
        meta: { requiresAuth: true },
    },
];
