import { formatearPrecio } from "../../utils/formato";
function HistorialCompras({ compras = [] }) {
    return (
        <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th className="text-center">Cant.</th>
                        <th>Total Pagado</th>
                    </tr>
                </thead>
                <tbody>
                    {compras.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center text-muted">No registra compras realizadas.</td>
                        </tr>
                    ) : (
                        compras.map((compra, index) => (
                            <tr key={`${compra.fecha}-${compra.producto}-${index}`}>
                                <td>{compra.fecha}</td>
                                <td>{compra.producto}</td>
                                <td className="text-center">{compra.cantidad}</td>
                                <td>{formatearPrecio(compra.total)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default HistorialCompras;
