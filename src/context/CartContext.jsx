import { createContext, useContext, useState } from "react";
import * as db from "../data/db";
import { agregarItem, contarUnidades, normalizarCarrito } from "../utils/carrito";

const CartContext = createContext(null);

function cargarCarrito() {
    return normalizarCarrito(db.obtenerCarrito(), db.obtenerProductos());
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(cargarCarrito);

    function actualizar(nuevoCarrito) {
        db.guardarCarrito(nuevoCarrito);
        setItems(nuevoCarrito);
    }

    function agregar(producto, cantidad = 1) {
        const resultado = agregarItem(items, producto, cantidad);
        if (!resultado.error) actualizar(resultado.carrito);
        return resultado.error;
    }

    function cambiarCantidad(id, nuevaCantidad) {
        const item = items.find(i => String(i.id) === String(id));
        if (!item || nuevaCantidad < 1) return null;
        if (nuevaCantidad > item.stock) return "No puedes superar el stock disponible.";

        actualizar(items.map(i => (i === item ? { ...i, cantidad: nuevaCantidad } : i)));
        return null;
    }

    function eliminar(id) {
        actualizar(items.filter(item => String(item.id) !== String(id)));
    }

    function vaciar() {
        db.vaciarCarrito();
        setItems([]);
    }


    function sincronizar() {
        const normalizado = cargarCarrito();
        db.guardarCarrito(normalizado);
        setItems(normalizado);
        return normalizado;
    }

    const valor = {
        items,
        totalUnidades: contarUnidades(items),
        agregar,
        cambiarCantidad,
        eliminar,
        vaciar,
        sincronizar
    };

    return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart() {
    const contexto = useContext(CartContext);
    if (!contexto) throw new Error("useCart debe usarse dentro de <CartProvider>.");
    return contexto;
}