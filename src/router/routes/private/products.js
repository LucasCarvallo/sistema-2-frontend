export default [
    {
        path: '/products',
        name: 'products',
        component: () => import('../../../views/products/ProductsView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/products/attributes',
        name: 'products.attributes',
        component: () => import('../../../views/products/AttributesView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/products/relations',
        name: 'products.relations',
        component: () => import('../../../views/products/RelationsView.vue'),
        meta: { requiresAuth: true },
    },
];
