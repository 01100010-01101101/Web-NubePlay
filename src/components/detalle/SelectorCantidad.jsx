function SelectorCantidad({ cantidad, minimo = 1, maximo, onChange, onLimite, tamano = "" }) {
    function restar() {
        if (cantidad > minimo) onChange(cantidad - 1);
    }

    function sumar() {
        if (cantidad < maximo) {
            onChange(cantidad + 1);
        } else if (onLimite) {
            onLimite();
        }
    }

    return (
        <div className={`input-group ${tamano}`} style={{ width: "130px" }}>
            <button className="btn btn-outline-secondary" type="button" onClick={restar} disabled={cantidad <= minimo} aria-label="Restar">-</button>
            <input type="text" className="form-control text-center fw-bold" value={cantidad} readOnly aria-label="Cantidad" />
            <button className="btn btn-outline-secondary" type="button" onClick={sumar} disabled={!onLimite && cantidad >= maximo} aria-label="Sumar">+</button>
        </div>
    );
}

export default SelectorCantidad;