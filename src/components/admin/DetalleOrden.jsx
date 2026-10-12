import { formatearPrecio } from "../../utils/formato";
function DetalleOrden({ orden }) {
    const items = orden.items || [];

    return (
        <div>
            <div className="row g-2 mb-3">
                <div className="col-sm-6"><strong>Cliente:</strong> {orden.cliente || "Cliente"}</div>
                <div className="col-sm-6"><strong>Correo:</strong> {orden.correo || "-"}</div>
                <div className="col-sm-6"><strong>Fecha:</strong> {orden.fecha || "-"}</div>
            </div>

            <div className="table-responsive">
                <table className="table table-sm align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th className="text-center">Cantidad</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan="4" className="text-center text-muted">Sin productos</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>{formatearPrecio(item.precio)}</td>
                                    <td className="text-center">{item.cantidad}</td>
                                    <td>{formatearPrecio(item.precio * item.cantidad)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-end fs-5 fw-bold">Total: {formatearPrecio(orden.total)}</div>
        </div>
    );
}

export default DetalleOrden;
