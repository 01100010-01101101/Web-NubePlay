import { formatearPrecio } from "../../utils/formato";
import { porcentajeDelMaximo } from "../../utils/reportes";

// Ranking como tabla con una barra horizontal por fila (un solo color: es una sola
// serie de magnitud). El valor se muestra como texto y en el tooltip de la barra.
function RankingBarras({ titulo, filas, etiquetaNombre = "Nombre", vacio = "Sin datos todavía." }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
                <h6 className="fw-bold mb-3">{titulo}</h6>
                {filas.length === 0 ? (
                    <p className="text-muted small mb-0">{vacio}</p>
                ) : (
                    <table className="table table-sm table-borderless align-middle mb-0 ranking-barras">
                        <thead className="visually-hidden">
                            <tr><th>{etiquetaNombre}</th><th>Unidades</th><th>Monto</th></tr>
                        </thead>
                        <tbody>
                            {filas.map(fila => {
                                const porcentaje = porcentajeDelMaximo(fila.monto, filas);
                                const resumen = `${fila.nombre}: ${formatearPrecio(fila.monto)} (${fila.unidades} un.)`;

                                return (
                                    <tr key={fila.clave}>
                                        <td className="w-100 pe-3">
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-body">{fila.nombre}</span>
                                                <span className="text-muted">{fila.unidades} un.</span>
                                            </div>
                                            <div
                                                className="progress barra-ranking"
                                                role="img"
                                                aria-label={resumen}
                                                title={resumen}
                                            >
                                                <div className="progress-bar" style={{ width: `${porcentaje}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="text-end small fw-semibold text-nowrap text-body">{formatearPrecio(fila.monto)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default RankingBarras;
