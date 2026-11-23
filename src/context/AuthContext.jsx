import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/servicios";
import { borrarTokens, guardarTokens, obtenerTokens } from "../api/sesion";
import { esRolAdmin, esRolCliente, esRolVendedor } from "../utils/formato";

const AuthContext = createContext(null);

// Gestión de la sesión en el frontend:
// - Al iniciar sesión se guardan el accessToken y el refreshToken (src/api/sesion.js).
// - Al recargar la página, si hay tokens guardados, se valida la sesión con GET /auth/me
//   (si el accessToken venció, el cliente HTTP lo renueva solo con el refreshToken).
//   Así el rol y el estado del usuario siempre vienen del backend, no del navegador.
// - Si la renovación falla (refresh vencido, usuario desactivado o eliminado), la sesión se cierra.
// - La sesión se sincroniza entre pestañas con el evento "storage".
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [verificando, setVerificando] = useState(() => Boolean(obtenerTokens()));

    const refrescarSesion = useCallback(async () => {
        if (!obtenerTokens()) {
            setUsuario(null);
            return null;
        }
        try {
            const actual = await authApi.yo();
            setUsuario(actual);
            return actual;
        } catch (error) {
            if (error.status === 401 || error.status === 403) borrarTokens();
            setUsuario(null);
            return null;
        } finally {
            setVerificando(false);
        }
    }, []);

    // Restaurar la sesión al cargar la página.
    useEffect(() => {
        refrescarSesion();
    }, [refrescarSesion]);

    // Si los tokens se borran (refresh fallido o cierre en otra pestaña) se cierra la sesión aquí también.
    useEffect(() => {
        function alCambiarSesion() {
            if (!obtenerTokens()) setUsuario(null);
        }
        function alCambiarStorage(evento) {
            if (evento.key !== "sesion_nubeplay") return;
            if (!evento.newValue) setUsuario(null);
            else refrescarSesion();
        }
        window.addEventListener("sesion-cambiada", alCambiarSesion);
        window.addEventListener("storage", alCambiarStorage);
        return () => {
            window.removeEventListener("sesion-cambiada", alCambiarSesion);
            window.removeEventListener("storage", alCambiarStorage);
        };
    }, [refrescarSesion]);

    // Guarda los JWT que entregó el backend (login normal o con Google) y deja al usuario conectado.
    async function abrirSesion(peticion) {
        try {
            const respuesta = await peticion();
            guardarTokens(respuesta);
            setUsuario(respuesta.usuario);
            return { ok: true, usuario: respuesta.usuario };
        } catch (error) {
            return {
                ok: false,
                tipo: error.status === 403 ? "warning" : "danger",
                mensaje: error.message || "No se pudo iniciar sesión."
            };
        }
    }

    function iniciarSesion(correo, password) {
        return abrirSesion(() => authApi.login(correo.trim(), password.trim()));
    }

    // POST /auth/google con el ID token de Google: el backend lo verifica, crea o vincula la cuenta y entrega los JWT.
    function iniciarSesionConGoogle(credential) {
        return abrirSesion(() => authApi.google(credential));
    }

    function cerrarSesion() {
        borrarTokens();
        setUsuario(null);
    }

    const valor = {
        usuario,
        verificando,
        esAdmin: esRolAdmin(usuario),
        esVendedor: esRolVendedor(usuario),
        esCliente: esRolCliente(usuario),
        iniciarSesion,
        iniciarSesionConGoogle,
        cerrarSesion,
        refrescarSesion
    };

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
    return contexto;
}
