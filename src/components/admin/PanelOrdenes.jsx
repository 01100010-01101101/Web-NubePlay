import { useEffect, useState } from "react";
import TablaOrdenes from "./TablaOrdenes";
import BoletaCompra from "../checkout/BoletaCompra";
import Modal from "../common/Modal";
import Buscador from "../common/Buscador";
import { boletasApi } from "../../api/servicios";
import { codigoOrden } from "../../utils/pago";

const ESTADOS = ["Pagada", "Enviada", "Entregada", "Anulada"];

// Pestaña "Órdenes": listado de compras desde GET /api/v1/boletas (Administrador y Vendedor)
// y el detalle como boleta. Solo el Administrador puede cambiar el estado (PUT /boletas/{id}/estado);
// el Vendedor ve la misma pantalla en modo lectura.
function PanelOrdenes({ esAdmin = false, mostrar = () => {}, onCambio = () => {} }) {
    const [ordenes, setOrdenes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState("");

    async function cargar() {
        try {
            setOrdenes(await boletasApi.listar());
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    function verDetalle(orden) {
        setOrdenSeleccionada(orden);
        setNuevoEstado(orden.estado);
    }

    async function cambiarEstado() {
        if (nuevoEstado === "Anulada" && !window.confirm("Al anular la boleta se devolverá el stock de sus productos. ¿Continuar?")) return;
        try {
            const actualizada = await boletasApi.cambiarEstado(ordenSeleccionada.id, nuevoEstado);
            setOrdenSeleccionada(actualizada);
            await cargar();
            onCambio();
            mostrar(`La orden ${codigoOrden(actualizada.id)} quedó en estado "${actualizada.estado}".`);
        } catch (e) {
            mostrar(e.message, "danger");
        }
    }

    const texto = busqueda.trim().toLowerCase();
    const visibles = ordenes.filter(orden =>
        `${codigoOrden(orden.id)} ${orden.cliente || ""} ${orden.correo || ""}`.toLowerCase().includes(texto)
    );

    return (
        <>
            <div className="card-header bg-white p-3">
                <h5 className="fw-bold mb-3">Órdenes Registradas</h5>
                <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar por código, cliente o correo..." etiqueta="Buscar orden" />
            </div>

            {cargando && <div className="text-center text-muted py-3"><span className="spinner-border spinner-border-sm me-2"></span>Cargando órdenes...</div>}
            {error && <div className="alert alert-danger m-3" role="alert">{error}</div>}

            <TablaOrdenes ordenes={visibles} onVerDetalle={verDetalle} />

            <Modal
                abierto={ordenSeleccionada !== null}
                titulo="Boleta de la orden"
                tamano="modal-lg"
                onCerrar={() => setOrdenSeleccionada(null)}
            >
                {ordenSeleccionada && (
                    <>
                        <BoletaCompra orden={ordenSeleccionada} />
                        {esAdmin && (
                            <div className="d-flex flex-wrap align-items-center gap-2 mt-3" data-testid="cambiar-estado">
                                <label htmlFor="estadoOrden" className="fw-semibold mb-0">Estado:</label>
                                <select
                                    id="estadoOrden"
                                    className="form-select w-auto"
                                    value={nuevoEstado}
                                    disabled={ordenSeleccionada.estado === "Anulada"}
                                    onChange={evento => setNuevoEstado(evento.target.value)}
                                >
                                    {ESTADOS.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={ordenSeleccionada.estado === "Anulada" || nuevoEstado === ordenSeleccionada.estado}
                                    onClick={cambiarEstado}
                                >
                                    <i className="bi bi-save me-1"></i> Actualizar estado
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
}

export default PanelOrdenes;
