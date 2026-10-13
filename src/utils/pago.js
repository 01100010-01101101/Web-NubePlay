import { validarCorreo, validarTexto } from "./validaciones";
import { fechaLocalISO } from "./formato";


export const MENSAJE_LOGIN_COMPRA = "Debes iniciar sesión para completar la compra.";


export const DATOS_CHECKOUT_VACIOS = {
    nombre: "",
    apellidos: "",
    correo: "",
    calle: "",
    departamento: "",
    region: "",
    comuna: "",
    indicaciones: ""
};


export function datosDesdeUsuario(usuario) {
    if (!usuario) return DATOS_CHECKOUT_VACIOS;


    return {
        ...DATOS_CHECKOUT_VACIOS,
        nombre: usuario.nombre || "",
        apellidos: usuario.apellidos || "",
        correo: usuario.correo || "",
        calle: usuario.direccion || "",
        region: usuario.region || "",
        comuna: usuario.comuna || ""
    };
}


export function validarCheckout(datos) {
    const errores = {};


    if (!validarTexto(datos.nombre, 50)) {
        errores.nombre = "El nombre es requerido (máx. 50 caracteres).";
    }
    if (!validarTexto(datos.apellidos, 100)) {
        errores.apellidos = "Los apellidos son requeridos (máx. 100 caracteres).";
    }
    if (!validarCorreo(datos.correo)) {
        errores.correo = "Debe ser un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }
    if (!validarTexto(datos.calle, 300)) {
        errores.calle = "La calle es requerida (máx. 300 caracteres).";
    }
    if (!validarTexto(datos.departamento, 50, false)) {
        errores.departamento = "Máximo 50 caracteres.";
    }
    if (!datos.region) {
        errores.region = "Debe seleccionar una región.";
    }
    if (!datos.comuna) {
        errores.comuna = "Debe seleccionar una comuna.";
    }
    if (!validarTexto(datos.indicaciones, 300, false)) {
        errores.indicaciones = "Máximo 300 caracteres.";
    }


    return errores;
}


export function crearNumeroOrden(id, fecha = fechaLocalISO()) {
    const dia = String(fecha).replaceAll("-", "");
    return `${dia}${String(id).slice(-4).padStart(4, "0")}`;
}


export function codigoOrden(id) {
    return `ORDER${String(id).slice(-5)}`;
}


export function calcularIva(total) {
    const neto = Math.round(Number(total) / 1.19);
    return { neto, iva: Math.round(Number(total)) - neto };
}


export function procesarPago(items, productos, { simularRechazo = false } = {}) {
    if (items.length === 0) {
        return { aprobado: false, motivo: "El carrito está vacío." };
    }


    const sinStock = items.find(item => {
        const producto = productos.find(p => String(p.id) === String(item.id));
        return !producto || Number(item.cantidad) > Number(producto.stock);
    });


    if (sinStock) {
        return { aprobado: false, motivo: `No hay stock suficiente de "${sinStock.nombre}".` };
    }


    if (simularRechazo) {
        return { aprobado: false, motivo: "El banco rechazó la transacción. Intenta nuevamente." };
    }


    return { aprobado: true, motivo: null };
}

