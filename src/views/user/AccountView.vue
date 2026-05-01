<template>
    <div>
        <h4 class="mb-4"><i class="bi bi-person-circle me-2 text-primary"></i>Mi cuenta</h4>

        <div class="card border-0 shadow-sm" v-if="session.user">
            <div class="card-body">
                <div class="mb-3">
                    <div class="text-muted small">Nombre</div>
                    <div class="fw-semibold">{{ session.user.name }}</div>
                </div>

                <div class="mb-4">
                    <div class="text-muted small">Email</div>
                    <div class="fw-semibold">{{ session.user.email }}</div>
                </div>

                <button class="btn btn-outline-danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                </button>
            </div>
        </div>

        <div v-else class="alert alert-warning mb-0">
            No hay sesión activa.
            <RouterLink to="/login" class="alert-link">Inicia sesión</RouterLink>.
        </div>
    </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const router = useRouter();

function handleLogout() {
    session.logout();
    router.push('/');
}
</script>
