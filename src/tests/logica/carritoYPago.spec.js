// PRUEBAS DE LÓGICA: funciones puras del carrito, del pago y de los reportes.
import {
    agregarItem, calcularDescuento, calcularSubtotal, contarUnidades,
    esCuponValido, filtrarProductos, normalizarCarrito
} from "../../utils/carrito";
import { calcularIva, codigoOrden, crearNumeroOrden, datosDesdeUsuario, procesarPago, validarCheckout } from "../../utils/pago";
import { porcentajeDelMaximo, productosMasVendidos, resumenVentas, ventasPorCategoria } from "../../utils/reportes";
import { crearSlug, formatearPrecio } from "../../utils/formato";

const PS5 = { id: 1, nombre: "PS5", precio: 500000, stock: 3, categoria: "consolas" };
const ZELDA = { id: 2, nombre: "Zelda", precio: 50000, stock: 10, categoria: "juegos" };

describe("utils/carrito", () => {
    it("agregarItem agrega un producto nuevo y suma cantidad si ya existe", () => {
        let { carrito } = agregarItem([], PS5, 1);
        ({ carrito } = agregarItem(carrito, PS5, 2));

        expect(carrito.length).toBe(1);
        expect(carrito[0].cantidad).toBe(3);
    });

    it("agregarItem no permite superar el stock ni agregar productos agotados", () => {
        const { carrito } = agregarItem([], PS5, 3);

        expect(agregarItem(carrito, PS5, 1).error).toBe("No hay stock suficiente para agregar otra unidad.");
        expect(agregarItem([], { ...PS5, stock: 0 }).error).toBe("El producto está agotado.");
        expect(agregarItem([], PS5, 5).error).toBe("Solo hay 3 unidad(es) disponibles para agregar.");
    });

    it("calcula unidades, subtotal y el 10% de descuento", () => {
        const items = [{ ...PS5, cantidad: 2 }, { ...ZELDA, cantidad: 1 }];

        expect(contarUnidades(items)).toBe(3);
        expect(calcularSubtotal(items)).toBe(1050000);
        expect(calcularDescuento(1050000, true)).toBe(105000);
        expect(calcularDescuento(1050000, false)).toBe(0);
    });

    it("esCuponValido ignora mayúsculas y espacios", () => {
        expect(esCuponValido(" nubeplay123 ")).toBeTrue();
        expect(esCuponValido("OTRO")).toBeFalse();
        expect(esCuponValido(null)).toBeFalse();
    });

    it("normalizarCarrito ajusta al stock actual y quita productos eliminados", () => {
        const carrito = [{ id: 1, cantidad: 9 }, { id: 99, cantidad: 1 }];
        const resultado = normalizarCarrito(carrito, [{ ...PS5, precio: 400000 }]);

        expect(resultado.length).toBe(1);
        expect(resultado[0].cantidad).toBe(3);
        expect(resultado[0].precio).toBe(400000);
    });

    it("filtrarProductos busca por nombre y categoría", () => {
        const productos = [PS5, ZELDA];
        expect(filtrarProductos(productos, "zel", "todas")).toEqual([ZELDA]);
        expect(filtrarProductos(productos, "", "consolas")).toEqual([PS5]);
        expect(filtrarProductos(productos, "zelda", "consolas")).toEqual([]);
    });
});

describe("utils/pago", () => {
    it("procesarPago aprueba si hay stock y rechaza en los demás casos", () => {
        expect(procesarPago([{ ...PS5, cantidad: 1 }], [PS5]).aprobado).toBeTrue();
        expect(procesarPago([], [PS5]).motivo).toBe("El carrito está vacío.");
        expect(procesarPago([{ ...PS5, cantidad: 4 }], [PS5]).motivo).toContain("No hay stock suficiente");
        expect(procesarPago([{ ...PS5, cantidad: 1 }], [PS5], { simularRechazo: true }).aprobado).toBeFalse();
    });

    it("validarCheckout exige los campos obligatorios", () => {
        const errores = validarCheckout(datosDesdeUsuario(null));
        expect(Object.keys(errores).sort()).toEqual(["apellidos", "calle", "comuna", "correo", "nombre", "region"]);
    });

    it("datosDesdeUsuario autocompleta con los datos de la cuenta", () => {
        const datos = datosDesdeUsuario({ nombre: "Ana", correo: "ana@gmail.com", direccion: "Calle 1", region: "R", comuna: "C" });
        expect(datos).toEqual(jasmine.objectContaining({ nombre: "Ana", calle: "Calle 1", region: "R", comuna: "C" }));
    });

    it("genera número y código de orden, y separa el IVA (19%)", () => {
        expect(crearNumeroOrden(1234567, "2026-10-13")).toBe("202610134567");
        expect(codigoOrden(1234567)).toBe("ORDER34567");
        expect(calcularIva(11900)).toEqual({ neto: 10000, iva: 1900 });
    });
});

describe("utils/reportes y formato", () => {
    const ordenes = [
        { total: 550000, descuento: 0, items: [{ ...PS5, cantidad: 1 }, { ...ZELDA, cantidad: 1 }] },
        { total: 100000, descuento: 10000, items: [{ ...ZELDA, cantidad: 2 }] }
    ];

    it("resumenVentas suma totales, unidades y descuentos", () => {
        expect(resumenVentas(ordenes)).toEqual({
            totalVendido: 650000, cantidadOrdenes: 2, ticketPromedio: 325000, unidades: 4, descuentos: 10000
        });
        expect(resumenVentas([]).ticketPromedio).toBe(0);
    });

    it("ordena productos y categorías por monto vendido", () => {
        expect(productosMasVendidos(ordenes).map(p => p.nombre)).toEqual(["PS5", "Zelda"]);
        expect(ventasPorCategoria(ordenes, v => v.toUpperCase())[1]).toEqual(
            jasmine.objectContaining({ nombre: "JUEGOS", unidades: 3, monto: 150000 })
        );
        expect(porcentajeDelMaximo(50, [{ monto: 100 }, { monto: 50 }])).toBe(50);
    });

    it("formatea precios en CLP y crea slugs sin tildes", () => {
        expect(formatearPrecio(1099980)).toBe("$1.099.980");
        expect(crearSlug("Tarjetas Gráficas!")).toBe("tarjetas-graficas");
    });
});
