import { useState } from "react";
import CampoFormulario from "../common/CampoFormulario";
import { ICONOS_CATEGORIA } from "../../data/semillas";
import { validarCategoria } from "../../utils/validaciones";

// Crea o edita una categoría: nombre, descripción e ícono.
function FormularioCategoria({ categoria, existentes = [], onGuardar, onCancelar }) {
    const [datos, setDatos] = useState({
        nombre: categoria?.nombre || "",
        descripcion: categoria?.descripcion || "",
        icono: categoria?.icono || ICONOS_CATEGORIA[0]
    });
    const [errores, setErrores] = useState({});

    function actualizarCampo(evento) {
        const { name, value } = evento.target;
        setDatos({ ...datos, [name]: value });
        if (errores[name]) setErrores({ ...errores, [name]: undefined });
    }

    function enviar(evento) {
        evento.preventDefault();
        const nuevosErrores = validarCategoria(datos, existentes, categoria?.valor ?? null);
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        onGuardar({ nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), icono: datos.icono });
    }

    return (
        <form onSubmit={enviar} noValidate>
            <CampoFormulario id="catNombre" name="nombre" etiqueta="Nombre de la categoría" maxLength={50}
                placeholder="Ej: Tarjetas Gráficas"
                valor={datos.nombre} onChange={actualizarCampo} error={errores.nombre} />

            <CampoFormulario id="catDescripcion" name="descripcion" etiqueta="Descripción (opcional)" multilinea rows="2" maxLength={150}
                placeholder="Se muestra en la vista de la categoría"
                valor={datos.descripcion} onChange={actualizarCampo} error={errores.descripcion}
                ayuda={`${datos.descripcion.length}/150 caracteres`} />

            <fieldset className="mb-3">
                <legend className="form-label fw-semibold fs-6">Ícono</legend>
                <div className="d-flex flex-wrap gap-2" role="radiogroup">
                    {ICONOS_CATEGORIA.map(icono => (
                        <div key={icono}>
                            <input
                                type="radio"
                                className="btn-check"
                                name="icono"
                                id={`icono-${icono}`}
                                value={icono}
                                checked={datos.icono === icono}
                                onChange={actualizarCampo}
                            />
                            <label className="btn btn-outline-primary fs-5 px-3" htmlFor={`icono-${icono}`} title={icono}>
                                <i className={`bi ${icono}`}></i>
                            </label>
                        </div>
                    ))}
                </div>
                {errores.icono && <div className="text-danger small mt-1">{errores.icono}</div>}
            </fieldset>

            {categoria && (
                <div className="form-text mb-3">
                    <i className="bi bi-info-circle me-1"></i>
                    La dirección <strong>/categorias/{categoria.valor}</strong> se mantiene aunque cambies el nombre.
                </div>
            )}

            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
                <button type="submit" className="btn btn-primary fw-bold">Guardar Categoría</button>
            </div>
        </form>
    );
}

export default FormularioCategoria;
