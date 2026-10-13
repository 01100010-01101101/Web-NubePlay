import { categoriasIniciales, productosIniciales, usuariosIniciales } from "./semillas";
import { crearSlug, fechaLocalISO } from "../utils/formato";


export const CLAVES = {
    productos: "productos",
    categorias: "categorias",
    usuarios: "usuarios",
    ordenes: "ventas",
    resenas: "resenasNubeplay",
    carrito: "carritoNubeplay",
    cupon: "cuponNubeplay",
    sesion: "usuario_nubeplay"
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


function generarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}


function mismoId(a, b) {
    return String(a) === String(b);
}


export function inicializarDatos() {
    if (leerLista(CLAVES.categorias).length === 0) {
        guardar(CLAVES.categorias, categoriasIniciales);
    }

    if (leerLista(CLAVES.productos).length === 0) {
        guardar(CLAVES.productos, productosIniciales);
    }


    const usuarios = leerLista(CLAVES.usuarios);
    const faltantes = usuariosIniciales.filter(semilla =>
        !usuarios.some(u => u.correo?.toLowerCase() === semilla.correo.toLowerCase())
    );


    if (faltantes.length > 0) {
        guardar(CLAVES.usuarios, [...usuarios, ...faltantes]);
    }
}


// ----------------------------------------------------
// CATEGORÍAS
// ----------------------------------------------------
export function obtenerCategorias() {
    return leerLista(CLAVES.categorias);
}

export function obtenerCategoriaPorValor(valor) {
    return obtenerCategorias().find(categoria => categoria.valor === valor) || null;
}

// Nombre visible de una categoría (si no existe, se muestra el valor guardado).
export function obtenerNombreCategoria(valor) {
    return obtenerCategoriaPorValor(valor)?.nombre || valor || "Sin categoría";
}

export function contarProductosPorCategoria(valor) {
    return leerLista(CLAVES.productos).filter(producto => producto.categoria === valor).length;
}

// El `valor` se genera a partir del nombre (ej: "Tarjetas Gráficas" -> "tarjetas-graficas").
export function crearCategoria({ nombre, descripcion = "", icono }) {
    const categorias = obtenerCategorias();
    const base = crearSlug(nombre) || "categoria";
    let valor = base;
    for (let i = 2; categorias.some(c => c.valor === valor); i++) valor = `${base}-${i}`;

    const nueva = { valor, nombre, descripcion, icono };
    guardar(CLAVES.categorias, [...categorias, nueva]);
    return nueva;
}

export function actualizarCategoria(valor, cambios) {
    let actualizada = null;
    const categorias = obtenerCategorias().map(categoria => {
        if (categoria.valor !== valor) return categoria;
        actualizada = { ...categoria, ...cambios, valor: categoria.valor };
        return actualizada;
    });
    guardar(CLAVES.categorias, categorias);
    return actualizada;
}

// No permite eliminar una categoría que todavía tiene productos.
export function eliminarCategoria(valor) {
    const cantidad = contarProductosPorCategoria(valor);
    if (cantidad > 0) {
        return { ok: false, error: `La categoría tiene ${cantidad} producto(s). Cámbialos de categoría primero.` };
    }
    guardar(CLAVES.categorias, obtenerCategorias().filter(categoria => categoria.valor !== valor));
    return { ok: true, error: null };
}

// ----------------------------------------------------
// PRODUCTOS
// ----------------------------------------------------
export function obtenerProductos() {
    return leerLista(CLAVES.productos).map((producto, index) => ({
        ...producto,
        codigo: producto.codigo || `PROD-${producto.id || index + 1}`,
        precio: Number(producto.precio) || 0,
        stock: Number(producto.stock) || 0,
        stockCritico: Number(producto.stockCritico) || 0
    }));
}


export function obtenerProductoPorId(id) {
    return obtenerProductos().find(producto => mismoId(producto.id, id)) || null;
}


export function crearProducto(datos) {
    const nuevo = { ...datos, id: generarId() };
    guardar(CLAVES.productos, [...obtenerProductos(), nuevo]);
    return nuevo;
}


export function actualizarProducto(id, cambios) {
    let actualizado = null;
    const productos = obtenerProductos().map(producto => {
        if (!mismoId(producto.id, id)) return producto;
        actualizado = { ...producto, ...cambios, id: producto.id };
        return actualizado;
    });
    guardar(CLAVES.productos, productos);
    return actualizado;
}


