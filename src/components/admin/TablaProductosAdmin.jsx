import { Link } from "react-router-dom";
import { formatearPrecio, IMAGEN_POR_DEFECTO, usarImagenPorDefecto } from "../../utils/formato";
function TablaProductosAdmin({ productos, editable, onEditar, onEliminar }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3">Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Stock crítico</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map(producto => {
                        const stockBajo = producto.stock <= producto.stockCritico;

                        return (
                            <tr key={producto.id}>
                                <td className="ps-3 fw-bold">{producto.codigo}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={producto.imagen || IMAGEN_POR_DEFECTO}
                                            alt={producto.nombre}
                                            width="40"
                                            height="40"
                                            className="rounded me-2 object-fit-cover"
                                            onError={usarImagenPorDefecto}
                                        />
                                        <span className="fw-semibold">{producto.nombre}</span>
                                    </div>
                                </td>
                                <td><span className="badge bg-secondary text-capitalize">{producto.categoria}</span></td>
                                <td>{formatearPrecio(producto.precio)}</td>
                                <td>
                                    <span className={`badge ${stockBajo ? "bg-danger" : "bg-success"}`}>{producto.stock} un.</span>
                                </td>
                                <td>
                                    <span className={`badge ${stockBajo ? "bg-warning text-dark" : "bg-light text-dark"}`}>
                                        {producto.stockCritico} un.
                                    </span>
                                </td>
                                <td className="text-center text-nowrap">
                                    {editable ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary me-1"
                                                aria-label={`Editar ${producto.nombre}`}
                                                onClick={() => onEditar(producto)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                aria-label={`Eliminar ${producto.nombre}`}
                                                onClick={() => onEliminar(producto)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </>
                                    ) : (
                                        <Link className="btn btn-sm btn-outline-primary" to={`/productos/${producto.id}`}>
                                            <i className="bi bi-eye me-1"></i> Ver detalle
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TablaProductosAdmin;
