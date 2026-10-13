import { useState } from "react";
import TablaUsuariosAdmin from "./TablaUsuariosAdmin";
import FormularioUsuario from "./FormularioUsuario";
import HistorialCompras from "./HistorialCompras";
import Modal from "../common/Modal";
import Buscador from "../common/Buscador";
import * as db from "../../data/db";
import { limpiarRun } from "../../utils/validaciones";
import { useAuth } from "../../context/AuthContext";

// Pestaña "Usuarios" (solo admin): listar, buscar, crear, editar y eliminar usuarios.
function PanelUsuarios({ mostrar, onCambio }) {
    const { usuario: usuarioActual, refrescarSesion } = useAuth();
    const [usuarios, setUsuarios] = useState(db.obtenerUsuarios);
    const [busqueda, setBusqueda] = useState("");
    // null = cerrado, {} = nuevo usuario, {...usuario} = edición
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    const esNuevo = usuarioEditando !== null && !usuarioEditando.id;
    const esPropio = Boolean(usuarioEditando?.id) && String(usuarioEditando.id) === String(usuarioActual.id);

    const texto = busqueda.trim().toLowerCase();
    const visibles = usuarios.filter(u =>
        `${u.nombre || ""} ${u.apellidos || ""} ${u.correo || ""} ${u.run || ""}`.toLowerCase().includes(texto)
    );

    function recargar() {
        setUsuarios(db.obtenerUsuarios());
        onCambio();
    }

    function validarDuplicados(datos) {
        const otros = usuarios.filter(u => String(u.id) !== String(usuarioEditando?.id));
        if (otros.some(u => u.correo?.toLowerCase() === datos.correo)) {
            return { correo: "Ya existe un usuario con ese correo." };
        }
        if (otros.some(u => limpiarRun(u.run) === datos.run)) {
            return { run: "Ya existe un usuario con ese RUN." };
        }
        return {};
    }

    function guardar(datos) {
        if (esNuevo) {
            db.crearUsuario(datos);
            mostrar(`Usuario ${datos.correo} creado correctamente.`);
        } else {
            // En la cuenta propia se conservan el rol y el estado actuales.
            const cambios = esPropio ? { ...datos, rol: usuarioEditando.rol, estado: usuarioEditando.estado } : datos;
            db.actualizarUsuario(usuarioEditando.id, cambios);
            if (esPropio) refrescarSesion();
            mostrar("Usuario actualizado correctamente.");
        }
        setUsuarioEditando(null);
        recargar();
    }

    function eliminar(usuario) {
        if (String(usuario.id) === String(usuarioActual.id)) return;
        if (!window.confirm(`¿Eliminar al usuario ${usuario.correo}? Esta acción no se puede deshacer.`)) return;
        db.eliminarUsuario(usuario.id);
        recargar();
        mostrar(`Usuario ${usuario.correo} eliminado.`);
    }

    return (
        <>
            <div className="card-header bg-white p-3">
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Usuarios Registrados en la Plataforma</h5>
                    <button type="button" className="btn btn-primary fw-bold" onClick={() => setUsuarioEditando({})}>
                        <i className="bi bi-person-plus me-1"></i> Nuevo Usuario
                    </button>
                </div>
                <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, correo o RUN..." etiqueta="Buscar usuario" />
            </div>

            <TablaUsuariosAdmin
                usuarios={visibles}
                usuarioActualId={usuarioActual.id}
                onVer={setUsuarioEditando}
                onEliminar={eliminar}
            />

            <Modal
                abierto={usuarioEditando !== null}
                titulo={esNuevo ? "Nuevo Usuario" : "Expediente Completo del Usuario"}
                tamano="modal-lg"
                onCerrar={() => setUsuarioEditando(null)}
            >
                {usuarioEditando && (
                    <>
                        <FormularioUsuario
                            key={usuarioEditando.id || "nuevo"}
                            usuario={usuarioEditando}
                            esNuevo={esNuevo}
                            esPropio={esPropio}
                            validarDuplicados={validarDuplicados}
                            onGuardar={guardar}
                        />
                        {!esNuevo && (
                            <>
                                <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                                    <i className="bi bi-bag-check me-1"></i> Historial de Compras Realizadas
                                </h6>
                                <HistorialCompras compras={usuarioEditando.compras} />
                            </>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
}

export default PanelUsuarios;
