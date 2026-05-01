export default [
    {
        path: '/login',
        name: 'login',
        component: () => import('../../../views/auth/Login.vue'),
        meta: { guestOnly: true },
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../../../views/auth/Register.vue'),
        meta: { guestOnly: true },
    },
];
