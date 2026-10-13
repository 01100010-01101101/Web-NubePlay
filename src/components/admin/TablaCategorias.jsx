// Listado de categorías con la cantidad de productos de cada una.
function TablaCategorias({ categorias, contarProductos, onEditar, onEliminar }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3">Categoría</th>
                        <th className="d-none d-md-table-cell">Descripción</th>
                        <th className="text-center">Prod.</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.length === 0 && (
                        <tr><td colSpan="4" className="text-center text-muted py-4">No hay categorías registradas.</td></tr>
                    )}
                    {categorias.map(categoria => {
                        const cantidad = contarProductos(categoria.valor);

                        return (
                            <tr key={categoria.valor}>
                                <td className="ps-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className={`bi ${categoria.icono} fs-4 text-primary`}></i>
                                        <div>
                                            <span className="fw-semibold d-block">{categoria.nombre}</span>
                                            <small className="text-muted d-none d-sm-inline">/categorias/{categoria.valor}</small>
                                        </div>
                                    </div>
                                </td>
                                <td className="d-none d-md-table-cell text-secondary small">{categoria.descripcion || "—"}</td>
                                <td className="text-center"><span className="badge bg-secondary">{cantidad}</span></td>
                                <td className="text-center text-nowrap">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary me-1"
                                        aria-label={`Editar categoría ${categoria.nombre}`}
                                        onClick={() => onEditar(categoria)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        aria-label={`Eliminar categoría ${categoria.nombre}`}
                                        title={cantidad > 0 ? "Tiene productos asociados" : "Eliminar categoría"}
                                        onClick={() => onEliminar(categoria)}
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

export default TablaCategorias;
