// Servicios por recurso. Cada función corresponde a un endpoint del backend (API v1).
import { api } from "./cliente";

export const authApi = {
    login: (correo, password) => api("/auth/login", { method: "POST", body: { correo, password }, auth: false }),
    registrar: datos => api("/auth/registro", { method: "POST", body: datos, auth: false }),
    google: credential => api("/auth/google", { method: "POST", body: { credential }, auth: false }),
    yo: () => api("/auth/me")
};

export const categoriasApi = {
    listar: () => api("/categorias", { auth: false }),
    crear: datos => api("/categorias", { method: "POST", body: datos }),
    actualizar: (id, datos) => api(`/categorias/${id}`, { method: "PUT", body: datos }),
    eliminar: id => api(`/categorias/${id}`, { method: "DELETE" })
};

export const productosApi = {
    listar: () => api("/productos", { auth: false }),
    obtener: id => api(`/productos/${id}`, { auth: false }),
    crear: datos => api("/productos", { method: "POST", body: datos }),
    actualizar: (id, datos) => api(`/productos/${id}`, { method: "PUT", body: datos }),
    eliminar: id => api(`/productos/${id}`, { method: "DELETE" })
};

export const usuariosApi = {
    listar: () => api("/usuarios"),
    crear: datos => api("/usuarios", { method: "POST", body: datos }),
    actualizar: (id, datos) => api(`/usuarios/${id}`, { method: "PUT", body: datos }),
    eliminar: id => api(`/usuarios/${id}`, { method: "DELETE" }),
    actualizarPerfil: datos => api("/usuarios/me", { method: "PUT", body: datos })
};

export const boletasApi = {
    listar: () => api("/boletas"),
    misBoletas: () => api("/boletas/mis-boletas"),
    obtener: id => api(`/boletas/${id}`),
    crear: datos => api("/boletas", { method: "POST", body: datos }),
    cambiarEstado: (id, estado) => api(`/boletas/${id}/estado`, { method: "PUT", body: { estado } }),
    eliminar: id => api(`/boletas/${id}`, { method: "DELETE" })
};
