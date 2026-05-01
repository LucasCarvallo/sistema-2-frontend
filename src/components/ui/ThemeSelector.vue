<template>
    <div class="theme-selector">
        <div class="row g-3">
            <div v-for="theme in themeStore.themes" :key="theme.id" class="col-12 col-sm-4">
                <label
                    :class="[
                        'theme-card',
                        'd-flex align-items-start gap-3 p-3 rounded-3 cursor-pointer',
                        { active: themeStore.current === theme.id },
                    ]"
                >
                    <input
                        type="radio"
                        name="theme"
                        :value="theme.id"
                        :checked="themeStore.current === theme.id"
                        class="visually-hidden"
                        @change="themeStore.apply(theme.id)"
                    />

                    <!-- Preview miniatura -->
                    <div :class="['theme-preview', `theme-preview--${theme.id}`]">
                        <div class="theme-preview__navbar"></div>
                        <div class="theme-preview__body">
                            <div class="theme-preview__sidebar"></div>
                            <div class="theme-preview__content">
                                <div class="theme-preview__line"></div>
                                <div class="theme-preview__line short"></div>
                            </div>
                        </div>
                    </div>

                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center gap-2 fw-semibold">
                            <i :class="['bi', theme.icon]"></i>
                            {{ theme.label }}
                        </div>
                        <div class="text-muted small mt-1">{{ theme.description }}</div>
                    </div>

                    <i
                        v-if="themeStore.current === theme.id"
                        class="bi bi-check-circle-fill text-primary fs-5 mt-1"
                    ></i>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

/* ── Card seleccionable ───────────────────────────────────────────────────── */
.theme-card {
    border: 2px solid var(--bs-border-color);
    background-color: var(--bs-secondary-bg, #f8f9fa);
    transition:
        border-color 0.15s ease,
        background-color 0.15s ease,
        box-shadow 0.15s ease;
    user-select: none;
}

.theme-card:hover {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.12);
}

.theme-card.active {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.2);
}

/* ── Miniatura de previsualización ───────────────────────────────────────── */
.theme-preview {
    width: 56px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
}

.theme-preview__navbar {
    height: 10px;
    flex-shrink: 0;
}

.theme-preview__body {
    flex: 1;
    display: flex;
}

.theme-preview__sidebar {
    width: 14px;
    flex-shrink: 0;
}

.theme-preview__content {
    flex: 1;
    padding: 3px 4px;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.theme-preview__line {
    height: 3px;
    border-radius: 2px;
    opacity: 0.5;
}

.theme-preview__line.short {
    width: 60%;
}

/* ── Colores por tema ─────────────────────────────────────────────────────── */

/* Light */
.theme-preview--light .theme-preview__navbar {
    background: #212529;
}
.theme-preview--light .theme-preview__sidebar {
    background: #343a40;
}
.theme-preview--light .theme-preview__content {
    background: #f8f9fa;
}
.theme-preview--light .theme-preview__line {
    background: #adb5bd;
}

/* Dark */
.theme-preview--dark .theme-preview__navbar {
    background: #1a1d20;
}
.theme-preview--dark .theme-preview__sidebar {
    background: #212529;
}
.theme-preview--dark .theme-preview__content {
    background: #2c3034;
}
.theme-preview--dark .theme-preview__line {
    background: #6c757d;
}

/* Slate */
.theme-preview--slate .theme-preview__navbar {
    background: #0c1526;
}
.theme-preview--slate .theme-preview__sidebar {
    background: #0f172a;
}
.theme-preview--slate .theme-preview__content {
    background: #1e293b;
}
.theme-preview--slate .theme-preview__line {
    background: #3b82f6;
}
</style>
