import { useState } from "react";
import TablaCategorias from "./TablaCategorias";
import FormularioCategoria from "./FormularioCategoria";
import Modal from "../common/Modal";
import * as db from "../../data/db";
import { useCatalogo } from "../../context/CatalogoContext";
import { categoriasApi } from "../../api/servicios";

// Pestaña "Categorías" (solo admin): crear, editar y eliminar categorías.
function PanelCategorias({ mostrar, onCambio }) {
    const { categorias, recargar: recargarCatalogo } = useCatalogo();
    // null = cerrado, {} = nueva categoría, {...categoria} = edición
    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const esEdicion = Boolean(categoriaEditando?.valor);

    async function recargar() {
        await recargarCatalogo();
        onCambio();
    }

    // POST /categorias o PUT /categorias/{id} (rol ADMIN).
    async function guardar(datos) {
        try {
            if (esEdicion) {
                await categoriasApi.actualizar(categoriaEditando.id, datos);
                mostrar(`Categoría "${datos.nombre}" actualizada.`);
            } else {
                await categoriasApi.crear(datos);
                mostrar(`Categoría "${datos.nombre}" creada.`);
            }
            setCategoriaEditando(null);
            await recargar();
        } catch (error) {
            setCategoriaEditando(null);
            mostrar(error.message, "danger");
        }
    }

    // DELETE /categorias/{id}: el backend responde 409 si la categoría todavía tiene productos.
    async function eliminar(categoria) {
        if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
        try {
            await categoriasApi.eliminar(categoria.id);
            await recargar();
            mostrar(`Categoría "${categoria.nombre}" eliminada.`);
        } catch (error) {
            mostrar(error.message, "danger");
        }
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
