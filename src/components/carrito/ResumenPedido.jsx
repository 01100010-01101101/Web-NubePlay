import { useState } from "react";
import { formatearPrecio } from "../../utils/formato";

function ResumenPedido({ subtotal, descuento, onAplicarCupon, onPagar, deshabilitado }) {
    const [cupon, setCupon] = useState("");
    const [mensajeCupon, setMensajeCupon] = useState(null);

    function aplicarCupon() {
        const valido = onAplicarCupon(cupon);
        setMensajeCupon(valido
            ? { texto: "¡Cupón del 10% aplicado con éxito!", clase: "text-success fw-bold" }
            : { texto: "Código de descuento inválido.", clase: "text-danger" });
    }

    return (
        <div className="card shadow-sm border-0 rounded-4 p-4">
            <h5 className="fw-bold border-bottom pb-3 mb-3">Resumen del Pedido</h5>

            <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Subtotal</span>
                <span className="fw-semibold">{formatearPrecio(subtotal)}</span>
            </div>

            {descuento > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Descuento (10%)</span>
                    <span className="fw-semibold">-{formatearPrecio(descuento)}</span>
                </div>
            )}

            <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">Envío</span>
                <span className="text-success fw-semibold">Gratis</span>
            </div>

            <div className="mb-3">
                <label htmlFor="inputCupon" className="form-label small fw-semibold text-secondary">¿Tienes un cupón?</label>
                <div className="input-group">
                    <input
                        type="text"
                        id="inputCupon"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="Ej: NUBEPLAY123"
                        value={cupon}
                        onChange={evento => setCupon(evento.target.value)}
                    />
                    <button className="btn btn-outline-primary btn-sm fw-bold" type="button" onClick={aplicarCupon}>
                        Aplicar
                    </button>
                </div>
                {mensajeCupon && <div className={`form-text small ${mensajeCupon.clase}`}>{mensajeCupon.texto}</div>}
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-4">
                <span className="fs-5 fw-bold">Total</span>
                <span className="fs-4 fw-bold text-primary">{formatearPrecio(subtotal - descuento)}</span>
            </div>

            <button type="button" className="btn btn-primary w-100 py-2 fw-bold" onClick={onPagar} disabled={deshabilitado}>
                <i className="bi bi-credit-card me-1"></i> Proceder al Pago
            </button>
        </div>
    );
}

export default ResumenPedido;