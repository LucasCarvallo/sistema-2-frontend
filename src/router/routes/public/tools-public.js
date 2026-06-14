export default [
    {
        path: '/tools/esp32',
        name: 'esp32',
        component: () => import('../../../views/tools/Esp32.vue'),
        meta: { requiresAuth: false },
    }
]