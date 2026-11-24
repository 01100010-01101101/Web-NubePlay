// PRUEBAS DE NAVEGACIÓN PROTEGIDA: acceso a rutas según el rol que entrega el backend (GET /auth/me).
import { Route, Routes } from "react-router-dom";
import RutaProtegida from "../../components/common/RutaProtegida";
import SinVendedor from "../../components/common/SinVendedor";
import { AuthProvider } from "../../context/AuthContext";
import { montarConRouter, simularLocalStorage } from "../utilidades";
import { esperarApi, sesionGuardada, simularServidor, USUARIOS_PRUEBA } from "../servidorFalso";

async function montarConSesion(sesion, ruta = "/admin") {
    const almacen = simularLocalStorage();
    simularServidor();
    if (sesion) sesionGuardada(sesion);

    const montaje = montarConRouter(
        <AuthProvider>
            <Routes>
                <Route path="/admin" element={<RutaProtegida roles={["admin", "vendedor"]}><h1>Panel admin</h1></RutaProtegida>} />
                <Route path="/carrito" element={<SinVendedor><h1>Carrito</h1></SinVendedor>} />
                <Route path="/login" element={<h1>Login</h1>} />
                <Route path="/" element={<h1>Tienda</h1>} />
            </Routes>
        </AuthProvider>,
        ruta
    );
    return { ...montaje, almacen, montajeInicial: montaje.contenedor.textContent };
}

describe("RutaProtegida", () => {
    it("redirige al login si no hay sesión", async () => {
        const { contenedor } = await montarConSesion(null);
        await esperarApi();
        expect(contenedor.textContent).toBe("Login");
    });

    it("mientras valida la sesión guardada muestra un indicador (no expulsa al usuario)", async () => {
        const { montajeInicial, contenedor } = await montarConSesion(USUARIOS_PRUEBA.admin);
        expect(montajeInicial).not.toBe("Login");
        await esperarApi();
        expect(contenedor.textContent).toBe("Panel admin");
    });

    it("permite el acceso al Vendedor", async () => {
        const { contenedor } = await montarConSesion(USUARIOS_PRUEBA.vendedor);
        await esperarApi();
        expect(contenedor.textContent).toBe("Panel admin");
    });

    it("envía a un Cliente de vuelta a la tienda", async () => {
        const { contenedor } = await montarConSesion(USUARIOS_PRUEBA.cliente);
        await esperarApi();
        expect(contenedor.textContent).toBe("Tienda");
    });

    it("cierra la sesión de un usuario desactivado (el backend rechaza su token)", async () => {
        const { contenedor, almacen } = await montarConSesion(USUARIOS_PRUEBA.inactivo);
        await esperarApi(40);
        expect(contenedor.textContent).toBe("Login");
        expect(almacen.sesion_nubeplay).toBeUndefined();
    });

    it("SinVendedor saca al Vendedor del carrito y lo lleva a sus órdenes", async () => {
        const { contenedor } = await montarConSesion(USUARIOS_PRUEBA.vendedor, "/carrito");
        await esperarApi();
        expect(contenedor.textContent).toBe("Panel admin");
    });

    it("SinVendedor deja pasar al Cliente al carrito", async () => {
        const { contenedor } = await montarConSesion(USUARIOS_PRUEBA.cliente, "/carrito");
        await esperarApi();
        expect(contenedor.textContent).toBe("Carrito");
    });
});
