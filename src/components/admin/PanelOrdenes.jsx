import { useState } from "react";
import TablaOrdenes from "./TablaOrdenes";
import BoletaCompra from "../checkout/BoletaCompra";
import Modal from "../common/Modal";
import Buscador from "../common/Buscador";
import { obtenerOrdenes } from "../../data/db";
import { codigoOrden } from "../../utils/pago";

// Pestaña "Órdenes": listado de compras (la más reciente primero) y su boleta.
function PanelOrdenes() {
    const [ordenes] = useState(() => [...obtenerOrdenes()].reverse());
    const [busqueda, setBusqueda] = useState("");
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

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

            <TablaOrdenes ordenes={visibles} onVerDetalle={setOrdenSeleccionada} />

            <Modal
                abierto={ordenSeleccionada !== null}
                titulo="Boleta de la orden"
                tamano="modal-lg"
                onCerrar={() => setOrdenSeleccionada(null)}
            >
                {ordenSeleccionada && <BoletaCompra orden={ordenSeleccionada} />}
            </Modal>
        </>
    );
}

export default PanelOrdenes;
