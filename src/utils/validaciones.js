const DOMINIOS_PERMITIDOS = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];

export function limpiarRun(run) {
    return String(run || "")
        .trim()
        .replace(/[^0-9kK]/g, "")
        .toUpperCase();
}

export function validarRun(run) {
    const valor = limpiarRun(run);

    if (!/^\d{7,8}[0-9K]$/.test(valor)) return false;

    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    const dvCalculado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

    return dv === dvCalculado;
}

export function validarCorreo(correo) {
    const valor = String(correo || "").trim().toLowerCase();
    return valor.length > 0 &&
        valor.length <= 100 &&
        DOMINIOS_PERMITIDOS.some(dominio => valor.endsWith(dominio));
}

export function validarPassword(password) {
    const valor = String(password || "");
    return valor.length >= 4 && valor.length <= 10;
}

export function validarTexto(texto, maximo, obligatorio = true) {
    const valor = String(texto || "").trim();
    if (obligatorio && valor === "") return false;
    return valor.length <= maximo;
}

export function validarUsuario(datos, { confirmarPassword = false } = {}) {
    const errores = {};

    if (!validarRun(datos.run)) {
        errores.run = "Ingrese un RUN válido sin puntos ni guion (ej: 19011022K).";
    }
    if (!validarTexto(datos.nombre, 50)) {
        errores.nombre = "El nombre es requerido (máx. 50 caracteres).";
    }
    if (!validarTexto(datos.apellidos, 100)) {
        errores.apellidos = "Los apellidos son requeridos (máx. 100 caracteres).";
    }
    if (!validarCorreo(datos.correo)) {
        errores.correo = "Debe ser un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100 caracteres).";
    }
    if (!validarPassword(datos.password)) {
        errores.password = "La contraseña debe tener entre 4 y 10 caracteres.";
    }
    if (confirmarPassword && (!datos.confirmPassword || datos.confirmPassword !== datos.password)) {
        errores.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (!datos.region) {
        errores.region = "Debe seleccionar una región.";
    }
    if (!datos.comuna) {
        errores.comuna = "Debe seleccionar una comuna.";
    }
    if (!validarTexto(datos.direccion, 300)) {
        errores.direccion = "La dirección es requerida (máx. 300 caracteres).";
    }

    return errores;
}

export function validarProducto(datos) {
    const errores = {};
    const stock = Number(datos.stock);
    const stockCritico = Number(datos.stockCritico || 0);

    if (String(datos.codigo || "").trim().length < 3) {
        errores.codigo = "El código debe tener al menos 3 caracteres.";
    }
    if (!validarTexto(datos.nombre, 100)) {
        errores.nombre = "El nombre es obligatorio (máx. 100 caracteres).";
    }
    if (!datos.categoria) {
        errores.categoria = "Debe seleccionar una categoría.";
    }
    if (datos.precio === "" || Number(datos.precio) < 0 || Number.isNaN(Number(datos.precio))) {
        errores.precio = "El precio debe ser un número mayor o igual a 0.";
    }
    if (datos.stock === "" || !Number.isInteger(stock) || stock < 0) {
        errores.stock = "El stock debe ser un número entero mayor o igual a 0.";
    }
    if (!Number.isInteger(stockCritico) || stockCritico < 0) {
        errores.stockCritico = "El stock crítico debe ser un número entero mayor o igual a 0.";
    }
    if (String(datos.descripcion || "").length > 500) {
        errores.descripcion = "La descripción debe tener máximo 500 caracteres.";
    }
    if (datos.imagen && !/^https?:\/\//i.test(datos.imagen)) {
        errores.imagen = "La imagen debe ser una URL válida (http/https) o dejarse vacía.";
    }

    return errores;
}

// Valida una categoría. `existentes` sirve para evitar nombres repetidos;
// `valorActual` excluye a la categoría que se está editando.
export function validarCategoria(datos, existentes = [], valorActual = null) {
    const errores = {};
    const nombre = String(datos.nombre || "").trim();

    if (nombre.length < 3 || nombre.length > 50) {
        errores.nombre = "El nombre debe tener entre 3 y 50 caracteres.";
    } else if (existentes.some(c => c.valor !== valorActual && c.nombre.toLowerCase() === nombre.toLowerCase())) {
        errores.nombre = "Ya existe una categoría con ese nombre.";
    }
    if (String(datos.descripcion || "").length > 150) {
        errores.descripcion = "La descripción debe tener máximo 150 caracteres.";
    }
    if (!datos.icono) {
        errores.icono = "Debe seleccionar un ícono.";
    }

    return errores;
}

// Valida el cambio de datos personales y (opcionalmente) de contraseña del perfil.
export function validarPerfil(datos, passwordGuardada) {
    const errores = {};

    if (!validarTexto(datos.nombre, 50)) {
        errores.nombre = "El nombre es requerido (máx. 50 caracteres).";
    }
    if (!validarTexto(datos.apellidos, 100)) {
        errores.apellidos = "Los apellidos son requeridos (máx. 100 caracteres).";
    }

    const quiereCambiarPassword = datos.passwordNueva || datos.confirmarPassword;
    if (quiereCambiarPassword) {
        if (datos.passwordActual !== passwordGuardada) {
            errores.passwordActual = "La contraseña actual no es correcta.";
        }
        if (!validarPassword(datos.passwordNueva)) {
            errores.passwordNueva = "La nueva contraseña debe tener entre 4 y 10 caracteres.";
        }
        if (datos.confirmarPassword !== datos.passwordNueva) {
            errores.confirmarPassword = "Las contraseñas no coinciden.";
        }
    }

    return errores;
}
