// SERVIDOR FALSO PARA LAS PRUEBAS DEL FRONTEND
// Reemplaza window.fetch por una versión en memoria que imita la API del backend
// (/api/v1/...): mismas rutas, mismos códigos HTTP (200, 201, 204, 400, 401, 403, 404, 409)
// y mismas reglas de roles. Así las pruebas de componentes no necesitan el backend real.
import { act } from "react";
import { establecerCatalogo } from "../data/db";
import { categoriasIniciales, productosIniciales } from "../data/semillas";

export const USUARIOS_PRUEBA = {
    admin: {
        id: 1, run: "111111111", nombre: "Administrador", apellidos: "NUBEPLAY", correo: "admin@duoc.cl", password: "admin",
        rol: "Administrador", estado: "Activo", region: "Metropolitana de Santiago", comuna: "Santiago", direccion: "Calle 1", compras: []
    },
    vendedor: {
        id: 2, run: "222222222", nombre: "Vera", apellidos: "Vendedora", correo: "vera@duoc.cl", password: "vende",
        rol: "Vendedor", estado: "Activo", region: "Metropolitana de Santiago", comuna: "Santiago", direccion: "Calle 2", compras: []
    },
    cliente: {
        id: 3, run: "333333333", nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", password: "1234",
        rol: "Cliente", estado: "Activo", region: "Metropolitana de Santiago", comuna: "Santiago", direccion: "Calle 3", compras: []
    },
    inactivo: {
        id: 4, run: "444444444", nombre: "Baja", apellidos: "Cuenta", correo: "baja@gmail.com", password: "1234",
        rol: "Cliente", estado: "Inactivo", region: "", comuna: "", direccion: "", compras: []
    }
};

const RUTA_API = /^.*\/api\/v1/;

