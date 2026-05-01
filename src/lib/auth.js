/**
 * Servicio de autenticación.
 * Conecta el backend con el store de sesión.
 *
 * Uso:
 *   import { login, logout, restoreSession } from '@/lib/auth'
 *
 *   try {
 *     await login({ email: '...', password: '...' })
 *     router.push('/')
 *   } catch (e) {
 *     // e es HttpError: e.message, e.status, e.errors
 *   }
 */

import { apiGet, apiPost } from './http/token'
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

/**
 * Revalida el token almacenado llamando a GET /me en el backend.
 * Debe invocarse al iniciar la app (App.vue → onMounted) para restaurar
 * la sesión del usuario tras un recargo de página.
 *
 * Seguridad:
 * - Si el token expiró o fue revocado el backend devuelve 401 → limpia la sesión.
 * - En modo demo (sin backend) session.token === null → retorna sin hacer nada.
 * - No se registra el token en consola ni en reportes de error.
 */
export async function restoreSession() {
  const session = useSessionStore()
  if (!session.token) return // demo o sin token → nada que restaurar

  try {
    const user = await apiGet('/me')
    session.user = user
  } catch {
    // Token inválido, expirado o backend no disponible → limpiar sesión
    session.clearSession()
  }
}
