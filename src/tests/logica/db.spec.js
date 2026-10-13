// PRUEBAS DEL ARCHIVO DE DATOS (db.js): operaciones CRUD sobre localStorage.
// localStorage se reemplaza por un MOCK en memoria (simularLocalStorage), así cada prueba
// parte de cero y se puede verificar exactamente qué se guardó.
import * as db from "../../data/db";
import { categoriasIniciales, productosIniciales, usuariosIniciales } from "../../data/semillas";
import { simularLocalStorage } from "../utilidades";

describe("data/db (CRUD con localStorage simulado)", () => {
    let almacen;

    beforeEach(() => {
        almacen = simularLocalStorage();
        db.inicializarDatos();
    });

    describe("inicializarDatos", () => {
        it("carga las semillas cuando localStorage está vacío", () => {
            expect(db.obtenerProductos().length).toBe(productosIniciales.length);
            expect(db.obtenerCategorias().length).toBe(categoriasIniciales.length);
            expect(db.obtenerUsuarios().length).toBe(usuariosIniciales.length);
        });

        it("no sobrescribe los datos existentes", () => {
            db.crearProducto({ nombre: "Extra" });
            db.inicializarDatos();
            expect(db.obtenerProductos().length).toBe(productosIniciales.length + 1);
        });

        it("tolera datos corruptos en localStorage", () => {
            spyOn(console, "warn"); // evita ensuciar la salida; además verifica que se avisó
            almacen[db.CLAVES.productos] = "{no es json";
            expect(db.obtenerProductos()).toEqual([]);
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe("productos", () => {
        it("crea, lee, actualiza y elimina", () => {
            const nuevo = db.crearProducto({ codigo: "TST", nombre: "Prueba", precio: 1000, stock: 5 });
            expect(db.obtenerProductoPorId(nuevo.id).nombre).toBe("Prueba");

            db.actualizarProducto(nuevo.id, { precio: 2000, id: 999 });
            const actualizado = db.obtenerProductoPorId(nuevo.id);
            expect(actualizado.precio).toBe(2000);
            expect(actualizado.id).toBe(nuevo.id); // el id no se puede cambiar

            db.eliminarProducto(nuevo.id);
            expect(db.obtenerProductoPorId(nuevo.id)).toBeNull();
        });

        it("descontarStock nunca deja stock negativo", () => {
            db.descontarStock([{ id: 1, cantidad: 3 }, { id: 2, cantidad: 999 }]);
            expect(db.obtenerProductoPorId(1).stock).toBe(productosIniciales[0].stock - 3);
            expect(db.obtenerProductoPorId(2).stock).toBe(0);
        });

        it("guarda los cambios en localStorage", () => {
            db.crearProducto({ nombre: "Persistido" });
            expect(localStorage.setItem).toHaveBeenCalledWith(db.CLAVES.productos, jasmine.any(String));
            expect(almacen[db.CLAVES.productos]).toContain("Persistido");
        });
    });

    describe("categorías", () => {
        it("genera un identificador único a partir del nombre", () => {
            expect(db.crearCategoria({ nombre: "Tarjetas Gráficas", icono: "x" }).valor).toBe("tarjetas-graficas");
            expect(db.crearCategoria({ nombre: "Tarjetas Gráficas", icono: "x" }).valor).toBe("tarjetas-graficas-2");
        });

        it("actualiza el nombre sin cambiar el identificador", () => {
            db.actualizarCategoria("consolas", { nombre: "Consolas Next-Gen", valor: "otro" });
            expect(db.obtenerNombreCategoria("consolas")).toBe("Consolas Next-Gen");
        });

        it("no elimina una categoría que tiene productos, pero sí una vacía", () => {
            expect(db.eliminarCategoria("consolas").ok).toBeFalse();

            const vacia = db.crearCategoria({ nombre: "Vacía", icono: "x" });
            expect(db.eliminarCategoria(vacia.valor)).toEqual({ ok: true, error: null });
            expect(db.obtenerCategoriaPorValor(vacia.valor)).toBeNull();
        });
    });

    describe("usuarios", () => {
        it("crea un usuario con rol Cliente por defecto y lo encuentra por credenciales", () => {
            const nuevo = db.crearUsuario({ nombre: "Ana", correo: "Ana@Gmail.com", password: "1234" });

            expect(nuevo.rol).toBe("Cliente");
            expect(db.buscarUsuarioPorCredenciales("ana@gmail.com", "1234").id).toBe(nuevo.id);
            expect(db.buscarUsuarioPorCredenciales("ana@gmail.com", "mala")).toBeNull();
        });

        it("actualiza y elimina usuarios", () => {
            const nuevo = db.crearUsuario({ nombre: "Ana", correo: "ana@gmail.com" });
            db.actualizarUsuario(nuevo.id, { estado: "Inactivo" });
            expect(db.obtenerUsuarioPorId(nuevo.id).estado).toBe("Inactivo");

            db.eliminarUsuario(nuevo.id);
            expect(db.obtenerUsuarioPorId(nuevo.id)).toBeNull();
        });
    });

    describe("registrarCompra", () => {
        it("crea la orden, descuenta stock y agrega la compra al historial del usuario", () => {
            const cliente = db.crearUsuario({ nombre: "Ana", correo: "ana@gmail.com" });
            const ps5 = db.obtenerProductoPorId(1);

            const orden = db.registrarCompra({
                usuarioId: cliente.id,
                comprador: { nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com" },
                envio: { calle: "Calle 1" },
                items: [{ ...ps5, cantidad: 2 }],
                subtotal: ps5.precio * 2,
                total: ps5.precio * 2
            });

            expect(db.obtenerOrdenPorId(orden.id)).toEqual(jasmine.objectContaining({ cliente: "Ana Pérez", estado: "Pagada" }));
            expect(db.obtenerProductoPorId(1).stock).toBe(ps5.stock - 2);
            expect(db.obtenerUsuarioPorId(cliente.id).compras).toEqual([
                jasmine.objectContaining({ producto: ps5.nombre, cantidad: 2, total: ps5.precio * 2 })
            ]);
        });
    });

    describe("carrito y sesión", () => {
        it("vaciarCarrito borra el carrito y el cupón", () => {
            db.guardarCarrito([{ id: 1, cantidad: 1 }]);
            db.guardarCuponAplicado(true);
            expect(db.obtenerCuponAplicado()).toBeTrue();

            db.vaciarCarrito();

            expect(db.obtenerCarrito()).toEqual([]);
            expect(db.obtenerCuponAplicado()).toBeFalse();
        });

        it("guarda y cierra la sesión", () => {
            db.guardarSesion({ id: 1 });
            expect(db.obtenerSesion()).toEqual({ id: 1 });
            db.cerrarSesion();
            expect(db.obtenerSesion()).toBeNull();
        });
    });
});
