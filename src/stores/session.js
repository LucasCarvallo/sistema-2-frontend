import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const TOKEN_KEY = 'auth_token'

export const useSessionStore = defineStore('session', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem(TOKEN_KEY) ?? null)

  const isAuthenticated = computed(() => Boolean(user.value))

  /** Guarda token + datos de usuario tras un login exitoso */
  function setSession({ token: rawToken, user: userData }) {
    token.value = rawToken
    user.value = userData
    localStorage.setItem(TOKEN_KEY, rawToken)
  }

  /** Limpia sesión completa (logout) */
  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  // ── Helpers usados por el login de la UI (demo sin backend) ──────────────
  function login(userData) {
    user.value = userData
  }

  function logout() {
    clearSession()
  }

  return { user, token, isAuthenticated, setSession, clearSession, login, logout }
})
