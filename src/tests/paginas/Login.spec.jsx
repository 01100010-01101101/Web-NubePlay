// PRUEBAS DE LA PÁGINA LOGIN: estado del formulario, validación, mensajes de error
// condicionales y redirección según el rol (usa jasmine.clock() para el setTimeout).
import { act } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../../pages/Login";
import { AuthProvider } from "../../context/AuthContext";
import { CLAVES } from "../../data/db";
import { usuariosIniciales } from "../../data/semillas";
import { enviar, escribir, montarConRouter, simularLocalStorage } from "../utilidades";

const CLIENTE = {
    id: 200, nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", password: "1234",
    rol: "Cliente", estado: "Activo"
};

function montarLogin() {
    return montarConRouter(
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<h1>Panel admin</h1>} />
                <Route path="/productos" element={<h1>Catálogo</h1>} />
            </Routes>
        </AuthProvider>,
        "/login"
    );
}

function llenar(contenedor, correo, password) {
    escribir(contenedor.querySelector("#email"), correo);
    escribir(contenedor.querySelector("#password"), password);
    enviar(contenedor.querySelector("form"));
}

describe("Página Login", () => {
    let almacen;

    beforeEach(() => {
        almacen = simularLocalStorage({
            [CLAVES.usuarios]: JSON.stringify([...usuariosIniciales, CLIENTE, { ...CLIENTE, id: 201, correo: "baja@gmail.com", estado: "Inactivo" }])
        });
        jasmine.clock().install();
    });

    afterEach(() => jasmine.clock().uninstall());

    it("el estado de los campos cambia al escribir", () => {
        const { contenedor } = montarLogin();

        escribir(contenedor.querySelector("#email"), "admin@duoc.cl");

        expect(contenedor.querySelector("#email").value).toBe("admin@duoc.cl");
    });

    it("no muestra errores antes de enviar el formulario", () => {
        const { contenedor } = montarLogin();
        expect(contenedor.querySelector(".is-invalid")).toBeNull();
        expect(contenedor.querySelector(".alert")).toBeNull();
    });

    it("marca los campos inválidos al enviar datos con formato incorrecto", () => {
        const { contenedor } = montarLogin();

        llenar(contenedor, "correo@hotmail.com", "12");

        expect(contenedor.querySelector("#email").classList).toContain("is-invalid");
        expect(contenedor.querySelector("#password").classList).toContain("is-invalid");
        expect(contenedor.querySelector(".alert-danger").textContent).toContain("corrige los errores");
    });

    it("muestra un error si las credenciales no existen", () => {
        const { contenedor } = montarLogin();

        llenar(contenedor, "nadie@gmail.com", "1234");

        expect(contenedor.querySelector(".alert-danger").textContent).toContain("Correo o contraseña incorrectos");
    });

    it("muestra una advertencia si la cuenta está inactiva", () => {
        const { contenedor } = montarLogin();

        llenar(contenedor, "baja@gmail.com", "1234");

        expect(contenedor.querySelector(".alert-warning").textContent).toContain("inactiva");
    });

    it("guarda la sesión y redirige al administrador a /admin", () => {
        const { contenedor } = montarLogin();

        llenar(contenedor, "admin@duoc.cl", "admin");
        expect(contenedor.querySelector(".alert-success").textContent).toContain("Bienvenido/a Administrador");
        expect(JSON.parse(almacen[CLAVES.sesion]).correo).toBe("admin@duoc.cl");

        act(() => jasmine.clock().tick(1200));
        // Avanza el reloj simulado: se ejecuta el setTimeout que navega.
        expect(contenedor.querySelector("h1").textContent).toBe("Panel admin");
    });

    it("redirige a un cliente al catálogo", () => {
        const { contenedor } = montarLogin();

        llenar(contenedor, "ana@gmail.com", "1234");
        act(() => jasmine.clock().tick(1200));

        expect(contenedor.querySelector("h1").textContent).toBe("Catálogo");
    });
});
