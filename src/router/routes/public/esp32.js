export default [
    {
        path: '/tools/esp32',
        name: 'esp32',
        component: () => import('../../../views/esp32/Esp32.vue'),
        meta: { requiresAuth: false },
    },
    {
        path: '/tools/esp32-grouped',
        name: 'esp32-grouped',
        component: () => import('../../../views/esp32/Esp32Grouped.vue'),
        meta: { requiresAuth: false },
    },
];