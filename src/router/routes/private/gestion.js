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
    {
        path: '/employees',
        name: 'employees',
        component: () => import('../../../views/gestion/EmployeesView.vue'),
        meta: { requiresAuth: true },
    },
];
