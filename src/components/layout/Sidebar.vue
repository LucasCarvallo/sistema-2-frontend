<template>
  <div class="sidebar-inner">
    <div class="sidebar-menu">
      <template v-for="group in menu" :key="group.category">
        <div class="sidebar-category">{{ group.category }}</div>
        <RouterLink
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="sidebar-link"
          :class="{ active: isActive(item) }"
          @click="onLinkClick"
        >
          <i :class="['bi', item.icon, 'sidebar-link-icon']"></i>
          <span>{{ item.name }}</span>
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'

const route = useRoute()
const sidebarStore = useSidebarStore()

const menu = [
  {
    category: 'Principal',
    items: [
      { name: 'Dashboard', path: '/', icon: 'bi-speedometer2' },
    ],
  },
  {
    category: 'Gestión',
    items: [
      { name: 'Usuarios', path: '/users', icon: 'bi-people' },
      { name: 'Reportes', path: '/reports', icon: 'bi-bar-chart-line' },
    ],
  },
  {
    category: 'Sistema',
    items: [
      { name: 'Configuración', path: '/settings', icon: 'bi-gear' },
      { name: 'Ayuda', path: '/help', icon: 'bi-question-circle' },
    ],
  },
]

function isActive(item) {
  if (item.path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(item.path)
}

function onLinkClick() {
  // En mobile cerramos el sidebar al navegar
  if (sidebarStore.isMobileViewport()) {
    sidebarStore.setCollapsed(true)
  }
}
</script>

<style scoped>
.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.sidebar-menu {
  padding: 0.75rem 0;
}

.sidebar-category {
  padding: 0.6rem 1.1rem 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.5rem;
}

.sidebar-menu > .sidebar-category:first-child {
  margin-top: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 1.1rem;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 0.375rem;
  margin: 0.1rem 0.5rem;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sidebar-link.active {
  background-color: rgba(13, 110, 253, 0.85);
  color: #fff;
}

.sidebar-link-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
</style>
