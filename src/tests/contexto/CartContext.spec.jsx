// PRUEBAS DE ESTADO GLOBAL: CartContext guarda el carrito, lo persiste en localStorage
// (mock) y la Navbar refleja el contador en tiempo real.
import { CartProvider, useCart } from "../../context/CartContext";
import { AuthProvider } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import { CLAVES } from "../../data/db";
import { productosIniciales } from "../../data/semillas";
import { botonPorTexto, click, montarConRouter, simularLocalStorage } from "../utilidades";

const PS5 = productosIniciales[0];   // stock 10
const XBOX = productosIniciales[1];  // stock 8

// Componente auxiliar que expone las acciones del carrito como botones.
function PanelCarrito() {
    const { items, totalUnidades, agregar, cambiarCantidad, eliminar, vaciar } = useCart();
    return (
        <div>
            <span id="unidades">{totalUnidades}</span>
            <span id="lineas">{items.length}</span>
            <button onClick={() => agregar(PS5)}>agregar-ps5</button>
            <button onClick={() => agregar(XBOX, 2)}>agregar-xbox</button>
            <button onClick={() => cambiarCantidad(PS5.id, 99)}>superar-stock</button>
            <button onClick={() => eliminar(PS5.id)}>eliminar-ps5</button>
            <button onClick={vaciar}>vaciar</button>
        </div>
    );
}

function montarCarrito() {
    return montarConRouter(
        <AuthProvider>
            <CartProvider>
                <Navbar />
                <PanelCarrito />
            </CartProvider>
        </AuthProvider>
    );
}

describe("CartContext + Navbar", () => {
    let almacen;

    beforeEach(() => {
        almacen = simularLocalStorage({ productos: JSON.stringify(productosIniciales) });
    });

    it("comienza vacío y el contador de la Navbar muestra 0", () => {
        const { contenedor } = montarCarrito();
        expect(contenedor.querySelector("[data-testid='contador-carrito']").textContent).toBe("0");
    });

    it("al agregar productos actualiza el estado y el contador de la Navbar", () => {
        const { contenedor } = montarCarrito();

        click(botonPorTexto(contenedor, "agregar-ps5"));
        click(botonPorTexto(contenedor, "agregar-ps5"));
        click(botonPorTexto(contenedor, "agregar-xbox"));

        expect(contenedor.querySelector("#unidades").textContent).toBe("4");
        expect(contenedor.querySelector("#lineas").textContent).toBe("2");
        expect(contenedor.querySelector("[data-testid='contador-carrito']").textContent).toBe("4");
    });

    it("persiste el carrito en localStorage", () => {
        const { contenedor } = montarCarrito();

        click(botonPorTexto(contenedor, "agregar-ps5"));

        expect(localStorage.setItem).toHaveBeenCalledWith(CLAVES.carrito, jasmine.any(String));
        const guardado = JSON.parse(almacen[CLAVES.carrito]);
        expect(guardado[0]).toEqual(jasmine.objectContaining({ id: PS5.id, cantidad: 1 }));
    });

    it("no permite superar el stock al cambiar la cantidad", () => {
        const { contenedor } = montarCarrito();
        click(botonPorTexto(contenedor, "agregar-ps5"));

        click(botonPorTexto(contenedor, "superar-stock"));

        expect(contenedor.querySelector("#unidades").textContent).toBe("1");
    });

    it("elimina un producto y vacía el carrito", () => {
        const { contenedor } = montarCarrito();
        click(botonPorTexto(contenedor, "agregar-ps5"));
        click(botonPorTexto(contenedor, "agregar-xbox"));

        click(botonPorTexto(contenedor, "eliminar-ps5"));
        expect(contenedor.querySelector("#unidades").textContent).toBe("2");

        click(botonPorTexto(contenedor, "vaciar"));
        expect(contenedor.querySelector("#unidades").textContent).toBe("0");
        expect(almacen[CLAVES.carrito]).toBeUndefined();
    });

    it("carga el carrito guardado previamente en localStorage", () => {
        almacen[CLAVES.carrito] = JSON.stringify([{ id: PS5.id, cantidad: 3 }]);
        const { contenedor } = montarCarrito();
        expect(contenedor.querySelector("#unidades").textContent).toBe("3");
    });
});
