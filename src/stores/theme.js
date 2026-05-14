import { ref } from 'vue';
import { defineStore } from 'pinia';

const LEGACY_STORAGE_KEY = 'app_theme';
const STORAGE_KEY_CURRENT = 'app_theme_current';
const STORAGE_KEY_SELECTED = 'app_theme_selected';

/** Opciones disponibles de tema */
export const THEMES = [
    {
        id: 'light',
        label: 'Claro',
        description: 'Tema claro por defecto',
        icon: 'bi-sun',
    },
    {
        id: 'dark',
        label: 'Oscuro',
        description: 'Tema oscuro clásico',
        icon: 'bi-moon-stars',
    },
    {
        id: 'slate',
        label: 'Slate',
        description: 'Oscuro azulado moderno',
        icon: 'bi-layers',
    },
];

export const useThemeStore = defineStore('theme', () => {
    const themeIds = THEMES.map((theme) => theme.id);

    function normalizeThemeId(themeId, fallback = 'light') {
        return themeIds.includes(themeId) ? themeId : fallback;
    }

    function firstNonLightTheme() {
        return THEMES.find((theme) => theme.id !== 'light')?.id ?? 'light';
    }

    const legacyTheme = localStorage.getItem(LEGACY_STORAGE_KEY);

    const selected = ref(
        normalizeThemeId(
            localStorage.getItem(STORAGE_KEY_SELECTED) ?? legacyTheme ?? firstNonLightTheme(),
            firstNonLightTheme(),
        ),
    );

    const current = ref(
        normalizeThemeId(localStorage.getItem(STORAGE_KEY_CURRENT) ?? legacyTheme ?? 'light', 'light'),
    );

    /** Aplica el tema al elemento <html> y lo persiste */
    function apply(themeId) {
        const normalized = normalizeThemeId(themeId, 'light');
        current.value = normalized;
        localStorage.setItem(STORAGE_KEY_CURRENT, normalized);
        // Compatibilidad hacia atras con instalaciones previas.
        localStorage.setItem(LEGACY_STORAGE_KEY, normalized);
        document.documentElement.setAttribute('data-bs-theme', normalized);
    }

    /** Guarda el tema seleccionado en Settings y lo aplica */
    function setSelected(themeId, options = {}) {
        const applyNow = options.applyNow ?? true;
        const normalized = normalizeThemeId(themeId, firstNonLightTheme());

        selected.value = normalized;
        localStorage.setItem(STORAGE_KEY_SELECTED, normalized);

        if (applyNow) {
            apply(normalized);
        }
    }

    /** Alterna entre tema claro y tema seleccionado en Settings */
    function toggleLightSelected() {
        if (current.value === 'light') {
            const target = selected.value === 'light' ? firstNonLightTheme() : selected.value;
            apply(target);
            return;
        }

        if (current.value !== 'light') {
            selected.value = current.value;
            localStorage.setItem(STORAGE_KEY_SELECTED, selected.value);
        }
        apply('light');
    }

    /** Debe llamarse una sola vez al iniciar la app */
    function init() {
        selected.value = normalizeThemeId(selected.value, firstNonLightTheme());
        apply(current.value);

        if (!themeIds.includes(selected.value)) {
            setSelected(firstNonLightTheme(), { applyNow: false });
        }
    }

    return { current, selected, themes: THEMES, apply, setSelected, toggleLightSelected, init };
});
