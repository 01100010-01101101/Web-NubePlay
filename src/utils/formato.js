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


export function esRolAdmin(usuario) {
    const rol = String(usuario?.rol || "").toLowerCase();
    return rol === "admin" || rol === "administrador";
}


export function esRolVendedor(usuario) {
    return String(usuario?.rol || "").toLowerCase() === "vendedor";
}

