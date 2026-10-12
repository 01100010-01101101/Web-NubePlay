import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alerta from "../components/common/Alerta";
import EstadoVacio from "../components/common/EstadoVacio";
import SelectorCantidad from "../components/detalle/SelectorCantidad";
import ListaResenas from "../components/detalle/ListaResenas";
import FormularioResena from "../components/detalle/FormularioResena";
import { crearResena, obtenerProductoPorId, obtenerResenasPorProducto } from "../data/db";
import { formatearPrecio, IMAGEN_POR_DEFECTO, usarImagenPorDefecto } from "../utils/formato";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useAviso } from "../hooks/useAviso";

function DetalleProducto() {
    const { id } = useParams();
    const producto = obtenerProductoPorId(id);
    const { agregar } = useCart();
    const { esVendedor } = useAuth();
    const [cantidad, setCantidad] = useState(1);
    const [resenas, setResenas] = useState(() => obtenerResenasPorProducto(id));
    const { aviso, mostrar, ocultar } = useAviso(4000);

    if (!producto) {
        return (
            <main className="container my-5">
                <EstadoVacio
                    icono="bi-exclamation-triangle"
                    titulo="Producto no encontrado"
                    descripcion="El producto seleccionado no existe o fue removido."
                >
                    <Link to="/productos" className="btn btn-primary mt-2">
                        <i className="bi bi-arrow-left me-1"></i> Volver al Catálogo
                    </Link>
                </EstadoVacio>
            </main>
        );
    }

    const disponible = producto.stock > 0;

    function agregarAlCarrito() {
        const error = agregar(producto, cantidad);
        mostrar(
            error || `Se agregaron ${cantidad} unidad(es) de "${producto.nombre}" al carrito.`,
            error ? "danger" : "success"
        );
    }

    function publicarResena(datos) {
        crearResena({ ...datos, productoId: producto.id });
        setResenas(obtenerResenasPorProducto(producto.id));
        mostrar("Tu reseña fue publicada correctamente.");
    }

    return (
        <main className="container my-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
                    <li className="breadcrumb-item"><Link to="/productos">Productos</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
                </ol>
            </nav>

            <Alerta mensaje={aviso?.mensaje} tipo={aviso?.tipo} onCerrar={ocultar} />

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                <div className="card-body p-4 p-md-5">
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div className="text-center bg-white p-3 rounded-4 border">
                                <img
                                    src={producto.imagen || IMAGEN_POR_DEFECTO}
                                    alt={producto.nombre}
                                    className="img-fluid rounded-3"
                                    style={{ maxHeight: "400px", objectFit: "contain" }}
                                    onError={usarImagenPorDefecto}
                                />
                            </div>
                        </div>

                        <div className="col-lg-6 d-flex flex-column justify-content-center">
                            <span className="badge bg-secondary text-uppercase mb-2 align-self-start">
                                {producto.categoria || "Sin categoría"}
                            </span>
                            <h2 className="fw-bold mb-2">{producto.nombre}</h2>
                            <h3 className="display-6 fw-bold text-primary mb-3">{formatearPrecio(producto.precio)}</h3>
                            <p className="text-secondary mb-4">{producto.descripcion || "Sin descripción disponible."}</p>

                            <div className="mb-4">
                                <span className="fw-semibold d-block mb-2">
                                    Disponibilidad:{" "}
                                    <span className={`badge ${disponible ? "bg-success" : "bg-danger"}`}>
                                        {disponible ? `En stock: ${producto.stock}` : "Agotado"}
                                    </span>
                                </span>

                                {!esVendedor && (
                                    <div className="d-flex flex-wrap align-items-center gap-3">
                                        <SelectorCantidad
                                            cantidad={disponible ? cantidad : 0}
                                            minimo={disponible ? 1 : 0}
                                            maximo={producto.stock}
                                            onChange={setCantidad}
                                            onLimite={() => mostrar("No puedes superar el stock disponible.", "warning")}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary fw-bold px-4 py-2 flex-grow-1"
                                            disabled={!disponible}
                                            onClick={agregarAlCarrito}
                                        >
                                            {disponible
                                                ? <><i className="bi bi-cart-plus me-2"></i> Añadir al Carrito</>
                                                : <><i className="bi bi-x-circle me-2"></i> Producto agotado</>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-top pt-3 text-secondary small">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-truck fs-5 text-primary me-2"></i> Envío gratis a todo el país.
                                </div>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-shield-check fs-5 text-primary me-2"></i> Garantía oficial de 12 meses.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-chat-square-text me-2"></i>Opiniones de Compradores</h5>
                <div className="mb-4">
                    <ListaResenas resenas={resenas} />
                </div>
                <FormularioResena onPublicar={publicarResena} />
            </div>
        </main>
    );
}

export default DetalleProducto;