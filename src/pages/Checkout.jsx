import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import TablaResumenCompra from "../components/checkout/TablaResumenCompra";
import DatosEntrega from "../components/checkout/DatosEntrega";
import ResumenTotales from "../components/checkout/ResumenTotales";
import { obtenerProductos } from "../data/db";
import { boletasApi } from "../api/servicios";
import { calcularDescuento, calcularSubtotal, CUPON_VALIDO } from "../utils/carrito";
import { crearNumeroOrden, datosDesdeUsuario, MENSAJE_LOGIN_COMPRA, procesarPago, validarCheckout } from "../utils/pago";
import { formatearPrecio } from "../utils/formato";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCatalogo } from "../context/CatalogoContext";




// Mientras se restaura la sesión guardada (recarga de página) se espera antes de decidir
// si redirigir al login, y así el formulario se autocompleta con los datos del usuario.
function Checkout() {
    const { verificando } = useAuth();
    if (verificando) {
        return (
            <main className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </main>
        );
    }
    return <FormularioCheckout />;
}




function FormularioCheckout() {
    const { items, cuponAplicado, sincronizar, vaciar } = useCart();
    const { usuario } = useAuth();
    const { recargar } = useCatalogo();
    const navigate = useNavigate();
    const location = useLocation();




    const [datos, setDatos] = useState(() => location.state?.datos || datosDesdeUsuario(usuario));
    const [enviado, setEnviado] = useState(false);
    const [simularRechazo, setSimularRechazo] = useState(false);
    const [procesando, setProcesando] = useState(false);
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




    function irAPagoError(motivo) {
        navigate("/pago-error", {
            state: { datos, items, subtotal, descuento, total, motivo, numero: crearNumeroOrden(Date.now()) }
        });
    }


    async function pagar(evento) {
        evento.preventDefault();
        setEnviado(true);
        if (Object.keys(validarCheckout(datos)).length > 0 || procesando) return;


        // Revisión rápida en el navegador (y simulación de rechazo del banco para la demo).
        const resultado = procesarPago(items, obtenerProductos(), { simularRechazo });
        if (!resultado.aprobado) {
            sincronizar();
            irAPagoError(resultado.motivo);
            return;
        }


        // POST /api/v1/boletas: el backend vuelve a validar el stock, toma los precios
        // desde la base de datos, aplica el cupón y descuenta el inventario.
        const { calle, departamento, region, comuna, indicaciones, ...comprador } = datos;
        setProcesando(true);
        try {
            const orden = await boletasApi.crear({
                comprador: { nombre: comprador.nombre, apellidos: comprador.apellidos, correo: comprador.correo },
                envio: { calle, departamento, region, comuna, indicaciones },
                items: items.map(item => ({ productoId: item.id, cantidad: Number(item.cantidad) })),
                cupon: cuponAplicado ? CUPON_VALIDO : null
            });


            compraFinalizada.current = true;
            await recargar(); // el stock cambió en el backend
            vaciar();
            navigate(`/compra-exitosa/${orden.id}`, { replace: true, state: { orden } });
        } catch (error) {
            await recargar();
            sincronizar();
            irAPagoError(error.message);
        } finally {
            setProcesando(false);
        }
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
                            <button type="submit" className="btn btn-success fw-bold px-4" disabled={procesando}>
                                {procesando
                                    ? <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                    : <i className="bi bi-credit-card me-1"></i>} Pagar ahora {formatearPrecio(total)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}




export default Checkout;