function base64url(objeto) {
    return btoa(JSON.stringify(objeto)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// JWT de prueba (sin firma real): basta para que el frontend lea "exp" y "sub".
export function tokenFalso(correo, tipo = "access", segundos = 3600) {
    return `${base64url({ alg: "none" })}.${base64url({ sub: correo, typ: tipo, exp: Math.floor(Date.now() / 1000) + segundos })}.firma`;
}

function leerToken(token) {
    try {
        return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
        return null;
    }
}

const sinPassword = ({ password, ...resto }) => resto;

// Objeto con la misma forma que usa src/api/cliente.js (status, ok, text()).
// Se resuelve solo con microtareas, así funciona también con jasmine.clock() instalado.
function respuesta(status, cuerpo) {
    const texto = cuerpo === undefined ? "" : JSON.stringify(cuerpo);
    return Promise.resolve({ status, ok: status >= 200 && status < 300, text: () => Promise.resolve(texto) });
}

const error = (status, mensaje, campo = null) => respuesta(status, { status, mensaje, campo });

/**
 * Instala el servidor falso. Devuelve el estado en memoria para revisarlo en las pruebas.
 * @param {object} opciones { productos, categorias, usuarios, boletas, caido }
 */
export function simularServidor(opciones = {}) {
    const estado = {
        productos: (opciones.productos || productosIniciales).map(p => ({ ...p })),
        categorias: (opciones.categorias || categoriasIniciales).map((c, i) => ({ id: i + 1, ...c })),
        usuarios: (opciones.usuarios || Object.values(USUARIOS_PRUEBA)).map(u => ({ ...u })),
        boletas: (opciones.boletas || []).map(b => ({ ...b })),
        caido: Boolean(opciones.caido),
        peticiones: []
    };
    let siguienteId = 1000;

    establecerCatalogo({ productos: estado.productos, categorias: estado.categorias });

    spyOn(window, "fetch").and.callFake((url, init = {}) => {
        const metodo = (init.method || "GET").toUpperCase();
        const ruta = String(url).replace(RUTA_API, "").split("?")[0];
        const cuerpo = init.body ? JSON.parse(init.body) : null;
        const auth = init.headers?.Authorization || "";
        estado.peticiones.push({ metodo, ruta, auth: Boolean(auth), cuerpo });

        if (estado.caido) return Promise.reject(new TypeError("Failed to fetch"));

        const payload = auth.startsWith("Bearer ") ? leerToken(auth.slice(7)) : null;
        const actual = payload?.typ === "access" ? estado.usuarios.find(u => u.correo === payload.sub && u.estado === "Activo") : null;
        const esAdmin = actual?.rol === "Administrador";
        const esVendedor = actual?.rol === "Vendedor";
        const partes = ruta.split("/").filter(Boolean);
        const id = partes[1];

        const requiere = (condicion) => {
            if (!actual) return error(401, "Debes iniciar sesión para acceder a este recurso.");
            if (!condicion) return error(403, "No tienes permisos para realizar esta acción.");
            return null;
        };

        // ---------------- AUTH ----------------
        if (ruta === "/auth/login" && metodo === "POST") {
            const u = estado.usuarios.find(x => x.correo === cuerpo.correo && x.password === cuerpo.password);
            if (!u) return error(401, "Correo o contraseña incorrectos.");
            if (u.estado !== "Activo") return error(403, "Tu cuenta se encuentra inactiva. Contacta al soporte.");
            return respuesta(200, {
                accessToken: tokenFalso(u.correo), refreshToken: tokenFalso(u.correo, "refresh"),
                tipo: "Bearer", expiraEn: 900, usuario: sinPassword(u)
            });
        }
        // Login con Google. En las pruebas la "credencial" es: google|<sub>|<correo>
        if (ruta === "/auth/google" && metodo === "POST") {
            const [, sub, correo] = String(cuerpo.credential).split("|");
            if (!sub || !correo) return error(401, "No se pudo validar la cuenta de Google. Intenta nuevamente.");
            if (!/@(duoc\.cl|duocuc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo)) {
                return error(403, "Solo se aceptan cuentas @duoc.cl, @profesor.duoc.cl o @gmail.com.");
            }
            let u = estado.usuarios.find(x => x.googleId === sub) || estado.usuarios.find(x => x.correo === correo);
            if (!u) {
                u = { id: siguienteId++, run: "", nombre: "Google", apellidos: "Usuario", correo, password: null, rol: "Cliente", estado: "Activo", compras: [] };
                estado.usuarios.push(u);
            }
            if (u.estado !== "Activo") return error(403, "Tu cuenta se encuentra inactiva. Contacta al soporte.");
            u.googleId = sub;
            u.cuentaGoogle = true;
            return respuesta(200, {
                accessToken: tokenFalso(u.correo), refreshToken: tokenFalso(u.correo, "refresh"),
                tipo: "Bearer", expiraEn: 900, usuario: sinPassword(u)
            });
        }
        if (ruta === "/auth/refresh" && metodo === "POST") {
            const p = leerToken(cuerpo.refreshToken);
            const u = p?.typ === "refresh" && estado.usuarios.find(x => x.correo === p.sub && x.estado === "Activo");
            if (!u) return error(401, "Refresh token inválido.");
            return respuesta(200, { accessToken: tokenFalso(u.correo), refreshToken: tokenFalso(u.correo, "refresh"), usuario: sinPassword(u) });
        }
        if (ruta === "/auth/me") {
            return actual ? respuesta(200, sinPassword(actual)) : error(401, "Token inválido.");
        }
        if (ruta === "/auth/registro" && metodo === "POST") {
            if (estado.usuarios.some(u => u.correo === cuerpo.correo)) return error(409, "El correo electrónico ya se encuentra registrado.", "correo");
            if (estado.usuarios.some(u => u.run === cuerpo.run)) return error(409, "El RUN ya se encuentra registrado.", "run");
            const nuevo = { ...cuerpo, id: siguienteId++, rol: "Cliente", estado: "Activo", compras: [] };
            estado.usuarios.push(nuevo);
            return respuesta(201, sinPassword(nuevo));
        }

        // ---------------- CATÁLOGO ----------------
        if (partes[0] === "productos") {
            if (metodo === "GET") {
                if (!id) return respuesta(200, estado.productos);
                const p = estado.productos.find(x => String(x.id) === id);
                return p ? respuesta(200, p) : error(404, "El producto no existe.");
            }
            const bloqueo = requiere(esAdmin);
            if (bloqueo) return bloqueo;
            if (metodo === "POST") {
                if (estado.productos.some(p => p.codigo.toLowerCase() === cuerpo.codigo.toLowerCase())) {
                    return error(409, "Ya existe otro producto con ese código.", "codigo");
                }
                const nuevo = { ...cuerpo, id: siguienteId++ };
                estado.productos.push(nuevo);
                return respuesta(201, nuevo);
            }
            const indice = estado.productos.findIndex(x => String(x.id) === id);
            if (indice < 0) return error(404, "El producto no existe.");
            if (metodo === "PUT") {
                estado.productos[indice] = { ...estado.productos[indice], ...cuerpo, id: estado.productos[indice].id };
                return respuesta(200, estado.productos[indice]);
            }
            if (metodo === "DELETE") {
                estado.productos.splice(indice, 1);
                return respuesta(204);
            }
        }

        if (partes[0] === "categorias") {
            if (metodo === "GET") return respuesta(200, estado.categorias);
            const bloqueo = requiere(esAdmin);
            if (bloqueo) return bloqueo;
            if (metodo === "POST") {
                const nueva = { ...cuerpo, id: siguienteId++, valor: cuerpo.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
                estado.categorias.push(nueva);
                return respuesta(201, nueva);
            }
            const indice = estado.categorias.findIndex(c => String(c.id) === id);
            if (indice < 0) return error(404, "La categoría no existe.");
            if (metodo === "PUT") {
                estado.categorias[indice] = { ...estado.categorias[indice], ...cuerpo };
                return respuesta(200, estado.categorias[indice]);
            }
            if (metodo === "DELETE") {
                const valor = estado.categorias[indice].valor;
                const cantidad = estado.productos.filter(p => p.categoria === valor).length;
                if (cantidad > 0) return error(409, `La categoría tiene ${cantidad} producto(s). Cámbialos de categoría primero.`);
                estado.categorias.splice(indice, 1);
                return respuesta(204);
            }
        }

        // ---------------- USUARIOS ----------------
        if (partes[0] === "usuarios") {
            if (id === "me") {
                const bloqueo = requiere(true);
                if (bloqueo) return bloqueo;
                if (cuerpo.passwordNueva && cuerpo.passwordActual !== actual.password) {
                    return error(400, "La contraseña actual no es correcta.", "passwordActual");
                }
                Object.assign(actual, { nombre: cuerpo.nombre, apellidos: cuerpo.apellidos });
                if (cuerpo.passwordNueva) actual.password = cuerpo.passwordNueva;
                return respuesta(200, sinPassword(actual));
            }
            const bloqueo = requiere(esAdmin);
            if (bloqueo) return bloqueo;
            if (metodo === "GET") return respuesta(200, estado.usuarios.map(sinPassword));
            if (metodo === "POST") {
                if (estado.usuarios.some(u => u.correo === cuerpo.correo)) return error(409, "Ya existe un usuario con ese correo.", "correo");
                const nuevo = { compras: [], ...cuerpo, id: siguienteId++ };
                estado.usuarios.push(nuevo);
                return respuesta(201, sinPassword(nuevo));
            }
            const usuario = estado.usuarios.find(u => String(u.id) === id);
            if (!usuario) return error(404, "El usuario no existe.");
            if (metodo === "PUT") {
                const { password, ...cambios } = cuerpo;
                Object.assign(usuario, cambios);
                if (password) usuario.password = password;
                return respuesta(200, sinPassword(usuario));
            }
            if (metodo === "DELETE") {
                if (usuario.id === actual.id) return error(409, "No puedes eliminar tu propia cuenta.");
                estado.usuarios = estado.usuarios.filter(u => u !== usuario);
                return respuesta(204);
            }
        }

        // ---------------- BOLETAS ----------------
        if (partes[0] === "boletas") {
            if (metodo === "POST" && !id) {
                const bloqueo = requiere(true);
                if (bloqueo) return bloqueo;
                const items = [];
                for (const item of cuerpo.items) {
                    const p = estado.productos.find(x => String(x.id) === String(item.productoId));
                    if (!p || item.cantidad > p.stock) return error(409, `No hay stock suficiente de "${p?.nombre}".`, "items");
                    p.stock -= item.cantidad;
                    items.push({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: item.cantidad, imagen: p.imagen, categoria: p.categoria });
                }
                const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
                const descuento = cuerpo.cupon ? Math.round(subtotal * 0.1) : 0;
                const boleta = {
                    id: siguienteId++, usuarioId: actual.id, cliente: `${cuerpo.comprador.nombre} ${cuerpo.comprador.apellidos}`,
                    correo: cuerpo.comprador.correo, comprador: cuerpo.comprador, envio: cuerpo.envio,
                    fecha: "2026-11-17", estado: "Pagada", items, subtotal, descuento, cupon: cuerpo.cupon, total: subtotal - descuento
                };
                estado.boletas.push(boleta);
                return respuesta(201, boleta);
            }
            if (metodo === "GET" && !id) {
                const bloqueo = requiere(esAdmin || esVendedor);
                return bloqueo || respuesta(200, [...estado.boletas].reverse());
            }
            if (metodo === "GET") {
                const bloqueo = requiere(true);
                if (bloqueo) return bloqueo;
                const boleta = estado.boletas.find(b => String(b.id) === id);
                if (!boleta) return error(404, "La boleta no existe.");
                if (!esAdmin && !esVendedor && boleta.usuarioId !== actual.id) return error(403, "No tienes permisos para ver esta boleta.");
                return respuesta(200, boleta);
            }
            if (metodo === "PUT") {
                const bloqueo = requiere(esAdmin);
                if (bloqueo) return bloqueo;
                const boleta = estado.boletas.find(b => String(b.id) === id);
                boleta.estado = cuerpo.estado;
                return respuesta(200, boleta);
            }
        }

        return error(404, "La ruta solicitada no existe.");
    });

    return estado;
}

// Guarda en localStorage los tokens de un usuario (como si hubiera iniciado sesión antes de recargar).
export function sesionGuardada(usuario) {
    localStorage.setItem("sesion_nubeplay", JSON.stringify({
        accessToken: tokenFalso(usuario.correo),
        refreshToken: tokenFalso(usuario.correo, "refresh")
    }));
}

// Deja avanzar las promesas pendientes (fetch falso + setState) dentro de act().
export async function esperarApi(vueltas = 20) {
    await act(async () => {
        for (let i = 0; i < vueltas; i++) await Promise.resolve();
    });
}
