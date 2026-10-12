import { obtenerComunas, regiones } from "../../data/regiones";

function SelectorRegionComuna({ region, comuna, onChange, errores = {}, prefijoId = "" }) {
    const comunas = obtenerComunas(region);

    function claseEstado(campo) {
        return errores[campo] ? "is-invalid" : "";
    }

    return (
        <div className="row">
            <div className="col-md-6 mb-3">
                <label htmlFor={`${prefijoId}region`} className="form-label fw-semibold">Región</label>
                <select
                    id={`${prefijoId}region`}
                    className={`form-select ${claseEstado("region")}`}
                    value={region}
                    onChange={evento => onChange({ region: evento.target.value, comuna: "" })}
                >
                    <option value="">Seleccione Región...</option>
                    {regiones.map(item => (
                        <option key={item.region} value={item.region}>{item.region}</option>
                    ))}
                </select>
                {errores.region && <div className="invalid-feedback">{errores.region}</div>}
            </div>

            <div className="col-md-6 mb-3">
                <label htmlFor={`${prefijoId}comuna`} className="form-label fw-semibold">Comuna</label>
                <select
                    id={`${prefijoId}comuna`}
                    className={`form-select ${claseEstado("comuna")}`}
                    value={comuna}
                    disabled={!region}
                    onChange={evento => onChange({ region, comuna: evento.target.value })}
                >
                    <option value="">Seleccione Comuna...</option>
                    {comunas.map(nombre => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                </select>
                {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
            </div>
        </div>
    );
}

export default SelectorRegionComuna;