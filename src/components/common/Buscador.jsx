// Campo de búsqueda con ícono (componente controlado).
function Buscador({ valor, onChange, placeholder = "Buscar...", etiqueta = "Buscar", className = "" }) {
    return (
        <div className={`input-group ${className}`}>
            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
            <input
                type="search"
                className="form-control"
                placeholder={placeholder}
                aria-label={etiqueta}
                value={valor}
                onChange={evento => onChange(evento.target.value)}
            />
        </div>
    );
}

export default Buscador;
