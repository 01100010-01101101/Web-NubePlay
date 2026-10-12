export const CUPON_VALIDO = "NUBEPLAY123";
export const PORCENTAJE_DESCUENTO = 0.10;

export function contarUnidades(items) {
    return items.reduce((total, item) => total + (Number(item.cantidad) || 0), 0);
}

export function calcularSubtotal(items) {
    return items.reduce(
        (total, item) => total + (Number(item.precio) || 0) * (Number(item.cantidad) || 0),
        0
    );
}

export function calcularDescuento(subtotal, descuentoAplicado) {
    return descuentoAplicado ? subtotal * PORCENTAJE_DESCUENTO : 0;
}

export function esCuponValido(codigo) {
    return String(codigo || "").trim().toUpperCase() === CUPON_VALIDO;
}

export function agregarItem(carrito, producto, cantidad = 1) {
    const stock = Number(producto.stock) || 0;

    if (stock <= 0) {
        return { carrito, error: "El producto está agotado." };
    }

    const existente = carrito.find(item => String(item.id) === String(producto.id));
    const cantidadActual = existente ? Number(existente.cantidad) || 0 : 0;

    if (cantidadActual + cantidad > stock) {
        const disponibles = stock - cantidadActual;
        return {
            carrito,
            error: disponibles > 0
                ? `Solo hay ${disponibles} unidad(es) disponibles para agregar.`
                : "No hay stock suficiente para agregar otra unidad."
        };
    }

    if (existente) {
        return {
            carrito: carrito.map(item =>
                item === existente ? { ...item, stock, cantidad: cantidadActual + cantidad } : item
            ),
            error: null
        };
    }

    return {
        carrito: [
            ...carrito,
            {
                id: producto.id,
                nombre: producto.nombre,
                precio: Number(producto.precio) || 0,
                categoria: producto.categoria,
                imagen: producto.imagen,
                stock,
                cantidad
            }
        ],
        error: null
    };
}

export function normalizarCarrito(carrito, productos) {
    return carrito.reduce((resultado, item) => {
        const producto = productos.find(p => String(p.id) === String(item.id));
        if (!producto) return resultado;

        const stock = Number(producto.stock) || 0;
        const cantidad = Math.min(Math.max(Number(item.cantidad) || 0, 0), stock);
        if (cantidad <= 0) return resultado;

        resultado.push({
            ...item,
            nombre: producto.nombre,
            precio: Number(producto.precio) || 0,
            categoria: producto.categoria,
            imagen: producto.imagen,
            stock,
            cantidad
        });
        return resultado;
    }, []);
}

export function filtrarProductos(productos, busqueda, categoria) {
    const texto = String(busqueda || "").trim().toLowerCase();

    return productos.filter(producto => {
        const coincideNombre = String(producto.nombre || "").toLowerCase().includes(texto);
        const coincideCategoria = !categoria || categoria === "todas" ||
            String(producto.categoria || "").toLowerCase() === categoria.toLowerCase();
        return coincideNombre && coincideCategoria;
    });
}