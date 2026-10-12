function EstadoVacio({ icono = "bi-emoji-frown", titulo, descripcion, children }) {
    return (
        <div className="col-12 text-center py-5">
            <i className={`bi ${icono} display-3 text-muted`}></i>
            <h4 className="mt-3 text-muted">{titulo}</h4>
            {descripcion && <p className="text-secondary">{descripcion}</p>}
            {children}
        </div>
    );
}

export default EstadoVacio;