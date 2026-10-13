import { useMemo } from "react";
import RankingBarras from "./RankingBarras";
import TarjetaEstadistica from "./TarjetaEstadistica";
import { obtenerNombreCategoria, obtenerOrdenes } from "../../data/db";
import { formatearPrecio } from "../../utils/formato";
import { productosMasVendidos, resumenVentas, ventasPorCategoria } from "../../utils/reportes";

// Pestaña "Reportes" (solo admin): indicadores de ventas calculados desde las órdenes.
function PanelReportes() {
    const ordenes = useMemo(() => obtenerOrdenes(), []);
    const resumen = resumenVentas(ordenes);
    const topProductos = productosMasVendidos(ordenes, 5);
    const porCategoria = ventasPorCategoria(ordenes, obtenerNombreCategoria);

    return (
        <>
            <div className="card-header bg-white p-3">
                <h5 className="fw-bold mb-0">Reportes de Ventas</h5>
                <small className="text-muted">Calculado a partir de {resumen.cantidadOrdenes} orden(es) registradas.</small>
            </div>

            <div className="card-body bg-light">
                <div className="row g-3 mb-3">
                    <div className="col-sm-6 col-xl-3">
                        <TarjetaEstadistica titulo="Total vendido" valor={formatearPrecio(resumen.totalVendido)} icono="bi-cash-stack" color="bg-white text-body" />
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <TarjetaEstadistica titulo="Órdenes" valor={resumen.cantidadOrdenes} icono="bi-receipt" color="bg-white text-body" />
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <TarjetaEstadistica titulo="Ticket promedio" valor={formatearPrecio(resumen.ticketPromedio)} icono="bi-graph-up" color="bg-white text-body" />
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <TarjetaEstadistica
                            titulo="Unidades vendidas"
                            valor={resumen.unidades}
                            icono="bi-box-seam"
                            color="bg-white text-body"
                            detalle={resumen.descuentos > 0 ? `Descuentos: ${formatearPrecio(resumen.descuentos)}` : null}
                        />
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-lg-6">
                        <RankingBarras titulo="Productos más vendidos (por monto)" etiquetaNombre="Producto" filas={topProductos} />
                    </div>
                    <div className="col-lg-6">
                        <RankingBarras titulo="Ventas por categoría" etiquetaNombre="Categoría" filas={porCategoria} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default PanelReportes;
