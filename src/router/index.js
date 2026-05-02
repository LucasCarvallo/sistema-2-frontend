import { createRouter, createWebHistory } from 'vue-router';
import RootView from '../views/RootView.vue';
import ErrorPage from '../views/ErrorPage.vue';
import { useSessionStore } from '@/stores/session';

// Rutas publicas
import authRoutes from './routes/public/auth';

// Rutas privadas
import adminRoutes from './routes/private/admin';
import gestionRoutes from './routes/private/gestion';
import productsRoutes from './routes/private/products';
import systemRoutes from './routes/private/system';
import userRoutes from './routes/private/user';
import toolsRoutes from './routes/private/tools';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...authRoutes,
        ...adminRoutes,
        ...gestionRoutes,
        ...productsRoutes,
        ...systemRoutes,
        ...userRoutes,
        ...toolsRoutes,
        {
            path: '/',
            name: 'root',
            component: RootView,
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: ErrorPage,
            props: {
                code: 404,
            },
        },
    ],
});

router.beforeEach((to) => {
    const session = useSessionStore();
    const isAuthenticated = Boolean(session.token);

    if (to.meta.requiresAuth && !isAuthenticated) {
        return '/';
    }

    if (to.meta.guestOnly && isAuthenticated) {
        return '/';
    }

    return true;
});

export default router;
