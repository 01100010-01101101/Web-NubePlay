import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import BoletaCompra from "../components/checkout/BoletaCompra";
import EstadoVacio from "../components/common/EstadoVacio";
import Alerta from "../components/common/Alerta";
import { boletasApi } from "../api/servicios";
import { crearNumeroOrden } from "../utils/pago";




function CompraExitosa() {
    const { id } = useParams();
    const location = useLocation();
    // Recién comprada, la boleta llega desde el checkout; si se recarga la página se pide a GET /boletas/{id}.
    const ordenRecibida = location.state?.orden && String(location.state.orden.id) === String(id) ? location.state.orden : null;
    const [orden, setOrden] = useState(ordenRecibida);
    const [cargando, setCargando] = useState(!ordenRecibida);
    const [mensajeEmail, setMensajeEmail] = useState(null);


    useEffect(() => {
        if (ordenRecibida) return;
        let activo = true;
        boletasApi.obtener(id)
            .then(datos => activo && setOrden(datos))
            .catch(() => activo && setOrden(null))
            .finally(() => activo && setCargando(false));
        return () => { activo = false; };
    }, [id, ordenRecibida]);


    if (cargando) {
        return (
            <main className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </main>
        );
    }


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





