import { useMemo } from "react";
import { Link } from "react-router-dom";
import ListaProductos from "../components/productos/ListaProductos";
import AvisoFlotante from "../components/common/AvisoFlotante";
import { obtenerProductos } from "../data/db";
import { useCart } from "../context/CartContext";
import { useAviso } from "../hooks/useAviso";

const BENEFICIOS = [
    { icono: "bi-truck", titulo: "Despacho seguro", texto: "Recibe tus productos de forma rápida y segura." },
    { icono: "bi-shield-check", titulo: "Compra segura", texto: "Tus compras estarán protegidas durante todo el proceso." },
    { icono: "bi-headset", titulo: "Soporte", texto: "Estamos disponibles para ayudarte cuando lo necesites." }
];

const METODOS_PAGO = [
    { icono: "bi-credit-card", nombre: "Visa" },
    { icono: "bi-credit-card-2-front", nombre: "Mastercard" },
    { icono: "bi-paypal", nombre: "PayPal" }
];

function Inicio() {
    const { agregar } = useCart();
    const { aviso, mostrar, ocultar } = useAviso(2500);
    const destacados = useMemo(() => obtenerProductos().filter(p => p.stock > 0).slice(0, 4), []);

    function agregarAlCarrito(producto) {
        const error = agregar(producto);
        mostrar(error || `"${producto.nombre}" añadido al carrito.`, error ? "danger" : "success");
    }

    return (
        <>
            <section className="hero-nubeplay">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <span className="badge badge-nubeplay mb-3">TECNOLOGÍA • GAMING • INNOVACIÓN</span>
                            <h1>Bienvenido a <span>NUBEPLAY</span></h1>
                            <p>
                                Tu tienda de tecnología y videojuegos favorita. Encuentra consolas,
                                computadores, accesorios y mucho más.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/productos" className="btn btn-nubeplay btn-lg">Ver productos</Link>
                                <Link to="/nosotros" className="btn btn-outline-light btn-lg ms-2">Conócenos</Link>
                            </div>
                        </div>

                        <div className="col-lg-6 text-center">
                            <div className="hero-img rounded-4 shadow-sm overflow-hidden bg-dark mx-auto">
                                <div className="ratio ratio-16x9">
                                    <iframe
                                        src="https://www.youtube.com/embed/VQRLujxTm3c?si=ONf-NjsFijIrJwMH&rel=0"
                                        title="Video NUBEPLAY"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="productos-section">
                <div className="container">
                    <div className="section-title">
                        <span>LO MÁS BUSCADO</span>
                        <h2>Productos destacados</h2>
                        <p>Descubre algunos de nuestros productos.</p>
                    </div>

                    <ListaProductos productos={destacados} onAgregar={agregarAlCarrito} columnas="col-sm-6 col-lg-3" />

                    <div className="text-center mt-5">
                        <Link to="/productos" className="btn btn-nubeplay">Ver todos los productos</Link>
                    </div>
                </div>
            </section>

            <section className="beneficios-section">
                <div className="container">
                    <div className="row g-4">
                        {BENEFICIOS.map(beneficio => (
                            <div className="col-md-4" key={beneficio.titulo}>
                                <div className="beneficio">
                                    <i className={`bi ${beneficio.icono}`}></i>
                                    <h4>{beneficio.titulo}</h4>
                                    <p>{beneficio.texto}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pagos-section">
                <div className="container text-center">
                    <h2>Métodos de pago</h2>
                    <p>Compra de manera fácil y segura.</p>
                    <div className="metodos-pago">
                        {METODOS_PAGO.map(metodo => (
                            <div className="metodo-pago" key={metodo.nombre}>
                                <i className={`bi ${metodo.icono}`}></i>
                                <span>{metodo.nombre}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="nosotros-home">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h2>Tecnología para todos</h2>
                            <p>
                                En NUBEPLAY buscamos entregar productos tecnológicos y videojuegos de calidad,
                                ofreciendo una experiencia de compra simple, moderna y segura.
                            </p>
                            <Link to="/nosotros" className="btn btn-nubeplay">Conocer más</Link>
                        </div>
                        <div className="col-lg-6 mt-4 mt-lg-0">
                            <div className="nosotros-card">
                                <i className="bi bi-controller"></i>
                                <h3>Tu mundo gamer</h3>
                                <p>Consolas, computadores, accesorios y tecnología en un solo lugar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <AvisoFlotante aviso={aviso} onCerrar={ocultar} />
        </>
    );
}

export default Inicio;