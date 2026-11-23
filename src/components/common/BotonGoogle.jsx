import { useEffect, useRef, useState } from "react";

// Botón oficial "Iniciar sesión con Google" (Google Identity Services).
// Google muestra su propia ventana para elegir la cuenta y devuelve un "ID token" (credential).
// Ese token NO se usa como sesión: se envía al backend (POST /auth/google), que lo verifica
// con las claves públicas de Google y entrega los JWT de NUBEPLAY.
//
// Requiere el ID de cliente OAuth en la variable VITE_GOOGLE_CLIENT_ID (ver .env.example).
// Si no está configurado, el botón no se muestra.

const URL_SCRIPT = "https://accounts.google.com/gsi/client";
let cargaScript = null;

export function obtenerGoogleClientId() {
    return import.meta.env?.VITE_GOOGLE_CLIENT_ID || window.NUBEPLAY_GOOGLE_CLIENT_ID || "";
}

function cargarScriptGoogle() {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (!cargaScript) {
        cargaScript = new Promise((resolver, rechazar) => {
            const script = document.createElement("script");
            script.src = URL_SCRIPT;
            script.async = true;
            script.defer = true;
            script.onload = resolver;
            script.onerror = () => {
                cargaScript = null;
                rechazar(new Error("No se pudo cargar Google."));
            };
            document.head.appendChild(script);
        });
    }
    return cargaScript;
}

/**
 * @param texto "signin_with" (Iniciar sesión con Google) o "signup_with" (Registrarse con Google)
 * @param onCredencial función que recibe el ID token de Google
 */
function BotonGoogle({ texto = "signin_with", onCredencial, deshabilitado = false, separador = "arriba", textoSeparador = "o continúa con" }) {
    const contenedor = useRef(null);
    const callback = useRef(onCredencial);
    const [error, setError] = useState(null);
    const clientId = obtenerGoogleClientId();

    callback.current = onCredencial;

    useEffect(() => {
        if (!clientId) return;
        let activo = true;
        cargarScriptGoogle()
            .then(() => {
                if (!activo || !contenedor.current) return;
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: respuesta => callback.current?.(respuesta.credential),
                    ux_mode: "popup",
                    cancel_on_tap_outside: true
                });
                window.google.accounts.id.renderButton(contenedor.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    shape: "pill",
                    text: texto,
                    locale: "es",
                    width: Math.min(contenedor.current.offsetWidth || 320, 400)
                });
            })
            .catch(e => activo && setError(e.message));
        return () => { activo = false; };
    }, [clientId, texto]);

    if (!clientId) return null;

    const linea = (
        <div className="d-flex align-items-center my-3 text-muted small">
            <hr className="flex-grow-1" />
            <span className="px-2">{textoSeparador}</span>
            <hr className="flex-grow-1" />
        </div>
    );

    return (
        <div data-testid="boton-google">
            {separador === "arriba" && linea}
            <div
                ref={contenedor}
                className="d-flex justify-content-center"
                style={deshabilitado ? { pointerEvents: "none", opacity: 0.6 } : undefined}
            ></div>
            {error && <p className="text-danger small text-center mt-2 mb-0">{error}</p>}
            {separador === "abajo" && linea}
        </div>
    );
}

export default BotonGoogle;
