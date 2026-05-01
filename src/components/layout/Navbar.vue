<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top px-3">
    <!-- Izquierda: toggle sidebar + logo + nombre -->
    <div class="d-flex align-items-center gap-2">
      <button
        class="btn btn-outline-secondary btn-sm sidebar-toggle-btn"
        type="button"
        @click="sidebarStore.toggle()"
        aria-label="Toggle sidebar"
      >
        <i class="bi bi-list fs-5"></i>
      </button>

      <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2 mb-0">
        <img src="/favicon.ico" alt="Logo" width="28" height="28" class="rounded" />
        <span class="fw-semibold">Mi Sistema</span>
      </RouterLink>
    </div>

    <!-- Derecha: dropdown de cuenta -->
    <div class="ms-auto">
      <!-- Usuario autenticado -->
      <div v-if="session.user" class="dropdown">
        <button
          class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-person-circle fs-5"></i>
          <span class="d-none d-sm-inline">{{ session.user.name }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <span class="dropdown-item-text text-muted small px-3">{{ session.user.email }}</span>
          </li>
          <li><hr class="dropdown-divider" /></li>
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
        <RouterLink to="/login" class="btn btn-outline-light btn-sm">
          <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar sesión
        </RouterLink>
        <RouterLink to="/register" class="btn btn-primary btn-sm">
          <i class="bi bi-person-plus me-1"></i>Registrarse
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useSessionStore } from '@/stores/session'

const sidebarStore = useSidebarStore()
const session = useSessionStore()

function handleLogout() {
  session.logout()
}
</script>

<style scoped>
.sidebar-toggle-btn {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.75);
}
.sidebar-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
