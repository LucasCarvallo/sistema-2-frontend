/**
 * Cliente HTTP con autenticación por Cookie CSRF (Laravel Sanctum SPA).
 * Usa la variable de entorno VITE_WEB_URL como base (o VITE_API_URL si no se define).
 *
 * Obtiene automáticamente la cookie CSRF si aún no está presente.
 * Lanza HttpError en respuestas no-ok y en errores de red.
 * Uso:
 *   import { webGet, webPost } from '@/lib/http/cookie'
 *   const data = await webGet('/user')
 *   const data = await webPost('/login', { email, password })
 */

import { HttpError } from './token';

const BASE_URL = import.meta.env.VITE_WEB_URL ?? import.meta.env.VITE_API_URL ?? '';

// ─── CSRF ─────────────────────────────────────────────────────────────────────

function getXsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

async function ensureCsrf() {
    if (getXsrfToken()) return;
    try {
        await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
    } catch {
        throw new HttpError(0, 'No se pudo obtener el token CSRF.');
    }
}

// ─── Cliente base ──────────────────────────────────────────────────────────────

async function request(path, options = {}) {
    await ensureCsrf();

    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-XSRF-TOKEN': getXsrfToken(),
        ...(options.headers ?? {}),
    };

    let res;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            credentials: 'include',
            ...options,
            headers,
        });
    } catch {
        throw new HttpError(0, 'No se pudo conectar con el servidor.');
    }

    if (!res.ok) {
        let body = {};
        try {
            body = await res.json();
        } catch {
            // respuesta no-JSON
        }
        throw new HttpError(
            res.status,
            body.message ?? `Error ${res.status}: ${res.statusText}`,
            body.errors ?? null,
        );
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export const webGet = (path, options = {}) => request(path, { ...options, method: 'GET' });

export const webPost = (path, data, options = {}) =>
    request(path, { ...options, method: 'POST', body: JSON.stringify(data) });

export const webPut = (path, data, options = {}) =>
    request(path, { ...options, method: 'PUT', body: JSON.stringify(data) });

export const webPatch = (path, data, options = {}) =>
    request(path, { ...options, method: 'PATCH', body: JSON.stringify(data) });

export const webDelete = (path, options = {}) => request(path, { ...options, method: 'DELETE' });
