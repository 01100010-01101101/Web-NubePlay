import { Link, useNavigate } from "react-router-dom";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import EstadoVacio from "../components/common/EstadoVacio";
import Alerta from "../components/common/Alerta";
import TablaCarrito from "../components/carrito/TablaCarrito";
import ResumenPedido from "../components/carrito/ResumenPedido";
import { calcularDescuento, calcularSubtotal, esCuponValido } from "../utils/carrito";
import { MENSAJE_LOGIN_COMPRA } from "../utils/pago";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useAviso } from "../hooks/useAviso";


function Carrito() {
    const { items, cambiarCantidad, eliminar, vaciar, sincronizar, cuponAplicado, setCuponAplicado } = useCart();
    const { usuario } = useAuth();
    const { aviso, mostrar, ocultar } = useAviso(4000);
    const navigate = useNavigate();


    const subtotal = calcularSubtotal(items);
    const descuento = calcularDescuento(subtotal, cuponAplicado);


    function manejarCambioCantidad(id, nuevaCantidad) {
        const error = cambiarCantidad(id, nuevaCantidad);
        if (error) mostrar(error, "warning");
    }


    function aplicarCupon(codigo) {
        const valido = esCuponValido(codigo);
        setCuponAplicado(valido);
        return valido;
    }


    function vaciarCarrito() {
        if (!window.confirm("¿Estás seguro de que deseas vaciar tu carrito de compras?")) return;
        vaciar();
    }


    // Para comprar se exige sesión; luego se revisa que el stock no haya cambiado.
    function irAlCheckout() {
        if (!usuario) {
            navigate("/login", { state: { mensaje: MENSAJE_LOGIN_COMPRA, desde: "/checkout" } });
            return;
        }


        const actualizado = sincronizar();
        const cambio = actualizado.length !== items.length ||
            actualizado.some((item, i) => item.cantidad !== items[i].cantidad);


        if (cambio) {
            mostrar("Uno o más productos ya no tienen stock suficiente. Revisa el carrito.", "danger");
            return;
        }


        navigate("/checkout");
    }


    return (
        <>
            <EncabezadoPagina icono="bi-cart-check" titulo="Tu Carrito de Compras" />


            <main className="container my-4">
                <Alerta mensaje={aviso?.mensaje} tipo={aviso?.tipo} onCerrar={ocultar} />


                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                            <div className="card-body p-0">
                                {items.length === 0 ? (
                                    <EstadoVacio
                                        icono="bi-cart-x"
                                        titulo="Tu carrito está vacío"
                                        descripcion="¿Aún no te decides? Revisa nuestro catálogo."
                                    >
                                        <Link to="/productos" className="btn btn-primary fw-bold mt-2">
                                            <i className="bi bi-shop me-1"></i> Ir a la tienda
                                        </Link>
                                    </EstadoVacio>
                                ) : (
                                    <TablaCarrito items={items} onCambiarCantidad={manejarCambioCantidad} onEliminar={eliminar} />
                                )}
                            </div>
                        </div>


                        {items.length > 0 && (
                            <div className="d-flex justify-content-between align-items-center mt-3 gap-2">
                                <Link to="/productos" className="btn btn-outline-secondary">
                                    <i className="bi bi-arrow-left me-1"></i> Seguir comprando
                                </Link>
                                <button type="button" className="btn btn-outline-danger" onClick={vaciarCarrito}>
                                    <i className="bi bi-trash me-1"></i> Vaciar Carrito
                                </button>
                            </div>
                        )}
                    </div>


                    <div className="col-lg-4">
                        <ResumenPedido
                            subtotal={subtotal}
                            descuento={descuento}
                            cuponAplicado={cuponAplicado}
                            onAplicarCupon={aplicarCupon}
                            onPagar={irAlCheckout}
                            deshabilitado={items.length === 0}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}


export default Carrito;

