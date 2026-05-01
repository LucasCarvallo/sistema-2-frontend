export default [
    {
        path: '/users',
        name: 'users',
        component: () => import('../../../views/admin/UsersView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/roles',
        name: 'roles',
        component: () => import('../../../views/admin/RolesView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/permissions',
        name: 'permissions',
        component: () => import('../../../views/admin/PermissionsView.vue'),
        meta: { requiresAuth: true },
    },
];
