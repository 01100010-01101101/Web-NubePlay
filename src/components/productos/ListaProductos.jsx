import TarjetaProducto from "./TarjetaProducto";
import EstadoVacio from "../common/EstadoVacio";

function ListaProductos({ productos, onAgregar, columnas = "col-md-6 col-lg-4" }) {
    return (
        <div className="row g-4">
            {productos.length === 0 ? (
                <EstadoVacio titulo="No se encontraron productos" />
            ) : (
                productos.map(producto => (
                    <div className={columnas} key={producto.id}>
                        <TarjetaProducto producto={producto} onAgregar={onAgregar} />
                    </div>
                ))
            )}
        </div>
    );
}

export default ListaProductos;