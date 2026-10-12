function Boton({ etiqueta, onClick, variante = "primary", icono, type = "button", disabled = false, className = "" }) {
    return (
        <button type={type} className={`btn btn-${variante} ${className}`} onClick={onClick} disabled={disabled}>
            {icono && <i className={`bi ${icono} me-1`}></i>}
            {etiqueta}
        </button>
    );
}

export default Boton;