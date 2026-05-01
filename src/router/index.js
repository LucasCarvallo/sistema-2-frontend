import { createRouter, createWebHistory } from 'vue-router';
import RootView from '../views/RootView.vue';
import { useSessionStore } from '@/stores/session';

// Rutas publicas
import authRoutes from './routes/public/auth';

// Rutas privadas
import adminRoutes from './routes/private/admin';
import userRoutes from './routes/private/user';
import systemRoutes from './routes/private/system';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...authRoutes,
        ...adminRoutes,
        ...userRoutes,
        ...systemRoutes,
        {
            path: '/',
            name: 'root',
            component: RootView,
        },
        {
            path: '/products',
            name: 'products',
            component: () => import('../views/ProductsView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/clients',
            name: 'clients',
            component: () => import('../views/ClientsView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/reports',
            name: 'reports',
            component: () => import('../views/ReportsView.vue'),
            meta: { requiresAuth: true },
        },
    ],
});

router.beforeEach((to) => {
    const session = useSessionStore();
    const isAuthenticated = Boolean(session.user);

    if (to.meta.requiresAuth && !isAuthenticated) {
        return '/';
    }

    if (to.meta.guestOnly && isAuthenticated) {
        return '/';
    }

    return true;
});

export default router;
