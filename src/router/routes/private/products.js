export default [
    {
        path: '/products',
        name: 'products',
        component: () => import('../../../views/products/ProductsView.vue'),
        meta: { requiresAuth: true },
    },
];
