<template>
    <nav class="navbar app-navbar navbar-expand-md fixed-top px-3">
        <!-- Izquierda: toggle sidebar + logo + nombre -->
        <div class="d-flex align-items-center gap-2">
            <button
                v-if="session.user"
                class="btn btn-sm sidebar-toggle-btn"
                type="button"
                @click="sidebarStore.toggle()"
                aria-label="Toggle sidebar"
            >
                <i class="bi bi-list fs-5"></i>
            </button>

            <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2 mb-0">
                <img src="/favicon.ico" alt="Logo" width="28" height="28" class="rounded" />
                <span class="fw-semibold">Sistema</span>
            </RouterLink>
        </div>

        <!-- Derecha: dropdown de cuenta -->
        <div class="ms-auto">
            <!-- Usuario autenticado -->
            <div v-if="session.user" class="dropdown">
                <button
                    class="btn btn-sm navbar-account-btn dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <i class="bi bi-person-circle fs-5"></i>
                    <span class="d-none d-sm-inline">{{ session.user.name }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <span class="dropdown-item-text text-muted small px-3">{{
                            session.user.email
                        }}</span>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                        <RouterLink to="/account" class="dropdown-item">
                            <i class="bi bi-person me-2"></i>Mi cuenta
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/settings" class="dropdown-item">
                            <i class="bi bi-gear me-2"></i>Configuración
                        </RouterLink>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                        <button class="dropdown-item text-danger" @click="handleLogout">
                            <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                        </button>
                    </li>
                </ul>
            </div>

            <!-- Usuario no autenticado -->
            <div v-else class="d-flex gap-2">
                <RouterLink to="/login" class="btn btn-sm navbar-ghost-btn">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar sesión
                </RouterLink>
                <RouterLink to="/register" class="btn btn-primary btn-sm navbar-primary-btn">
                    <i class="bi bi-person-plus me-1"></i>Registrarse
                </RouterLink>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebar';
import { useSessionStore } from '@/stores/session';

const sidebarStore = useSidebarStore();
const session = useSessionStore();
const router = useRouter();

function handleLogout() {
    session.logout();
    router.push('/');
}
</script>

<style scoped>
.app-navbar {
    background: var(--app-navbar-bg, rgba(33, 37, 41, 0.92));
    border-bottom: 1px solid var(--app-navbar-border, rgba(255, 255, 255, 0.08));
    backdrop-filter: blur(18px);
    color: var(--app-navbar-color, #fff);
}

.navbar-brand {
    color: var(--app-navbar-color, #fff);
}

.navbar-brand:hover {
    color: var(--app-navbar-color, #fff);
}

.sidebar-toggle-btn {
    border: 1px solid var(--app-navbar-button-border, rgba(255, 255, 255, 0.2));
    background: var(--app-navbar-button-bg, rgba(255, 255, 255, 0.04));
    color: var(--app-navbar-muted, rgba(255, 255, 255, 0.75));
}

.sidebar-toggle-btn:hover {
    background-color: var(--app-navbar-button-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: var(--app-navbar-button-border, rgba(255, 255, 255, 0.2));
    color: var(--app-navbar-button-hover-color, #fff);
}

.navbar-account-btn,
.navbar-ghost-btn {
    border: 1px solid var(--app-navbar-button-border, rgba(255, 255, 255, 0.2));
    background: var(--app-navbar-button-bg, rgba(255, 255, 255, 0.04));
    color: var(--app-navbar-color, #fff);
}

.navbar-account-btn:hover,
.navbar-ghost-btn:hover {
    background: var(--app-navbar-button-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--app-navbar-button-hover-color, #fff);
    border-color: var(--app-navbar-button-border, rgba(255, 255, 255, 0.2));
}

.navbar-primary-btn {
    box-shadow: 0 10px 20px rgba(13, 110, 253, 0.18);
}
</style>
