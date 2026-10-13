import { formatearPrecio } from "../../utils/formato";
import { calcularIva, codigoOrden, crearNumeroOrden } from "../../utils/pago";


function FilaTotal({ etiqueta, valor, className = "" }) {
    return (
        <div className={`d-flex justify-content-between ${className}`}>
            <span>{etiqueta}</span>
            <span>{valor}</span>
        </div>
    );
}


function BoletaCompra({ orden }) {
    const items = orden.items || [];
    const subtotal = orden.subtotal ?? orden.total;
    const descuento = Number(orden.descuento) || 0;
    const { neto, iva } = calcularIva(orden.total);
    const comprador = orden.comprador || { nombre: orden.cliente, apellidos: "", correo: orden.correo };
    const envio = orden.envio;


    return (
        <div className="border rounded-4 p-3 p-md-4 bg-white" data-testid="boleta">
            <div className="d-flex flex-wrap justify-content-between gap-2 border-bottom pb-3 mb-3">
                <div>
                    <h3 className="h5 fw-bold mb-0"><i className="bi bi-cloud-fill text-primary"></i> NUBEPLAY</h3>
                    <small className="text-muted">Boleta electrónica</small>
                </div>
                <div className="text-md-end small">
                    <div><strong>Código:</strong> <span data-testid="codigo-orden">{codigoOrden(orden.id)}</span></div>
                    <div><strong>N° boleta:</strong> #{crearNumeroOrden(orden.id, orden.fecha)}</div>
                    <div><strong>Fecha:</strong> {orden.fecha}</div>
                    <span className="badge bg-success">{orden.estado || "Pagada"}</span>
                </div>
            </div>


            <div className="row g-3 small mb-3">
                <div className="col-md-6">
                    <h4 className="h6 fw-bold">Cliente</h4>
                    <div>{`${comprador.nombre || ""} ${comprador.apellidos || ""}`.trim() || "Cliente"}</div>
                    <div className="text-muted">{comprador.correo}</div>
                </div>
                {envio && (
                    <div className="col-md-6">
                        <h4 className="h6 fw-bold">Dirección de entrega</h4>
                        <div>{envio.calle}{envio.departamento ? `, depto. ${envio.departamento}` : ""}</div>
                        <div>{envio.comuna}, {envio.region}</div>
                        {envio.indicaciones && <div className="text-muted fst-italic">"{envio.indicaciones}"</div>}
                    </div>
                )}
            </div>


            <div className="table-responsive">
                <table className="table table-sm align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Producto</th>
                            <th className="text-center">Cant.</th>
                            <th className="text-end d-none d-sm-table-cell">Precio unit.</th>
                            <th className="text-end">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.nombre}</td>
                                <td className="text-center">{item.cantidad}</td>
                                <td className="text-end d-none d-sm-table-cell">{formatearPrecio(item.precio)}</td>
                                <td className="text-end">{formatearPrecio(item.precio * item.cantidad)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <div className="ms-auto small" style={{ maxWidth: "340px" }}>
                <FilaTotal etiqueta="Subtotal" valor={formatearPrecio(subtotal)} />
                {descuento > 0 && (
                    <FilaTotal
                        className="text-success"
                        etiqueta={`Descuento${orden.cupon ? ` cupón ${orden.cupon}` : ""} (10%)`}
                        valor={`-${formatearPrecio(descuento)}`}
                    />
                )}
                <FilaTotal etiqueta="Envío" valor="Gratis" />
                <FilaTotal className="text-muted" etiqueta="Neto" valor={formatearPrecio(neto)} />
                <FilaTotal className="text-muted" etiqueta="IVA incluido (19%)" valor={formatearPrecio(iva)} />
                <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2 mt-2">
                    <span>Total pagado</span>
                    <span className="text-primary" data-testid="total-boleta">{formatearPrecio(orden.total)}</span>
                </div>
            </div>
        </div>
    );
}


export default BoletaCompra;

