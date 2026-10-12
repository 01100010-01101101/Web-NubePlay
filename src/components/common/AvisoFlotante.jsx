function AvisoFlotante({ aviso, onCerrar }) {
    if (!aviso) return null;

    return (
        <div
            className={`alert alert-${aviso.tipo} alert-dismissible position-fixed bottom-0 end-0 m-4 shadow-lg`}
            style={{ zIndex: 1050 }}
            role="alert"
        >
            <i className={`bi ${aviso.tipo === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}></i>
            {aviso.mensaje}
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
        </div>
    );
}

export default AvisoFlotante;