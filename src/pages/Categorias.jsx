import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import EstadoVacio from "../components/common/EstadoVacio";
import AvisoFlotante from "../components/common/AvisoFlotante";
import TarjetaCategoria from "../components/productos/TarjetaCategoria";
import ListaProductos from "../components/productos/ListaProductos";
import { obtenerProductos } from "../data/db";
import { categorias, obtenerCategoria } from "../data/semillas";
import { filtrarProductos } from "../utils/carrito";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useAviso } from "../hooks/useAviso";



function Categorias() {
    const { categoria } = useParams();
    const seleccionada = categoria ? obtenerCategoria(categoria) : null;
    const productos = useMemo(() => obtenerProductos(), []);
    const { agregar } = useCart();
    const { esVendedor } = useAuth();
    const { aviso, mostrar, ocultar } = useAviso(2500);


    function agregarAlCarrito(producto) {
        const error = agregar(producto);
        mostrar(error || `"${producto.nombre}" añadido al carrito.`, error ? "danger" : "success");
    }


    return (
        <>
            <EncabezadoPagina
                icono="bi-grid"
                titulo={seleccionada ? seleccionada.nombre : "Categorías"}
                subtitulo={seleccionada ? seleccionada.descripcion : "Explora nuestros productos por categoría."}
            />


            <main className="container my-4">
                <div className="row g-3 justify-content-center mb-5">
                    {categorias.map(item => (
                        <div className="col-6 col-md-4 col-lg-3" key={item.valor}>
                            <TarjetaCategoria
                                categoria={item}
                                cantidad={filtrarProductos(productos, "", item.valor).length}
                                activa={item.valor === categoria}
                            />
                        </div>
                    ))}
                </div>


                {categoria && !seleccionada && (
                    <EstadoVacio icono="bi-exclamation-triangle" titulo="Categoría no encontrada">
                        <Link to="/categorias" className="btn btn-primary mt-2">Ver todas las categorías</Link>
                    </EstadoVacio>
                )}


                {seleccionada && (
                    <>
                        <h2 className="fw-bold mb-4">{seleccionada.nombre}</h2>
                        <ListaProductos
                            productos={filtrarProductos(productos, "", seleccionada.valor)}
                            onAgregar={esVendedor ? null : agregarAlCarrito}
                            columnas="col-sm-6 col-lg-3"
                        />
                    </>
                )}
            </main>


            <AvisoFlotante aviso={aviso} onCerrar={ocultar} />
        </>
    );
}


export default Categorias;

