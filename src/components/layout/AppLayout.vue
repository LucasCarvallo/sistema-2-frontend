<template>
    <div class="app-wrapper">
        <!-- Navbar fijo arriba -->
        <AppNavbar />

        <!-- Backdrop (solo mobile cuando sidebar abierto) -->
        <Transition name="fade-backdrop">
            <div
                v-if="canShowSidebar && sidebarStore.sidebarOpen && sidebarStore.isMobileViewport()"
                class="sidebar-backdrop"
                @click="sidebarStore.setCollapsed(true)"
            ></div>
        </Transition>

        <!-- Sidebar -->
        <Transition name="slide-sidebar">
            <aside v-if="canShowSidebar" v-show="sidebarStore.sidebarOpen" class="app-sidebar">
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebar';
import { useSessionStore } from '@/stores/session';
import AppNavbar from './Navbar.vue';
import AppSidebar from './Sidebar.vue';

const sidebarStore = useSidebarStore();
const session = useSessionStore();
const wasMobileViewport = ref(sidebarStore.isMobileViewport());

const canShowSidebar = computed(() => Boolean(session.user));

const pushContent = computed(
    () => canShowSidebar.value && sidebarStore.sidebarOpen && !sidebarStore.isMobileViewport(),
);

function handleResize() {
    const isMobile = sidebarStore.isMobileViewport();

    // Evita cerrar/abrir en cada resize; solo reacciona cuando cruza el breakpoint.
    if (isMobile !== wasMobileViewport.value) {
        if (isMobile) {
            sidebarStore.setCollapsed(true);
        } else {
            sidebarStore.setCollapsed(false);
        }
        wasMobileViewport.value = isMobile;
    }
}

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.app-wrapper {
    min-height: 100vh;
}

/* Sidebar */
.app-sidebar {
    position: fixed;
    top: 56px;
    left: 0;
    width: 260px;
    height: calc(100vh - 56px);
    z-index: 1040;
    overflow-y: auto;
    border-right: 1px solid var(--app-sidebar-border, transparent);
    box-shadow: var(--app-card-shadow, 2px 0 8px rgba(0, 0, 0, 0.15));
    background-color: var(--app-sidebar-bg, #212529);
    backdrop-filter: blur(18px);
}

/* Contenido principal */
.app-main {
    margin-top: 56px;
    padding: 1.5rem;
    transition: margin-left 0.3s ease;
}

.app-main-inner {
    min-height: calc(100vh - 56px - 3rem);
}

.app-main--pushed {
    margin-left: 260px;
}

/* Backdrop mobile */
.sidebar-backdrop {
    position: fixed;
    inset: 0;
    background-color: var(--app-backdrop-bg, rgba(0, 0, 0, 0.5));
    z-index: 1039;
}

@media (max-width: 767.98px) {
    .app-main {
        padding: 1rem;
    }

    .app-main-inner {
        min-height: calc(100vh - 56px - 2rem);
    }
}

/* Transición sidebar */
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
    transition:
        transform 0.3s ease,
        opacity 0.3s ease;
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
