// Almacenamiento de la sesión (tokens JWT) en el navegador.
//
// - Se guarda en localStorage para que la sesión sobreviva a una recarga de página
//   o a cerrar la pestaña (requisito de persistencia).
// - Solo se guardan los tokens: los datos del usuario (rol, estado) se piden siempre
//   al backend con GET /auth/me, así que editar localStorage a mano NO da más permisos.
// - El accessToken dura 15 minutos; al vencer, el cliente HTTP lo renueva con el
//   refreshToken (7 días). Si el refresh falla, la sesión se cierra.

const CLAVE_SESION = "sesion_nubeplay";

export function obtenerTokens() {
    try {
        const valor = JSON.parse(localStorage.getItem(CLAVE_SESION));
        return valor?.accessToken && valor?.refreshToken ? valor : null;
    } catch {
        return null;
    }
}

export function guardarTokens({ accessToken, refreshToken }) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ accessToken, refreshToken }));
    window.dispatchEvent(new Event("sesion-cambiada"));
}

export function borrarTokens() {
    localStorage.removeItem(CLAVE_SESION);
    window.dispatchEvent(new Event("sesion-cambiada"));
}

// Lee el contenido (payload) de un JWT sin verificar la firma: solo se usa para
// conocer la fecha de expiración. La verificación real la hace el backend.
export function leerPayload(token) {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

// true si el token vence dentro de `margenSegundos` (o ya venció).
export function tokenPorVencer(token, margenSegundos = 30) {
    const payload = leerPayload(token);
    if (!payload?.exp) return true;
    return payload.exp * 1000 - Date.now() < margenSegundos * 1000;
}
