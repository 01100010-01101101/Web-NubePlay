import { productosIniciales, usuariosIniciales } from "./semillas";

export const CLAVES = {
    productos: "productos",
    usuarios: "usuarios",
    ordenes: "ventas",
    resenas: "resenasNubeplay",
    carrito: "carritoNubeplay",
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


export function registrarCompra(usuario, items, total) {
    const fecha = new Date().toISOString().split("T")[0];

    descontarStock(items);

    const orden = crearOrden({
        usuarioId: usuario.id,
        cliente: usuario.nombre,
        correo: usuario.correo,
        fecha,
        items,
        total
    });

    const compras = items.map(item => ({
        fecha,
        producto: item.nombre,
        cantidad: Number(item.cantidad),
        total: item.precio * item.cantidad
    }));

    const usuarioGuardado = obtenerUsuarioPorId(usuario.id);
    if (usuarioGuardado) {
        actualizarUsuario(usuario.id, { compras: [...(usuarioGuardado.compras || []), ...compras] });
    }

    return orden;
}