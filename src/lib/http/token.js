/**
 * Cliente HTTP con autenticación Bearer Token.
 * Usa la variable de entorno VITE_API_URL como base.
 *
 * Lanza HttpError en respuestas no-ok y en errores de red.
 * Uso:
 *   import { apiGet, apiPost } from '@/lib/http/token'
 *   const data = await apiGet('/users')
 *   const data = await apiPost('/users', { name: 'Juan' })
 */

import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'https://api.sistema.lucas.test').replace(
    /\/$/,
    '',
);

export class HttpError extends Error {
    constructor(status, message, errors = null) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.errors = errors; // array de errores de validación (ej. Laravel)
    }
}

async function request(path, options = {}) {
    const session = useSessionStore();
    const ui = useUiStore();
    const {
        loading = true,
        loadingMessage = 'Cargando...',
        headers: customHeaders,
        ...fetchOptions
    } = options;
    const token = session.token;

    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(customHeaders ?? {}),
    };

    if (loading) {
        ui.beginLoading(loadingMessage);
    }

    try {
        let res;
        try {
            res = await fetch(`${BASE_URL}/api${path}`, { ...fetchOptions, headers });
        } catch {
            throw new HttpError(0, 'No se pudo conectar con el servidor.');
        }

        if (!res.ok) {
            let body = {};
            try {
                body = await res.json();
            } catch {
                // respuesta no-JSON (ej. HTML de error 500)
            }
            throw new HttpError(
                res.status,
                body.message ?? `Error ${res.status}: ${res.statusText}`,
                body.errors ?? null,
            );
        }

        // 204 No Content u otras respuestas sin cuerpo
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    } finally {
        if (loading) {
            ui.endLoading();
        }
    }
}

export const apiGet = (path, options = {}) => request(path, { ...options, method: 'GET' });

export const apiPost = (path, data, options = {}) =>
    request(path, { ...options, method: 'POST', body: JSON.stringify(data) });

export const apiPut = (path, data, options = {}) =>
    request(path, { ...options, method: 'PUT', body: JSON.stringify(data) });

export const apiPatch = (path, data, options = {}) =>
    request(path, { ...options, method: 'PATCH', body: JSON.stringify(data) });

export const apiDelete = (path, options = {}) => request(path, { ...options, method: 'DELETE' });
