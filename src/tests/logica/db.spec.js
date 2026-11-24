// PRUEBAS DEL MÓDULO DE DATOS (db.js): caché del catálogo que llega desde la API
// y datos propios del navegador (carrito, cupón y reseñas en localStorage simulado).
import * as db from "../../data/db";
import { categoriasIniciales, productosIniciales } from "../../data/semillas";
import { simularLocalStorage } from "../utilidades";

describe("data/db", () => {
    let almacen;

    beforeEach(() => {
        almacen = simularLocalStorage();
        db.establecerCatalogo({ productos: productosIniciales, categorias: categoriasIniciales });
    });

    describe("caché del catálogo", () => {
        it("guarda los productos y categorías recibidos del backend", () => {
            expect(db.obtenerProductos().length).toBe(productosIniciales.length);
            expect(db.obtenerCategorias().length).toBe(categoriasIniciales.length);
            expect(db.obtenerProductoPorId("1").nombre).toBe("PlayStation 5");
            expect(db.obtenerProductoPorId(9999)).toBeNull();
        });

        it("normaliza precio y stock como números", () => {
            db.establecerCatalogo({ productos: [{ id: 1, precio: "1000", stock: "3", stockCritico: null }] });
            expect(db.obtenerProductos()[0]).toEqual(jasmine.objectContaining({ precio: 1000, stock: 3, stockCritico: 0 }));
        });

        it("traduce el valor de una categoría a su nombre visible", () => {
            expect(db.obtenerNombreCategoria("consolas")).toBe("Consolas");
            expect(db.obtenerNombreCategoria("inventada")).toBe("inventada");
            expect(db.obtenerNombreCategoria(null)).toBe("Sin categoría");
        });

        it("cuenta los productos de cada categoría", () => {
            const consolas = productosIniciales.filter(p => p.categoria === "consolas").length;
            expect(db.contarProductosPorCategoria("consolas")).toBe(consolas);
        });

        it("no guarda el catálogo en localStorage (la fuente de verdad es el backend)", () => {
            expect(localStorage.setItem).not.toHaveBeenCalled();
        });
    });

    describe("reseñas", () => {
        it("crea y lista las reseñas de un producto", () => {
            db.crearResena({ productoId: 1, nombre: "Ana", comentario: "Buena" });
            db.crearResena({ productoId: 2, nombre: "Luis", comentario: "Mala" });
            expect(db.obtenerResenasPorProducto(1).map(r => r.nombre)).toEqual(["Ana"]);
        });

        it("tolera datos corruptos en localStorage", () => {
            spyOn(console, "warn");
            almacen[db.CLAVES.resenas] = "{no es json";
            expect(db.obtenerResenasPorProducto(1)).toEqual([]);
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe("carrito y cupón", () => {
        it("vaciarCarrito borra el carrito y el cupón", () => {
            db.guardarCarrito([{ id: 1, cantidad: 1 }]);
            db.guardarCuponAplicado(true);
            expect(db.obtenerCuponAplicado()).toBeTrue();

            db.vaciarCarrito();

            expect(db.obtenerCarrito()).toEqual([]);
            expect(db.obtenerCuponAplicado()).toBeFalse();
        });
    });
});
