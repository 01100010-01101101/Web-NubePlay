import { useMemo, useState } from "react";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import FiltrosProductos from "../components/productos/FiltrosProductos";
import ListaProductos from "../components/productos/ListaProductos";
import AvisoFlotante from "../components/common/AvisoFlotante";
import { obtenerCategorias, obtenerProductos } from "../data/db";
import { filtrarProductos } from "../utils/carrito";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useAviso } from "../hooks/useAviso";

function Productos() {
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("todas");
    const { agregar } = useCart();
    const { esVendedor } = useAuth();
    const { aviso, mostrar, ocultar } = useAviso(2500);

    const productos = useMemo(() => obtenerProductos(), []);
    const categorias = useMemo(() => obtenerCategorias(), []);
    const filtrados = filtrarProductos(productos, busqueda, categoria);

    function agregarAlCarrito(producto) {
        const error = agregar(producto);
        mostrar(error || `"${producto.nombre}" añadido al carrito.`, error ? "danger" : "success");
    }

    return (
        <>
            <EncabezadoPagina
                icono="bi-controller"
                titulo="Catálogo de Productos"
                subtitulo="Encuentra los mejores juegos, consolas y accesorios al mejor precio."
            />

            <main className="container my-4">
                <FiltrosProductos
                    busqueda={busqueda}
                    categoria={categoria}
                    categorias={categorias}
                    onBusquedaChange={setBusqueda}
                    onCategoriaChange={setCategoria}
                />
                <ListaProductos productos={filtrados} onAgregar={esVendedor ? null : agregarAlCarrito} />
            </main>

            <AvisoFlotante aviso={aviso} onCerrar={ocultar} />
        </>
    );
}

export default Productos;
