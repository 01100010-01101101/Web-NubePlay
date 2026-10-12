function CampoFormulario({
    id,
    name = id,
    etiqueta,
    tipo = "text",
    valor,
    onChange,
    error,
    valido = false,
    ayuda,
    multilinea = false,
    className = "mb-3",
    ...resto
}) {
    const claseEstado = error ? "is-invalid" : valido ? "is-valid" : "";
    const propiedades = {
        id,
        name,
        className: `form-control ${claseEstado}`,
        value: valor,
        onChange,
        ...resto
    };
    return (
        <div className={className}>
            {etiqueta && <label htmlFor={id} className="form-label fw-semibold">{etiqueta}</label>}
            {multilinea ? <textarea {...propiedades} /> : <input type={tipo} {...propiedades} />}
            {error && <div className="invalid-feedback">{error}</div>}
            {ayuda && <div className="form-text">{ayuda}</div>}
        </div>
    );
}

export default CampoFormulario;