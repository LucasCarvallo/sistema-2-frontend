<script setup>
import { onMounted } from 'vue';
import AppLayout from './components/layout/AppLayout.vue';
import GlobalLoader from '@/components/ui/GlobalLoader.vue';
import { useThemeStore } from '@/stores/theme';
import { restoreSession } from '@/lib/auth';

const themeStore = useThemeStore();

onMounted(async () => {
    themeStore.init();
    // Revalida el token almacenado contra GET /me.
    // En modo demo (sin backend) retorna inmediatamente sin hacer nada.
    await restoreSession();
});
</script>

<template>
    <AppLayout />
    <GlobalLoader />
</template>

<style scoped>
header {
    line-height: 1.5;
    max-height: 100vh;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

nav {
    width: 100%;
    font-size: 12px;
    text-align: center;
    margin-top: 2rem;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }

    nav {
        text-align: left;
        margin-left: -1rem;
        font-size: 1rem;

        padding: 1rem 0;
        margin-top: 1rem;
    }
}
</style>
