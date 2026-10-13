import { formatearPrecio } from "../../utils/formato";
import { codigoOrden } from "../../utils/pago";

// Listado de órdenes de compra; el detalle se muestra como boleta.
function TablaOrdenes({ ordenes, onVerDetalle }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3">Código</th>
                        <th className="d-none d-sm-table-cell">Fecha</th>
                        <th className="d-none d-md-table-cell">Cliente</th>
                        <th>Total</th>
                        <th className="text-center">Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    {ordenes.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center text-muted py-4">No existen órdenes registradas todavía.</td>
                        </tr>
                    ) : (
                        ordenes.map(orden => (
                            <tr key={orden.id}>
                                <td className="ps-3 fw-bold">{codigoOrden(orden.id)}</td>
                                <td className="d-none d-sm-table-cell">{orden.fecha}</td>
                                <td className="d-none d-md-table-cell">{orden.cliente || "Cliente"}</td>
                                <td>{formatearPrecio(orden.total)}</td>
                                <td className="text-center">
                                    <button type="button" className="btn btn-sm btn-outline-primary text-nowrap" onClick={() => onVerDetalle(orden)}>
                                        <i className="bi bi-eye me-1"></i> Ver detalle
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TablaOrdenes;
