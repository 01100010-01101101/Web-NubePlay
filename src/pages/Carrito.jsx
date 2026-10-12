import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import EstadoVacio from "../components/common/EstadoVacio";
import Alerta from "../components/common/Alerta";
import TablaCarrito from "../components/carrito/TablaCarrito";
import ResumenPedido from "../components/carrito/ResumenPedido";
import { registrarCompra } from "../data/db";
import { calcularDescuento, calcularSubtotal, esCuponValido } from "../utils/carrito";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useAviso } from "../hooks/useAviso";

function Carrito() {
    const { items, cambiarCantidad, eliminar, vaciar, sincronizar } = useCart();
    const { usuario, refrescarSesion } = useAuth();
    const [descuentoAplicado, setDescuentoAplicado] = useState(false);
    const { aviso, mostrar, ocultar } = useAviso(4000);
    const navigate = useNavigate();

    const subtotal = calcularSubtotal(items);
    const descuento = calcularDescuento(subtotal, descuentoAplicado);

    function manejarCambioCantidad(id, nuevaCantidad) {
        const error = cambiarCantidad(id, nuevaCantidad);
        if (error) mostrar(error, "warning");
    }

    function aplicarCupon(codigo) {
        const valido = esCuponValido(codigo);
        setDescuentoAplicado(valido);
        return valido;
    }

    function vaciarCarrito() {
        if (!window.confirm("¿Estás seguro de que deseas vaciar tu carrito de compras?")) return;
        vaciar();
        setDescuentoAplicado(false);
    }

    function pagar() {
        if (!usuario) {
            navigate("/login", { state: { mensaje: "Debes iniciar sesión para completar la compra." } });
            return;
        }

        const actualizado = sincronizar();
        const cambio = actualizado.length !== items.length ||
            actualizado.some((item, i) => item.cantidad !== items[i].cantidad);

        if (cambio) {
            mostrar("Uno o más productos ya no tienen stock suficiente. Revisa el carrito.", "danger");
            return;
        }

        registrarCompra(usuario, actualizado, subtotal - descuento);
        vaciar();
        refrescarSesion();
        setDescuentoAplicado(false);
        mostrar("¡Gracias por tu compra! Tu pedido ha sido registrado con éxito.");
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
                            onAplicarCupon={aplicarCupon}
                            onPagar={pagar}
                            deshabilitado={items.length === 0}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}

export default Carrito;