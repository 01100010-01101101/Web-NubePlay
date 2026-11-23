export const IMAGEN_POR_DEFECTO = "https://placehold.co/600x400?text=NUBEPLAY";




export function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP"
    }).format(Number(precio) || 0);
}




export function usarImagenPorDefecto(evento) {
    if (evento.currentTarget.src !== IMAGEN_POR_DEFECTO) {
        evento.currentTarget.src = IMAGEN_POR_DEFECTO;
    }
}




export function fechaLocalISO(fecha = new Date()) {
    const dosDigitos = numero => String(numero).padStart(2, "0");
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}




// Convierte un texto en identificador: "Tarjetas Gráficas" -> "tarjetas-graficas".
export function crearSlug(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


export function esRolAdmin(usuario) {
    const rol = String(usuario?.rol || "").toLowerCase();
    return rol === "admin" || rol === "administrador";
}




export function esRolVendedor(usuario) {
    return String(usuario?.rol || "").toLowerCase() === "vendedor";
}


export function esRolCliente(usuario) {
    return String(usuario?.rol || "").toLowerCase() === "cliente";
}


// Permisos del frontend por rol (Anexo 1). Se usan para mostrar/ocultar pestañas y acciones.
// El backend vuelve a validar cada permiso: ocultar un botón no es la única protección.
export function rolesDe(usuario) {
    if (esRolAdmin(usuario)) return "admin";
    if (esRolVendedor(usuario)) return "vendedor";
    if (esRolCliente(usuario)) return "cliente";
    return null;
}





