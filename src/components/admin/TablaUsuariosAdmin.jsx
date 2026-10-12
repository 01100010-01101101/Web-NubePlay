import { esRolAdmin } from "../../utils/formato";

function claseRol(usuario) {
    if (esRolAdmin(usuario)) return "bg-danger";
    if (usuario.rol === "Vendedor") return "bg-warning text-dark";
    return "bg-info";
}
function TablaUsuariosAdmin({ usuarios, onVer }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3">ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                            <td className="ps-3 fw-bold">#{usuario.id}</td>
                            <td>{`${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim()}</td>
                            <td>{usuario.correo}</td>
                            <td><span className={`badge ${claseRol(usuario)}`}>{usuario.rol}</span></td>
                            <td>
                                <span className={`badge ${usuario.estado === "Activo" ? "bg-success" : "bg-secondary"}`}>
                                    {usuario.estado}
                                </span>
                            </td>
                            <td className="text-center">
                                <button type="button" className="btn btn-sm btn-outline-primary text-nowrap" onClick={() => onVer(usuario)}>
                                    <i className="bi bi-eye"></i> Ver / Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TablaUsuariosAdmin;