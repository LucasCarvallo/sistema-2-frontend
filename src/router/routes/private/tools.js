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
        // component: () => import('../../../views/tools/V.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/tools/requerimientos',
        name: 'requerimientos',
        component: () => import('../../../views/tools/Requerimientos.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/tools/requerimientos/:id',
        name: 'requerimientos-detalle',
        component: () => import('../../../views/tools/RequerimientoDetalle.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/tools/esp32',
        name: 'esp32',
        component: () => import('../../../views/tools/Esp32.vue'),
        meta: { requiresAuth: true },
    },
];