export default [
    {
        path: '/tools/esp32',
        name: 'esp32',
        component: () => import('../../../views/esp32/Esp32.vue'),
        meta: { requiresAuth: false },
    }
]