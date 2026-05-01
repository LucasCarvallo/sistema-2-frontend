<template>
  <div class="app-wrapper">
    <!-- Navbar fijo arriba -->
    <AppNavbar />

    <!-- Backdrop (solo mobile cuando sidebar abierto) -->
    <Transition name="fade-backdrop">
      <div
        v-if="sidebarStore.sidebarOpen && sidebarStore.isMobileViewport()"
        class="sidebar-backdrop"
        @click="sidebarStore.setCollapsed(true)"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide-sidebar">
      <aside
        v-show="sidebarStore.sidebarOpen"
        class="app-sidebar bg-dark"
      >
        <AppSidebar />
      </aside>
    </Transition>

    <!-- Contenido principal -->
    <main :class="['app-main', { 'app-main--pushed': pushContent }]">
      <div class="app-main-inner">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import AppNavbar from './Navbar.vue'
import AppSidebar from './Sidebar.vue'

const sidebarStore = useSidebarStore()
const wasMobileViewport = ref(sidebarStore.isMobileViewport())

const pushContent = computed(
  () => sidebarStore.sidebarOpen && !sidebarStore.isMobileViewport()
)

function handleResize() {
  const isMobile = sidebarStore.isMobileViewport()

  // Evita cerrar/abrir en cada resize; solo reacciona cuando cruza el breakpoint.
  if (isMobile !== wasMobileViewport.value) {
    if (isMobile) {
      sidebarStore.setCollapsed(true)
    } else {
      sidebarStore.setCollapsed(false)
    }
    wasMobileViewport.value = isMobile
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}

/* Sidebar */
.app-sidebar {
  position: fixed;
  top: 56px; /* altura del navbar */
  left: 0;
  width: 260px;
  height: calc(100vh - 56px);
  z-index: 1040;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

/* Contenido principal */
.app-main {
  margin-top: 56px;
  padding: 1.5rem;
  transition: margin-left 0.3s ease;
}

.app-main--pushed {
  margin-left: 260px;
}

/* Backdrop mobile */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1039;
}

/* Transición sidebar */
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-sidebar-enter-to,
.slide-sidebar-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Transición backdrop */
.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
}
.fade-backdrop-enter-to,
.fade-backdrop-leave-from {
  opacity: 1;
}
</style>
