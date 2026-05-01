import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const TOKEN_KEY = 'auth_token';

// Seguridad: se usa sessionStorage en lugar de localStorage.
// - sessionStorage se limpia automáticamente al cerrar la pestaña/ventana,
//   reduciendo la ventana de exposición del token.
// - localStorage persiste indefinidamente y es accesible a cualquier script
//   de la misma origen (riesgo ante XSS).
// - Para "recordarme" persistente se recomienda usar cookies HttpOnly (backend).
const storage = sessionStorage;

export const useSessionStore = defineStore('session', () => {
    const user = ref(null);
    const token = ref(storage.getItem(TOKEN_KEY) ?? null);

    const isAuthenticated = computed(() => Boolean(user.value));

    /** Guarda token + datos de usuario tras un login exitoso */
    function setSession({ token: rawToken, user: userData }) {
        token.value = rawToken;
        user.value = userData;
        storage.setItem(TOKEN_KEY, rawToken);
    }

    /** Limpia sesión completa (logout): borra token del storage y estado en memoria */
    function clearSession() {
        token.value = null;
        user.value = null;
        storage.removeItem(TOKEN_KEY);
        // Limpiar también localStorage por si quedaron restos de versiones anteriores
        localStorage.removeItem(TOKEN_KEY);
    }

    // ── Helpers usados por el login de la UI (demo sin backend) ──────────────
    function login(userData) {
        user.value = userData;
        // Nota: en demo no se guarda token. restoreSession() no hará nada en este modo.
    }

    function logout() {
        clearSession();
    }

    return { user, token, isAuthenticated, setSession, clearSession, login, logout };
});
