export default [
    {
        path: '/settings',
        name: 'settings',
        component: () => import('../../../views/system/SettingsView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/help',
        name: 'help',
        component: () => import('../../../views/system/HelpView.vue'),
        meta: { requiresAuth: true },
    },
];
