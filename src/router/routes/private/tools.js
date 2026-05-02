export default [
    {
        path: '/tools/jsonbeauty',
        name: 'jsonbeauty',
        component: () => import('../../../views/tools/Jsonbeauty.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/tools/pruebas',
        name: 'pruebas',
        component: () => import('../../../views/tools/Pruebas.vue'),
        meta: { requiresAuth: true },
    },
];