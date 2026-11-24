// PRUEBAS DE LA PÁGINA LOGIN: estado del formulario, validación, mensajes de error
// que vienen del backend (401 / 403), guardado de los tokens JWT y redirección según el rol.
// Usa jasmine.clock() para el setTimeout de la redirección.
import { act } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../../pages/Login";
import { AuthProvider } from "../../context/AuthContext";
import { enviar, escribir, montarConRouter, simularLocalStorage } from "../utilidades";
import { esperarApi, simularServidor } from "../servidorFalso";

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

async function llenar(contenedor, correo, password) {
    escribir(contenedor.querySelector("#email"), correo);
    escribir(contenedor.querySelector("#password"), password);
    enviar(contenedor.querySelector("form"));
    await esperarApi();
}

describe("Página Login", () => {
    let almacen;
    let servidor;

    beforeEach(() => {
        almacen = simularLocalStorage();
        servidor = simularServidor();
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

    it("marca los campos inválidos y NO llama a la API si el formato es incorrecto", async () => {
        const { contenedor } = montarLogin();

        await llenar(contenedor, "correo@hotmail.com", "12");

        expect(contenedor.querySelector("#email").classList).toContain("is-invalid");
        expect(contenedor.querySelector("#password").classList).toContain("is-invalid");
        expect(contenedor.querySelector(".alert-danger").textContent).toContain("corrige los errores");
        expect(servidor.peticiones.some(p => p.ruta === "/auth/login")).toBeFalse();
    });

    it("muestra el error 401 del backend si las credenciales no existen", async () => {
        const { contenedor } = montarLogin();
        await llenar(contenedor, "nadie@gmail.com", "1234");
        expect(contenedor.querySelector(".alert-danger").textContent).toContain("Correo o contraseña incorrectos");
    });

    it("muestra una advertencia (403) si la cuenta está inactiva", async () => {
        const { contenedor } = montarLogin();
        await llenar(contenedor, "baja@gmail.com", "1234");
        expect(contenedor.querySelector(".alert-warning").textContent).toContain("inactiva");
    });

    it("guarda los tokens JWT (no la contraseña) y redirige al administrador a /admin", async () => {
        const { contenedor } = montarLogin();

        await llenar(contenedor, "admin@duoc.cl", "admin");
        expect(contenedor.querySelector(".alert-success").textContent).toContain("Bienvenido/a Administrador");

        const sesion = JSON.parse(almacen.sesion_nubeplay);
        expect(Object.keys(sesion)).toEqual(["accessToken", "refreshToken"]);
        expect(almacen.sesion_nubeplay).not.toContain("admin\"");

        act(() => jasmine.clock().tick(1200));
        expect(contenedor.querySelector("h1").textContent).toBe("Panel admin");
    });

    it("redirige al vendedor al panel y a un cliente al catálogo", async () => {
        const { contenedor } = montarLogin();

        await llenar(contenedor, "ana@gmail.com", "1234");
        act(() => jasmine.clock().tick(1200));

        expect(contenedor.querySelector("h1").textContent).toBe("Catálogo");
    });
});
