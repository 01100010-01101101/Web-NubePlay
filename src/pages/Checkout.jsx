import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import TablaResumenCompra from "../components/checkout/TablaResumenCompra";
import DatosEntrega from "../components/checkout/DatosEntrega";
import ResumenTotales from "../components/checkout/ResumenTotales";
import { obtenerProductos, registrarCompra } from "../data/db";
import { calcularDescuento, calcularSubtotal, CUPON_VALIDO } from "../utils/carrito";
import { crearNumeroOrden, datosDesdeUsuario, MENSAJE_LOGIN_COMPRA, procesarPago, validarCheckout } from "../utils/pago";
import { formatearPrecio } from "../utils/formato";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";


function Checkout() {
    const { items, cuponAplicado, sincronizar, vaciar } = useCart();
    const { usuario, refrescarSesion } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const [datos, setDatos] = useState(() => location.state?.datos || datosDesdeUsuario(usuario));
    const [enviado, setEnviado] = useState(false);
    const [simularRechazo, setSimularRechazo] = useState(false);
    const compraFinalizada = useRef(false);


    if (!usuario) {
        return <Navigate to="/login" replace state={{ mensaje: MENSAJE_LOGIN_COMPRA, desde: "/checkout" }} />;
    }


    if (items.length === 0 && !compraFinalizada.current) {
        return <Navigate to="/carrito" replace />;
    }


    const subtotal = calcularSubtotal(items);
    const descuento = calcularDescuento(subtotal, cuponAplicado);
    const total = subtotal - descuento;
    const errores = enviado ? validarCheckout(datos) : {};


    function pagar(evento) {
        evento.preventDefault();
        setEnviado(true);
        if (Object.keys(validarCheckout(datos)).length > 0) return;


        const resultado = procesarPago(items, obtenerProductos(), { simularRechazo });


        if (!resultado.aprobado) {
            sincronizar();
            navigate("/pago-error", {
                state: { datos, items, subtotal, descuento, total, motivo: resultado.motivo, numero: crearNumeroOrden(Date.now()) }
            });
            return;
        }


        const { calle, departamento, region, comuna, indicaciones, ...comprador } = datos;
        const orden = registrarCompra({
            usuarioId: usuario.id,
            cupon: cuponAplicado ? CUPON_VALIDO : null,
            comprador,
            envio: { calle, departamento, region, comuna, indicaciones },
            items,
            subtotal,
            descuento,
            total
        });


        compraFinalizada.current = true;
        vaciar();
        refrescarSesion();
        navigate(`/compra-exitosa/${orden.id}`, { replace: true });
    }


    return (
        <main className="container my-5">
            <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: "900px" }}>
                <div className="card-body p-4 p-md-5">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                        <div>
                            <h2 className="h4 fw-bold mb-0">Carrito de compra</h2>
                            <small className="text-muted">Revisa tus productos y completa tus datos</small>
                        </div>
                        <span className="badge bg-primary fs-6 p-2">Total a pagar: {formatearPrecio(total)}</span>
                    </div>


                    <TablaResumenCompra items={items} />


                    <form onSubmit={pagar} noValidate>
                        <DatosEntrega
                            datos={datos}
                            errores={errores}
                            onChange={cambio => setDatos(actuales => ({ ...actuales, ...cambio }))}
                        />


                        <ResumenTotales subtotal={subtotal} descuento={descuento} total={total} />


                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="simularRechazo"
                                    checked={simularRechazo}
                                    onChange={evento => setSimularRechazo(evento.target.checked)}
                                />
                                <label className="form-check-label small text-muted" htmlFor="simularRechazo">
                                    Modo demostración: simular pago rechazado
                                </label>
                            </div>
                            <button type="submit" className="btn btn-success fw-bold px-4">
                                <i className="bi bi-credit-card me-1"></i> Pagar ahora {formatearPrecio(total)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}


export default Checkout;

