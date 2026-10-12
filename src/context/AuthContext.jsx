import { createContext, useContext, useState } from "react";
import * as db from "../data/db";
import { esRolAdmin, esRolVendedor } from "../utils/formato";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => db.obtenerSesion());

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
        if (!usuario) return;
        const actualizado = db.obtenerUsuarioPorId(usuario.id) || usuario;
        db.guardarSesion(actualizado);
        setUsuario(actualizado);
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
