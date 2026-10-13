import { Navigate, useLocation, useNavigate } from "react-router-dom";
import TablaResumenCompra from "../components/checkout/TablaResumenCompra";
import DatosEntrega from "../components/checkout/DatosEntrega";
import ResumenTotales from "../components/checkout/ResumenTotales";

function PagoError() {
    const { state } = useLocation();
    const navigate = useNavigate();


    if (!state?.datos) {
        return <Navigate to="/carrito" replace />;
    }


    const { datos, items, subtotal, descuento, total, motivo, numero } = state;


    return (
        <main className="container my-5">
            <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: "900px" }}>
                <div className="card-body p-4 p-md-5">
                    <h2 className="h4 fw-bold text-danger">
                        <i className="bi bi-x-circle me-2"></i>
                        No se pudo realizar el pago. nro #{numero}
                    </h2>
                    <div className="alert alert-danger mt-3" role="alert">{motivo}</div>


                    <div className="text-center my-3">
                        <button
                            type="button"
                            className="btn btn-success fw-bold px-4"
                            onClick={() => navigate("/checkout", { state: { datos } })}
                        >
                            VOLVER A REALIZAR EL PAGO
                        </button>
                    </div>


                    <DatosEntrega datos={datos} soloLectura onChange={() => {}} />


                    <TablaResumenCompra items={items} />
                    <ResumenTotales subtotal={subtotal} descuento={descuento} total={total} />
                </div>
            </div>
        </main>
    );
}


export default PagoError;

