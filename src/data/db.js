// Datos del frontend.
//
// Desde la Evaluación 3 los productos, categorías, usuarios y boletas viven en el
// backend (Spring Boot + MySQL) y se obtienen con la API REST (ver src/api).
// Este módulo solo guarda:
//   1. Una caché en memoria del catálogo (productos y categorías) que llena
//      CatalogoContext al iniciar la app con GET /productos y GET /categorias.
//      Así los componentes pueden leer el catálogo de forma síncrona.
//   2. Datos propios del navegador: carrito, cupón aplicado y reseñas.

export const CLAVES = {
    resenas: "resenasNubeplay",
    carrito: "carritoNubeplay",
    cupon: "cuponNubeplay"
};

function leer(clave, valorPorDefecto) {
    try {
        const valor = JSON.parse(localStorage.getItem(clave));
        return valor ?? valorPorDefecto;
    } catch (error) {
        console.warn(`No se pudo leer ${clave} desde localStorage.`, error);
        return valorPorDefecto;
    }
}

function leerLista(clave) {
    const lista = leer(clave, []);
    return Array.isArray(lista) ? lista : [];
}

function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function mismoId(a, b) {
    return String(a) === String(b);
}

// ----------------------------------------------------
// CACHÉ DEL CATÁLOGO (datos que vienen del backend)
// ----------------------------------------------------
const cache = { productos: [], categorias: [] };

function normalizarProducto(producto) {
    return {
        ...producto,
        precio: Number(producto.precio) || 0,
        stock: Number(producto.stock) || 0,
        stockCritico: Number(producto.stockCritico) || 0
    };
}

export function establecerCatalogo({ productos, categorias }) {
    if (Array.isArray(productos)) cache.productos = productos.map(normalizarProducto);
    if (Array.isArray(categorias)) cache.categorias = categorias;
}

export function obtenerCategorias() {
    return cache.categorias;
}

export function obtenerCategoriaPorValor(valor) {
    return cache.categorias.find(categoria => categoria.valor === valor) || null;
}

// Nombre visible de una categoría (si no existe, se muestra el valor guardado).
export function obtenerNombreCategoria(valor) {
    return obtenerCategoriaPorValor(valor)?.nombre || valor || "Sin categoría";
}

export function contarProductosPorCategoria(valor) {
    return cache.productos.filter(producto => producto.categoria === valor).length;
}

export function obtenerProductos() {
    return cache.productos;
}

export function obtenerProductoPorId(id) {
    return cache.productos.find(producto => mismoId(producto.id, id)) || null;
}

// ----------------------------------------------------
// RESEÑAS (locales del navegador)
// ----------------------------------------------------
export function obtenerResenasPorProducto(productoId) {
    return leerLista(CLAVES.resenas).filter(resena => mismoId(resena.productoId, productoId));
}

export function crearResena(datos) {
    const nueva = {
        ...datos,
        id: Date.now() + Math.floor(Math.random() * 1000),
        fecha: new Date().toLocaleDateString("es-CL")
    };
    guardar(CLAVES.resenas, [...leerLista(CLAVES.resenas), nueva]);
    return nueva;
}

// ----------------------------------------------------
// CARRITO Y CUPÓN (locales del navegador)
// ----------------------------------------------------
export function obtenerCarrito() {
    return leerLista(CLAVES.carrito);
}

export function guardarCarrito(carrito) {
    guardar(CLAVES.carrito, carrito);
}

export function vaciarCarrito() {
    localStorage.removeItem(CLAVES.carrito);
    localStorage.removeItem(CLAVES.cupon);
}

export function obtenerCuponAplicado() {
    return leer(CLAVES.cupon, false) === true;
}

export function guardarCuponAplicado(aplicado) {
    guardar(CLAVES.cupon, Boolean(aplicado));
}
