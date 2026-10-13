import { esRolAdmin } from "../../utils/formato";
import EstadoVacio from "../common/EstadoVacio";

function claseRol(usuario) {
    if (esRolAdmin(usuario)) return "bg-danger";
    if (usuario.rol === "Vendedor") return "bg-warning text-dark";
    return "bg-info";
}

// Los id generados con Date.now() son largos: se muestran sus últimos 6 dígitos.
function idCorto(id) {
    const texto = String(id);
    return texto.length > 6 ? texto.slice(-6) : texto;
}

// Listado de usuarios. No permite eliminar la cuenta del usuario que tiene la sesión.
function TablaUsuariosAdmin({ usuarios, usuarioActualId, onVer, onEliminar }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3 d-none d-md-table-cell">ID</th>
                        <th>Nombre</th>
                        <th className="d-none d-sm-table-cell">Correo</th>
                        <th>Rol</th>
                        <th className="d-none d-md-table-cell">Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.length === 0 && (
                        <tr><td colSpan="6"><EstadoVacio icono="bi-search" titulo="No hay usuarios que coincidan" /></td></tr>
                    )}
                    {usuarios.map(usuario => {
                        const esPropio = String(usuario.id) === String(usuarioActualId);

                        return (
                            <tr key={usuario.id}>
                                <td className="ps-3 fw-bold d-none d-md-table-cell" title={String(usuario.id)}>#{idCorto(usuario.id)}</td>
                                <td>
                                    {`${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim()}
                                    {esPropio && <span className="badge bg-light text-dark border ms-1">Tú</span>}
                                </td>
                                <td className="d-none d-sm-table-cell">{usuario.correo}</td>
                                <td><span className={`badge ${claseRol(usuario)}`}>{usuario.rol}</span></td>
                                <td className="d-none d-md-table-cell">
                                    <span className={`badge ${usuario.estado === "Activo" ? "bg-success" : "bg-secondary"}`}>
                                        {usuario.estado}
                                    </span>
                                </td>
                                <td className="text-center text-nowrap">
                                    <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => onVer(usuario)}>
                                        <i className="bi bi-eye"></i> Ver / Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        aria-label={`Eliminar ${usuario.correo}`}
                                        title={esPropio ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                                        disabled={esPropio}
                                        onClick={() => onEliminar(usuario)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TablaUsuariosAdmin;
