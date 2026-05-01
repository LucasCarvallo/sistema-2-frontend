import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'app_theme'

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
]

export const useThemeStore = defineStore('theme', () => {
  const current = ref(localStorage.getItem(STORAGE_KEY) ?? 'light')

  /** Aplica el tema al elemento <html> y lo persiste */
  function apply(themeId) {
    current.value = themeId
    localStorage.setItem(STORAGE_KEY, themeId)
    document.documentElement.setAttribute('data-bs-theme', themeId)
  }

  /** Debe llamarse una sola vez al iniciar la app */
  function init() {
    apply(current.value)
  }

  return { current, themes: THEMES, apply, init }
})
