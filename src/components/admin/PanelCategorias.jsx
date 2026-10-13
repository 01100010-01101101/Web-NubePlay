import { useState } from "react";
import TablaCategorias from "./TablaCategorias";
import FormularioCategoria from "./FormularioCategoria";
import Modal from "../common/Modal";
import * as db from "../../data/db";

// Pestaña "Categorías" (solo admin): crear, editar y eliminar categorías.
function PanelCategorias({ mostrar, onCambio }) {
    const [categorias, setCategorias] = useState(db.obtenerCategorias);
    // null = cerrado, {} = nueva categoría, {...categoria} = edición
    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const esEdicion = Boolean(categoriaEditando?.valor);

    function recargar() {
        setCategorias(db.obtenerCategorias());
        onCambio();
    }

    function guardar(datos) {
        if (esEdicion) {
            db.actualizarCategoria(categoriaEditando.valor, datos);
            mostrar(`Categoría "${datos.nombre}" actualizada.`);
        } else {
            db.crearCategoria(datos);
            mostrar(`Categoría "${datos.nombre}" creada.`);
        }
        setCategoriaEditando(null);
        recargar();
    }

    function eliminar(categoria) {
        if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;

        const resultado = db.eliminarCategoria(categoria.valor);
        if (!resultado.ok) {
            mostrar(resultado.error, "danger");
            return;
        }
        recargar();
        mostrar(`Categoría "${categoria.nombre}" eliminada.`);
    }

    return (
        <>
            <div className="card-header bg-white p-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Categorías de Productos</h5>
                <button type="button" className="btn btn-primary fw-bold" onClick={() => setCategoriaEditando({})}>
                    <i className="bi bi-plus-circle me-1"></i> Nueva Categoría
                </button>
            </div>

            <TablaCategorias
                categorias={categorias}
                contarProductos={db.contarProductosPorCategoria}
                onEditar={setCategoriaEditando}
                onEliminar={eliminar}
            />

            <Modal
                abierto={categoriaEditando !== null}
                titulo={esEdicion ? "Editar Categoría" : "Nueva Categoría"}
                onCerrar={() => setCategoriaEditando(null)}
            >
                <FormularioCategoria
                    key={categoriaEditando?.valor || "nueva"}
                    categoria={esEdicion ? categoriaEditando : null}
                    existentes={categorias}
                    onGuardar={guardar}
                    onCancelar={() => setCategoriaEditando(null)}
                />
            </Modal>
        </>
    );
}

export default PanelCategorias;
