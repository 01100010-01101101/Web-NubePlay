import { formatearPrecio } from "../../utils/formato";
function TablaOrdenes({ ordenes, onVerDetalle }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3">ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
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
                                <td className="ps-3 fw-bold">#{orden.id}</td>
                                <td>{orden.fecha}</td>
                                <td>{orden.cliente || "Cliente"}</td>
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
