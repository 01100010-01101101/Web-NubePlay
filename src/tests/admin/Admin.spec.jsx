// PRUEBAS DE LA PÁGINA ADMIN: pestañas y tarjetas según el rol (datos desde la API simulada).
import { Route, Routes } from "react-router-dom";
import Admin from "../../pages/Admin";
import { productosIniciales } from "../../data/semillas";
import { botonPorTexto, click, montarConProveedores, simularLocalStorage } from "../utilidades";
import { esperarApi, sesionGuardada, simularServidor, USUARIOS_PRUEBA } from "../servidorFalso";

const ADMIN = USUARIOS_PRUEBA.admin;
const VENDEDOR = USUARIOS_PRUEBA.vendedor;

async function montarAdmin(sesion, ruta = "/admin") {
    const almacen = simularLocalStorage();
    // Un producto en stock crítico para la tarjeta de estadísticas.
    simularServidor({
        usuarios: [ADMIN, VENDEDOR],
        productos: productosIniciales.map((p, i) => (i === 0 ? { ...p, stock: 2 } : p))
    });
    sesionGuardada(sesion);

    const montaje = montarConProveedores(
        <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<h1>Login</h1>} />
        </Routes>,
        ruta
    );
    await esperarApi(40);
    return { ...montaje, almacen };
}

const pestanas = contenedor => [...contenedor.querySelectorAll("[role='tab']")].map(t => t.textContent.trim());
const activa = contenedor => contenedor.querySelector("[role='tab'].active").textContent.trim();

describe("Página Admin", () => {
    it("el administrador ve las 4 estadísticas (leídas de la API) y las 6 pestañas", async () => {
        const { contenedor } = await montarAdmin(ADMIN);
        const valores = [...contenedor.querySelectorAll(".tarjeta-estadistica h2")].map(h => h.textContent);

        expect(valores).toEqual([String(productosIniciales.length), "1", "2", "0"]);
        expect(pestanas(contenedor)).toEqual(["Productos", "Categorías", "Usuarios", "Órdenes", "Reportes", "Mi Perfil"]);
        expect(activa(contenedor)).toBe("Productos");
    });

    it("el vendedor solo ve Productos y Órdenes, sin la tarjeta de usuarios ni acciones de edición", async () => {
        const { contenedor } = await montarAdmin(VENDEDOR);
        expect(pestanas(contenedor)).toEqual(["Productos", "Órdenes"]);
        expect(contenedor.textContent).not.toContain("Usuarios Registrados");
        expect(botonPorTexto(contenedor, "Ver Tienda")).toBeNull();
        expect(botonPorTexto(contenedor, "Agregar Producto")).toBeNull();
        expect(contenedor.querySelector("[aria-label^='Editar']")).toBeNull();
    });

    it("cambia de pestaña al hacer clic", async () => {
        const { contenedor } = await montarAdmin(ADMIN);
        click(botonPorTexto(contenedor, "Reportes"));
        await esperarApi();
        expect(activa(contenedor)).toBe("Reportes");
        expect(contenedor.textContent).toContain("Reportes de Ventas");
    });

    it("abre la pestaña indicada en la URL", async () => {
        const { contenedor } = await montarAdmin(ADMIN, "/admin?tab=categorias");
        expect(activa(contenedor)).toBe("Categorías");
    });

    it("un vendedor no puede abrir pestañas de admin por la URL", async () => {
        const { contenedor } = await montarAdmin(VENDEDOR, "/admin?tab=usuarios");
        expect(activa(contenedor)).toBe("Productos");
    });

    it("la tarjeta 'Stock Crítico' filtra el inventario", async () => {
        const { contenedor } = await montarAdmin(ADMIN);
        click(contenedor.querySelectorAll(".tarjeta-estadistica")[1]);

        expect(contenedor.textContent).toContain("Productos con stock crítico");
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);

        click(contenedor.querySelector("#soloCriticos"));
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(productosIniciales.length);
    });

    it("las estadísticas se actualizan cuando un panel cambia datos", async () => {
        spyOn(window, "confirm").and.returnValue(true);
        const { contenedor } = await montarAdmin(ADMIN);

        click(contenedor.querySelector("[aria-label='Eliminar Xbox Series X']"));
        await esperarApi(40);

        expect(contenedor.querySelector(".tarjeta-estadistica h2").textContent).toBe(String(productosIniciales.length - 1));
        expect(contenedor.querySelector(".alert-success").textContent).toContain("Producto eliminado.");
    });

    it("cerrar sesión borra los tokens y vuelve al login", async () => {
        const { contenedor, almacen } = await montarAdmin(ADMIN);
        click(botonPorTexto(contenedor, "Cerrar Sesión"));

        expect(almacen.sesion_nubeplay).toBeUndefined();
        expect(contenedor.querySelector("h1").textContent).toBe("Login");
    });
});
