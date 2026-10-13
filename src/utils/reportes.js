// Cálculos de los reportes del panel de administración (funciones puras).

export function resumenVentas(ordenes) {
    const totalVendido = ordenes.reduce((suma, orden) => suma + (Number(orden.total) || 0), 0);
    const unidades = ordenes.reduce(
        (suma, orden) => suma + (orden.items || []).reduce((s, item) => s + (Number(item.cantidad) || 0), 0),
        0
    );
    const descuentos = ordenes.reduce((suma, orden) => suma + (Number(orden.descuento) || 0), 0);

    return {
        totalVendido,
        cantidadOrdenes: ordenes.length,
        ticketPromedio: ordenes.length ? Math.round(totalVendido / ordenes.length) : 0,
        unidades,
        descuentos
    };
}

// Agrupa los ítems vendidos por una clave y suma unidades y monto. Ordena de mayor a menor monto.
function agrupar(ordenes, obtenerClave, obtenerNombre) {
    const grupos = new Map();

    ordenes.forEach(orden => (orden.items || []).forEach(item => {
        const clave = obtenerClave(item);
        const actual = grupos.get(clave) || { clave, nombre: obtenerNombre(item), unidades: 0, monto: 0 };
        actual.unidades += Number(item.cantidad) || 0;
        actual.monto += (Number(item.precio) || 0) * (Number(item.cantidad) || 0);
        grupos.set(clave, actual);
    }));

    return [...grupos.values()].sort((a, b) => b.monto - a.monto);
}

export function productosMasVendidos(ordenes, limite = 5) {
    return agrupar(ordenes, item => String(item.id), item => item.nombre).slice(0, limite);
}

// `nombreCategoria` traduce el valor guardado al nombre visible.
export function ventasPorCategoria(ordenes, nombreCategoria = valor => valor) {
    return agrupar(ordenes, item => item.categoria || "sin-categoria", item => nombreCategoria(item.categoria));
}

// Porcentaje de `valor` respecto del máximo de la lista (para el largo de las barras).
export function porcentajeDelMaximo(valor, lista, campo = "monto") {
    const maximo = Math.max(...lista.map(item => item[campo]), 0);
    return maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
}
