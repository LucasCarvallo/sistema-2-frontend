/**
 * Servicio de autenticación.
 * Conecta el backend con el store de sesión.
 *
 * Uso:
 *   import { login, logout } from '@/lib/auth'
 *
 *   try {
 *     await login({ email: '...', password: '...' })
 *     router.push('/')
 *   } catch (e) {
 *     // e es HttpError: e.message, e.status, e.errors
 *   }
 */

import { apiPost } from './http/token'
import { useSessionStore } from '@/stores/session'

/**
 * Autentica al usuario y guarda el token + datos en el store.
 * Lanza HttpError si las credenciales son inválidas.
 */
export async function login(credentials) {
  const data = await apiPost('/auth/login', credentials)
  const session = useSessionStore()
  session.setSession({ token: data.token, user: data.user })
}

/**
 * Cierra sesión en el backend y limpia el store local.
 */
export async function logout() {
  const session = useSessionStore()
  try {
    await apiPost('/auth/logout', {})
  } finally {
    // Siempre limpiar localmente aunque el backend falle
    session.clearSession()
  }
}
