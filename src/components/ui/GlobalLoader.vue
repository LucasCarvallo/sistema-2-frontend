<script setup>
import { computed } from 'vue';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();

const visible = computed(() => ui.isLoading);
const message = computed(() => ui.loadingMessage || 'Cargando...');
</script>

<template>
    <teleport to="body">
        <transition name="loader-fade">
            <div v-if="visible" class="global-loader" role="status" aria-live="polite" aria-busy="true">
                <div class="loader-card">
                    <div class="spinner-border text-light" aria-hidden="true"></div>
                    <p class="loader-text mb-0">{{ message }}</p>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<style scoped>
.global-loader {
    position: fixed;
    inset: 0;
    z-index: 2200;
    display: grid;
    place-items: center;
    background: rgba(10, 14, 23, 0.55);
    backdrop-filter: blur(2px);
    pointer-events: all;
}

.loader-card {
    min-width: 230px;
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    background: rgba(20, 27, 43, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 0.6rem 1.5rem rgba(0, 0, 0, 0.35);
}

.loader-text {
    color: #f7f9fc;
    font-weight: 500;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
    transition: opacity 0.2s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
    opacity: 0;
}
</style>
