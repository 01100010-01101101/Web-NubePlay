import { useState } from "react";
import TablaProductosAdmin from "./TablaProductosAdmin";
import FormularioProducto from "./FormularioProducto";
import Modal from "../common/Modal";
import Buscador from "../common/Buscador";
import * as db from "../../data/db";
import { useCart } from "../../context/CartContext";

// Pestaña "Productos": inventario con búsqueda, filtro de stock crítico y CRUD (solo admin).
function PanelProductos({ esAdmin, soloCriticos, onSoloCriticosChange, mostrar, onCambio }) {
    const { sincronizar } = useCart();
    const [productos, setProductos] = useState(db.obtenerProductos);
    const [busqueda, setBusqueda] = useState("");
    // null = cerrado, {} = nuevo producto, {...producto} = edición
    const [productoEditando, setProductoEditando] = useState(null);

    const texto = busqueda.trim().toLowerCase();
    const visibles = productos.filter(producto =>
        (!soloCriticos || producto.stock <= producto.stockCritico) &&
        (producto.nombre.toLowerCase().includes(texto) || producto.codigo.toLowerCase().includes(texto))
    );

    function recargar() {
        setProductos(db.obtenerProductos());
        sincronizar();
        onCambio();
    }

    function validarCodigo(codigo) {
        const duplicado = productos.some(p =>
            p.codigo.toLowerCase() === codigo.toLowerCase() && String(p.id) !== String(productoEditando?.id)
        );
        return duplicado ? "Ya existe otro producto con ese código." : null;
    }

    function guardar(datos) {
        if (productoEditando.id) {
            db.actualizarProducto(productoEditando.id, datos);
        } else {
            db.crearProducto(datos);
        }
        setProductoEditando(null);
        recargar();

        if (datos.stock <= datos.stockCritico) {
            mostrar(`Advertencia: "${datos.nombre}" quedó en stock crítico.`, "warning");
        } else {
            mostrar("Producto guardado correctamente.");
        }
    }

    function eliminar(producto) {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"?`)) return;
        db.eliminarProducto(producto.id);
        recargar();
        mostrar("Producto eliminado.");
    }

    return (
        <>
            <div className="card-header bg-white p-3">
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">
                        {soloCriticos ? "Productos con stock crítico" : "Inventario de Productos"}
                    </h5>
                    {esAdmin && (
                        <button type="button" className="btn btn-primary fw-bold" onClick={() => setProductoEditando({})}>
                            <i className="bi bi-plus-circle me-1"></i> Agregar Producto
                        </button>
                    )}
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-md-7">
                        <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o código..." etiqueta="Buscar producto" />
                    </div>
                    <div className="col-md-5">
                        <div className="form-check form-switch mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="soloCriticos"
                                checked={soloCriticos}
                                onChange={evento => onSoloCriticosChange(evento.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="soloCriticos">Mostrar solo stock crítico</label>
                        </div>
                    </div>
                </div>
            </div>

            <TablaProductosAdmin
                productos={visibles}
                editable={esAdmin}
                onEditar={setProductoEditando}
                onEliminar={eliminar}
            />

            <Modal
                abierto={productoEditando !== null}
                titulo={productoEditando?.id ? "Editar Producto" : "Agregar Producto"}
                onCerrar={() => setProductoEditando(null)}
            >
                <FormularioProducto
                    key={productoEditando?.id || "nuevo"}
                    producto={productoEditando?.id ? productoEditando : null}
                    categorias={db.obtenerCategorias()}
                    validarCodigo={validarCodigo}
                    onGuardar={guardar}
                    onCancelar={() => setProductoEditando(null)}
                />
            </Modal>
        </>
    );
}

export default PanelProductos;
