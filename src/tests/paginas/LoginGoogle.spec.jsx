// PRUEBAS DEL INICIO DE SESIÓN / REGISTRO CON GOOGLE.
// Se simula la librería de Google (window.google.accounts.id) y el backend (servidor falso).
import { act } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../../pages/Login";
import Registro from "../../pages/Registro";
import { montarConProveedores, simularLocalStorage } from "../utilidades";
import { esperarApi, simularServidor } from "../servidorFalso";

describe("Login y registro con Google", () => {
    let almacen;
    let servidor;
    let callbackGoogle;

    beforeEach(() => {
        almacen = simularLocalStorage();
        servidor = simularServidor();
        callbackGoogle = null;
        window.NUBEPLAY_GOOGLE_CLIENT_ID = "cliente-de-prueba.apps.googleusercontent.com";
        window.google = {
            accounts: {
                id: {
                    initialize: jasmine.createSpy("initialize").and.callFake(opciones => { callbackGoogle = opciones.callback; }),
                    renderButton: jasmine.createSpy("renderButton")
                }
            }
        };
    });

    afterEach(() => {
        delete window.NUBEPLAY_GOOGLE_CLIENT_ID;
        delete window.google;
    });

    function montar(ruta) {
        return montarConProveedores(
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/productos" element={<h1>Catálogo</h1>} />
                <Route path="/admin" element={<h1>Panel admin</h1>} />
            </Routes>,
            ruta
        );
    }

    async function elegirCuentaGoogle(credential) {
        await act(async () => callbackGoogle({ credential }));
        await esperarApi();
    }

    it("sin ID de cliente configurado no muestra el botón", () => {
        delete window.NUBEPLAY_GOOGLE_CLIENT_ID;
        const { contenedor } = montar("/login");
        expect(contenedor.querySelector("[data-testid='boton-google']")).toBeNull();
    });

    it("muestra el botón oficial de Google con nuestro ID de cliente", async () => {
        const { contenedor } = montar("/login");
        await esperarApi();

        expect(contenedor.querySelector("[data-testid='boton-google']")).not.toBeNull();
        expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(
            jasmine.objectContaining({ client_id: "cliente-de-prueba.apps.googleusercontent.com" })
        );
        expect(window.google.accounts.id.renderButton.calls.mostRecent().args[1].text).toBe("signin_with");
    });

    it("envía el token de Google a POST /auth/google, guarda los JWT y vincula la cuenta existente", async () => {
        jasmine.clock().install();
        try {
            const { contenedor } = montar("/login");
            await esperarApi();

            await elegirCuentaGoogle("google|g-ana|ana@gmail.com");

            const peticion = servidor.peticiones.find(p => p.ruta === "/auth/google");
            expect(peticion.cuerpo).toEqual({ credential: "google|g-ana|ana@gmail.com" });
            expect(JSON.parse(almacen.sesion_nubeplay).accessToken).toBeDefined();
            expect(servidor.usuarios.find(u => u.correo === "ana@gmail.com").googleId).toBe("g-ana");
            expect(contenedor.querySelector(".alert-success").textContent).toContain("Bienvenido/a Ana");

            act(() => jasmine.clock().tick(1200));
            expect(contenedor.querySelector("h1").textContent).toBe("Catálogo");
        } finally {
            jasmine.clock().uninstall();
        }
    });

    it("muestra el error del backend si el dominio del correo no está permitido", async () => {
        const { contenedor } = montar("/login");
        await esperarApi();

        await elegirCuentaGoogle("google|g-x|alguien@hotmail.com");

        expect(contenedor.querySelector(".alert-warning").textContent).toContain("Solo se aceptan cuentas");
        expect(almacen.sesion_nubeplay).toBeUndefined();
    });

    it("en el registro, Google crea una cuenta de Cliente nueva y entra a la tienda", async () => {
        const { contenedor } = montar("/registro");
        await esperarApi();
        expect(window.google.accounts.id.renderButton.calls.mostRecent().args[1].text).toBe("signup_with");

        await elegirCuentaGoogle("google|g-nuevo|nuevo.cliente@gmail.com");

        const creado = servidor.usuarios.find(u => u.correo === "nuevo.cliente@gmail.com");
        expect(creado.rol).toBe("Cliente");
        expect(contenedor.querySelector("h1").textContent).toBe("Catálogo");
    });
});
