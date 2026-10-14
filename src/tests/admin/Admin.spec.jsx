import { Route, Routes } from "react-router-dom";
import Admin from "../../pages/Admin";
import { CLAVES, inicializarDatos } from "../../data/db";
import { productosIniciales, usuariosIniciales } from "../../data/semillas";
import { botonPorTexto, click, montarConProveedores, simularLocalStorage } from "../utilidades";


const ADMIN = usuariosIniciales[0];
const VENDEDOR = { id: 50, nombre: "Vera", correo: "vera@duoc.cl", rol: "Vendedor", estado: "Activo" };


function montarAdmin(sesion, ruta = "/admin") {
    const almacen = simularLocalStorage();
    inicializarDatos();
    almacen[CLAVES.usuarios] = JSON.stringify([ADMIN, VENDEDOR]);
    almacen[CLAVES.sesion] = JSON.stringify(sesion);
    // Un producto en stock crítico para la tarjeta de estadísticas.
    almacen[CLAVES.productos] = JSON.stringify(productosIniciales.map((p, i) => (i === 0 ? { ...p, stock: 2 } : p)));


    const montaje = montarConProveedores(
        <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<h1>Login</h1>} />
        </Routes>,
        ruta
    );
    return { ...montaje, almacen };
}


const pestanas = contenedor => [...contenedor.querySelectorAll("[role='tab']")].map(t => t.textContent.trim());
const activa = contenedor => contenedor.querySelector("[role='tab'].active").textContent.trim();


describe("Página Admin", () => {
    it("el administrador ve las 4 estadísticas y las 6 pestañas", () => {
        const { contenedor } = montarAdmin(ADMIN);
        const valores = [...contenedor.querySelectorAll(".tarjeta-estadistica h2")].map(h => h.textContent);


        expect(valores).toEqual([String(productosIniciales.length), "1", "2", "0"]);
        expect(pestanas(contenedor)).toEqual(["Productos", "Categorías", "Usuarios", "Órdenes", "Reportes", "Mi Perfil"]);
        expect(activa(contenedor)).toBe("Productos");
    });


    it("el vendedor solo ve Productos, Órdenes y Mi Perfil, sin la tarjeta de usuarios", () => {
        const { contenedor } = montarAdmin(VENDEDOR);
        expect(pestanas(contenedor)).toEqual(["Productos", "Órdenes", "Mi Perfil"]);
        expect(contenedor.textContent).not.toContain("Usuarios Registrados");
        expect(botonPorTexto(contenedor, "Ver Tienda")).toBeNull();
    });


    it("cambia de pestaña al hacer clic", () => {
        const { contenedor } = montarAdmin(ADMIN);
        click(botonPorTexto(contenedor, "Reportes"));
        expect(activa(contenedor)).toBe("Reportes");
        expect(contenedor.textContent).toContain("Reportes de Ventas");
    });


    it("abre la pestaña indicada en la URL", () => {
        const { contenedor } = montarAdmin(ADMIN, "/admin?tab=categorias");
        expect(activa(contenedor)).toBe("Categorías");
    });


    it("un vendedor no puede abrir pestañas de admin por la URL", () => {
        const { contenedor } = montarAdmin(VENDEDOR, "/admin?tab=usuarios");
        expect(activa(contenedor)).toBe("Productos");
    });


    it("la tarjeta 'Stock Crítico' filtra el inventario", () => {
        const { contenedor } = montarAdmin(ADMIN);
        click(contenedor.querySelectorAll(".tarjeta-estadistica")[1]);


        expect(contenedor.textContent).toContain("Productos con stock crítico");
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);


        click(contenedor.querySelector("#soloCriticos"));
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(productosIniciales.length);
    });


    it("las estadísticas se actualizan cuando un panel cambia datos", () => {
        spyOn(window, "confirm").and.returnValue(true);
        const { contenedor } = montarAdmin(ADMIN);


        click(contenedor.querySelector("[aria-label='Eliminar Xbox Series X']"));


        expect(contenedor.querySelector(".tarjeta-estadistica h2").textContent).toBe(String(productosIniciales.length - 1));
        expect(contenedor.querySelector(".alert-success").textContent).toContain("Producto eliminado.");
    });


    it("cerrar sesión borra la sesión y vuelve al login", () => {
        const { contenedor, almacen } = montarAdmin(ADMIN);
        click(botonPorTexto(contenedor, "Cerrar Sesión"));


        expect(almacen[CLAVES.sesion]).toBeUndefined();
        expect(contenedor.querySelector("h1").textContent).toBe("Login");
    });
});

