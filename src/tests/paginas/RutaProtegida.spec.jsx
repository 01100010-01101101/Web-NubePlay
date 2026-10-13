// PRUEBAS DE NAVEGACIÓN PROTEGIDA: solo Administrador o Vendedor pueden entrar al panel.
import { Route, Routes } from "react-router-dom";
import RutaProtegida from "../../components/common/RutaProtegida";
import { AuthProvider } from "../../context/AuthContext";
import { CLAVES } from "../../data/db";
import { montarConRouter, simularLocalStorage } from "../utilidades";

const USUARIOS = [
    { id: 1, nombre: "Admin", correo: "admin@duoc.cl", rol: "Administrador", estado: "Activo" },
    { id: 2, nombre: "Vende", correo: "vende@duoc.cl", rol: "Vendedor", estado: "Activo" },
    { id: 3, nombre: "Cliente", correo: "cli@gmail.com", rol: "Cliente", estado: "Activo" },
    { id: 4, nombre: "Baja", correo: "baja@duoc.cl", rol: "Administrador", estado: "Inactivo" }
];

function montarConSesion(sesion) {
    const datos = { [CLAVES.usuarios]: JSON.stringify(USUARIOS) };
    if (sesion) datos[CLAVES.sesion] = JSON.stringify(sesion);
    simularLocalStorage(datos);

    return montarConRouter(
        <AuthProvider>
            <Routes>
                <Route path="/admin" element={<RutaProtegida><h1>Panel admin</h1></RutaProtegida>} />
                <Route path="/login" element={<h1>Login</h1>} />
            </Routes>
        </AuthProvider>,
        "/admin"
    );
}

describe("RutaProtegida", () => {
    it("redirige al login si no hay sesión", () => {
        expect(montarConSesion(null).contenedor.textContent).toBe("Login");
    });

    it("permite el acceso al Administrador", () => {
        expect(montarConSesion(USUARIOS[0]).contenedor.textContent).toBe("Panel admin");
    });

    it("permite el acceso al Vendedor", () => {
        expect(montarConSesion(USUARIOS[1]).contenedor.textContent).toBe("Panel admin");
    });

    it("bloquea a un Cliente", () => {
        expect(montarConSesion(USUARIOS[2]).contenedor.textContent).toBe("Login");
    });

    it("bloquea y cierra la sesión de un administrador desactivado", () => {
        expect(montarConSesion(USUARIOS[3]).contenedor.textContent).toBe("Login");
        expect(localStorage.removeItem).toHaveBeenCalledWith(CLAVES.sesion);
    });
});
