function TarjetaEstadistica({ titulo, valor, icono, color = "bg-primary text-white" }) {
    return (
        <div className={`card border-0 shadow-sm rounded-4 p-3 h-100 ${color}`}>
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <h6 className="mb-1 opacity-75">{titulo}</h6>
                    <h2 className="fw-bold mb-0">{valor}</h2>
                </div>
                <i className={`bi ${icono} display-4 opacity-50`}></i>
            </div>
        </div>
    );
}
export default TarjetaEstadistica;