import { ref } from 'vue';
import { defineStore } from 'pinia';

const MOBILE_BREAKPOINT = 768;

export const useSidebarStore = defineStore('sidebar', () => {
    // En desktop abre por defecto, en mobile cerrado
    const sidebarOpen = ref(window.innerWidth >= MOBILE_BREAKPOINT);

    function toggle() {
        sidebarOpen.value = !sidebarOpen.value;
    }

    function setCollapsed(collapsed) {
        sidebarOpen.value = !collapsed;
    }

    function isMobileViewport() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }

    return { sidebarOpen, toggle, setCollapsed, isMobileViewport };
});
