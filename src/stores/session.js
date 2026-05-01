import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', () => {
  // Simula un usuario autenticado. null = no autenticado
  const user = ref(null)

  function login(userData) {
    user.value = userData
  }

  function logout() {
    user.value = null
  }

  return { user, login, logout }
})
