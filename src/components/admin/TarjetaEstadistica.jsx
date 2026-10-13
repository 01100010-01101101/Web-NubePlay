// Tarjeta de color con un indicador numérico del panel.
// Si recibe `onClick` se vuelve un botón (ej: filtrar productos críticos).
function TarjetaEstadistica({ titulo, valor, icono, color = "bg-primary text-white", onClick, detalle }) {
    const contenido = (
        <div className="d-flex align-items-center justify-content-between">
            <div>
                <h6 className="mb-1 opacity-75">{titulo}</h6>
                <h2 className="fw-bold mb-0">{valor}</h2>
                {detalle && <small className="opacity-75">{detalle}</small>}
            </div>
            <i className={`bi ${icono} display-4 opacity-50 d-none d-sm-block`}></i>
        </div>
    );

    if (onClick) {
        return (
            <button type="button" className={`card border-0 shadow-sm rounded-4 p-3 h-100 w-100 text-start tarjeta-estadistica ${color}`} onClick={onClick}>
                {contenido}
            </button>
        );
    }

    return <div className={`card border-0 shadow-sm rounded-4 p-3 h-100 ${color}`}>{contenido}</div>;
}

export default TarjetaEstadistica;