export function eliminarProducto(id) {
    guardar(CLAVES.productos, obtenerProductos().filter(producto => !mismoId(producto.id, id)));
}


export function descontarStock(items) {
    const productos = obtenerProductos().map(producto => {
        const item = items.find(i => mismoId(i.id, producto.id));
        if (!item) return producto;
        return { ...producto, stock: Math.max(0, producto.stock - Number(item.cantidad)) };
    });
    guardar(CLAVES.productos, productos);
}




export function obtenerUsuarios() {
    return leerLista(CLAVES.usuarios);
}


export function obtenerUsuarioPorId(id) {
    return obtenerUsuarios().find(usuario => mismoId(usuario.id, id)) || null;
}


export function buscarUsuarioPorCredenciales(correo, password) {
    return obtenerUsuarios().find(usuario =>
        usuario.correo?.toLowerCase() === correo.toLowerCase() && usuario.password === password
    ) || null;
}


export function crearUsuario(datos) {
    const nuevo = { rol: "Cliente", estado: "Activo", compras: [], ...datos, id: generarId() };
    guardar(CLAVES.usuarios, [...obtenerUsuarios(), nuevo]);
    return nuevo;
}


export function actualizarUsuario(id, cambios) {
    let actualizado = null;
    const usuarios = obtenerUsuarios().map(usuario => {
        if (!mismoId(usuario.id, id)) return usuario;
        actualizado = { ...usuario, ...cambios, id: usuario.id };
        return actualizado;
    });
    guardar(CLAVES.usuarios, usuarios);
    return actualizado;
}


export function eliminarUsuario(id) {
    guardar(CLAVES.usuarios, obtenerUsuarios().filter(usuario => !mismoId(usuario.id, id)));
}




export function obtenerOrdenes() {
    return leerLista(CLAVES.ordenes);
}


export function obtenerOrdenPorId(id) {
    return obtenerOrdenes().find(orden => mismoId(orden.id, id)) || null;
}


export function crearOrden(datos) {
    const nueva = { ...datos, id: generarId() };
    guardar(CLAVES.ordenes, [...obtenerOrdenes(), nueva]);
    return nueva;
}


export function eliminarOrden(id) {
    guardar(CLAVES.ordenes, obtenerOrdenes().filter(orden => !mismoId(orden.id, id)));
}




export function obtenerResenasPorProducto(productoId) {
    return leerLista(CLAVES.resenas).filter(resena => mismoId(resena.productoId, productoId));
}


export function crearResena(datos) {
    const nueva = {
        ...datos,
        id: generarId(),
        fecha: new Date().toLocaleDateString("es-CL")
    };
    guardar(CLAVES.resenas, [...leerLista(CLAVES.resenas), nueva]);
    return nueva;
}


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


export function obtenerSesion() {
    return leer(CLAVES.sesion, null);
}


export function guardarSesion(usuario) {
    guardar(CLAVES.sesion, usuario);
}


export function cerrarSesion() {
    localStorage.removeItem(CLAVES.sesion);
}




// Registra la orden pagada, descuenta stock y, si hay sesión, agrega la compra
// al historial del usuario. `datos` = { usuarioId, comprador, envio, items, subtotal, descuento, cupon, total }.
export function registrarCompra({ usuarioId = null, comprador, envio, items, subtotal, descuento = 0, cupon = null, total }) {
    const fecha = fechaLocalISO();


    descontarStock(items);


    const orden = crearOrden({
        usuarioId,
        cliente: `${comprador.nombre} ${comprador.apellidos}`.trim(),
        correo: comprador.correo,
        comprador,
        envio,
        fecha,
        estado: "Pagada",
        items: items.map(({ id, nombre, precio, cantidad, imagen, categoria }) => ({
            id, nombre, precio, cantidad, imagen, categoria
        })),
        subtotal,
        descuento,
        cupon,
        total
    });


    const compras = items.map(item => ({
        fecha,
        producto: item.nombre,
        cantidad: Number(item.cantidad),
        total: item.precio * item.cantidad
    }));


    const usuarioGuardado = usuarioId ? obtenerUsuarioPorId(usuarioId) : null;
    if (usuarioGuardado) {
        actualizarUsuario(usuarioId, { compras: [...(usuarioGuardado.compras || []), ...compras] });
    }


    return orden;
}

