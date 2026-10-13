import { Link } from "react-router-dom";
import { formatearPrecio, IMAGEN_POR_DEFECTO, usarImagenPorDefecto } from "../../utils/formato";
import { obtenerNombreCategoria } from "../../data/db";

function TarjetaProducto({ producto, onAgregar }) {
    const agotado = producto.stock <= 0;

    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden producto-card">
            <img
                src={producto.imagen || IMAGEN_POR_DEFECTO}
                className="card-img-top"
                alt={producto.nombre}
                style={{ height: "200px", objectFit: "cover" }}
                onError={usarImagenPorDefecto}
            />
            <div className="card-body p-4 d-flex flex-column">
                <div className="mb-2 d-flex justify-content-between align-items-center gap-2">
                    <span className="badge bg-secondary">{obtenerNombreCategoria(producto.categoria)}</span>
                    {agotado
                        ? <span className="badge bg-danger">Agotado</span>
                        : <span className="badge bg-success">Stock: {producto.stock}</span>}
                </div>

                <h5 className="card-title fw-bold text-dark">{producto.nombre}</h5>
                <p className="card-text text-secondary small flex-grow-1">
                    {producto.descripcion || "Sin descripción disponible."}
                </p>

                <div className="mt-3 pt-3 border-top">
                    <span className="fs-5 fw-bold text-primary d-block mb-3">{formatearPrecio(producto.precio)}</span>
                    <div className="d-grid gap-2">
                        <Link to={`/productos/${producto.id}`} className="btn btn-outline-primary btn-sm fw-bold">
                            <i className="bi bi-eye me-1"></i> Ver detalle
                        </Link>
                        {onAgregar && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm fw-bold"
                                disabled={agotado}
                                onClick={() => onAgregar(producto)}
                            >
                                <i className="bi bi-cart-plus me-1"></i> {agotado ? "Agotado" : "Agregar al Carrito"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TarjetaProducto;