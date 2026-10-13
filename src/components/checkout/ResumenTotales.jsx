import { formatearPrecio } from "../../utils/formato";


function ResumenTotales({ subtotal, descuento = 0, total, etiquetaTotal = "Total a pagar" }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 mt-3">
            {descuento > 0 && (
                <>
                    <div className="d-flex justify-content-between text-secondary">
                        <span>Subtotal</span><span>{formatearPrecio(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-success">
                        <span>Descuento cupón (10%)</span><span>-{formatearPrecio(descuento)}</span>
                    </div>
                </>
            )}
            <div className="d-flex justify-content-between align-items-center fs-5 fw-bold">
                <span>{etiquetaTotal}</span>
                <span className="text-primary" data-testid="total-compra">{formatearPrecio(total)}</span>
            </div>
        </div>
    );
}


export default ResumenTotales;

