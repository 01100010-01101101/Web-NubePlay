function Alerta({ mensaje, tipo = "success", onCerrar, className = "" }) {
    if (!mensaje) return null;
    return (
        <div className={`alert alert-${tipo} ${onCerrar ? "alert-dismissible" : ""} ${className}`} role="alert">
            {mensaje}
            {onCerrar && (
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
            )}
        </div>
    );
}

export default Alerta;