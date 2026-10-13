import { createContext, useContext, useState } from "react";
import * as db from "../data/db";
import { esRolAdmin, esRolVendedor } from "../utils/formato";

const AuthContext = createContext(null);

// Compara la sesión guardada con la "base de datos": si el usuario fue eliminado o
// desactivado se cierra la sesión, y siempre se usan su rol y datos actuales.
export function validarSesion(sesion) {
    if (!sesion) return null;

    const actual = db.obtenerUsuarioPorId(sesion.id);
    if (!actual || actual.estado === "Inactivo") {
        db.cerrarSesion();
        return null;
    }

    db.guardarSesion(actual);
    return actual;
}

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => validarSesion(db.obtenerSesion()));

    function iniciarSesion(correo, password) {
        const encontrado = db.buscarUsuarioPorCredenciales(correo.trim(), password.trim());

        if (!encontrado) {
            return { ok: false, tipo: "danger", mensaje: "Correo o contraseña incorrectos." };
        }
        if (encontrado.estado === "Inactivo") {
            return { ok: false, tipo: "warning", mensaje: "Tu cuenta se encuentra inactiva. Contacta al soporte." };
        }

        db.guardarSesion(encontrado);
        setUsuario(encontrado);
        return { ok: true, usuario: encontrado };
    }

    function cerrarSesion() {
        db.cerrarSesion();
        setUsuario(null);
    }

    function refrescarSesion() {
        setUsuario(validarSesion(usuario));
    }

    const valor = {
        usuario,
        esAdmin: esRolAdmin(usuario),
        esVendedor: esRolVendedor(usuario),
        iniciarSesion,
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
