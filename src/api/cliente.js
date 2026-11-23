// Cliente HTTP único del frontend: todas las llamadas al backend pasan por aquí.
//
// Responsabilidades:
// 1. Armar la URL con la base de la API (VITE_API_URL o http://localhost:8080/api/v1).
// 2. Enviar/recibir JSON.
// 3. Adjuntar el header "Authorization: Bearer <accessToken>" cuando hay sesión.
// 4. Renovar el accessToken automáticamente (POST /auth/refresh) si está por vencer
//    o si el backend responde 401, y reintentar la petición una vez.
// 5. Convertir las respuestas de error del backend ({ mensaje, campo }) en ApiError.

import { borrarTokens, guardarTokens, obtenerTokens, tokenPorVencer } from "./sesion";

export const API_URL = (import.meta.env?.VITE_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
    constructor(mensaje, status = 0, campo = null) {
        super(mensaje);
        this.name = "ApiError";
        this.status = status;
        this.campo = campo;
    }
}

// Evita pedir varios refresh a la vez si hay peticiones en paralelo.
let refrescoEnCurso = null;

export function renovarTokens() {
    if (refrescoEnCurso) return refrescoEnCurso;

    const tokens = obtenerTokens();
    if (!tokens) return Promise.reject(new ApiError("No hay sesión activa.", 401));

    refrescoEnCurso = fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
    })
        .then(async respuesta => {
            const datos = await leerCuerpo(respuesta);
            if (!respuesta.ok) {
                borrarTokens();
                throw new ApiError(datos?.mensaje || "La sesión expiró. Inicia sesión nuevamente.", respuesta.status);
            }
            guardarTokens(datos);
            return datos;
        })
        .finally(() => {
            refrescoEnCurso = null;
        });

    return refrescoEnCurso;
}

async function leerCuerpo(respuesta) {
    if (respuesta.status === 204) return null;
    const texto = await respuesta.text();
    if (!texto) return null;
    try {
        return JSON.parse(texto);
    } catch {
        return { mensaje: texto };
    }
}

/**
 * Llama a la API.
 * @param {string} ruta   ej: "/productos" o "/productos/5"
 * @param {object} opciones { method, body, auth } — auth=false no envía el token.
 */
export async function api(ruta, { method = "GET", body, auth = true, reintento = true } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let tokens = auth ? obtenerTokens() : null;
    if (tokens && tokenPorVencer(tokens.accessToken)) {
        try {
            tokens = await renovarTokens();
        } catch {
            tokens = null; // se envía sin token; si la ruta es privada el backend responderá 401
        }
    }
    if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;

    let respuesta;
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new ApiError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.", 0);
    }

    // Token rechazado: se intenta renovar una vez y se repite la petición.
    if (respuesta.status === 401 && tokens && reintento) {
        try {
            await renovarTokens();
        } catch (error) {
            throw error instanceof ApiError ? error : new ApiError("La sesión expiró.", 401);
        }
        return api(ruta, { method, body, auth, reintento: false });
    }

    const datos = await leerCuerpo(respuesta);
    if (!respuesta.ok) {
        throw new ApiError(datos?.mensaje || `Error ${respuesta.status} al comunicarse con el servidor.`, respuesta.status, datos?.campo || null);
    }
    return datos;
}
