import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import BoletaCompra from "../components/checkout/BoletaCompra";
import EstadoVacio from "../components/common/EstadoVacio";
import Alerta from "../components/common/Alerta";
import { obtenerOrdenPorId } from "../data/db";
import { crearNumeroOrden } from "../utils/pago";


function CompraExitosa() {
    const { id } = useParams();
    const orden = obtenerOrdenPorId(id);
    const [mensajeEmail, setMensajeEmail] = useState(null);


    if (!orden) {
        return (
            <main className="container my-5">
                <EstadoVacio icono="bi-exclamation-triangle" titulo="Orden no encontrada">
                    <Link to="/productos" className="btn btn-primary mt-2">Ir a la tienda</Link>
                </EstadoVacio>
            </main>
        );
    }


    return (
        <main className="container my-5">
            <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: "820px" }}>
                <div className="card-body p-4 p-md-5">
                    <div className="text-center mb-4">
                        <i className="bi bi-check-circle-fill text-success display-4"></i>
                        <h2 className="h4 fw-bold text-success mt-2">
                            Se ha realizado la compra. nro #{crearNumeroOrden(orden.id, orden.fecha)}
                        </h2>
                        <p className="text-muted mb-0">Gracias por comprar en NUBEPLAY. Este es el detalle de tu boleta.</p>
                    </div>


                    <BoletaCompra orden={orden} />


                    <Alerta className="mt-3" mensaje={mensajeEmail} onCerrar={() => setMensajeEmail(null)} />


                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => setMensajeEmail(`La boleta fue enviada a ${orden.correo}.`)}
                        >
                            <i className="bi bi-envelope me-1"></i> Enviar boleta por email
                        </button>
                        <Link to="/productos" className="btn btn-outline-primary">Seguir comprando</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}


export default CompraExitosa;

