import { useState } from "react";
import CampoFormulario from "../common/CampoFormulario";
import SelectorRegionComuna from "../common/SelectorRegionComuna";
import { limpiarRun, validarUsuario } from "../../utils/validaciones";

// Crea (`esNuevo`) o edita un usuario. Con `esPropio` (el admin editando su propia
// cuenta) se bloquean el rol y el estado para que no pueda dejarse fuera del panel.
function FormularioUsuario({ usuario = {}, onGuardar, validarDuplicados, esNuevo = false, esPropio = false }) {
    const [datos, setDatos] = useState({
        nombre: usuario.nombre || "",
        apellidos: usuario.apellidos || "",
        run: usuario.run || "",
        correo: usuario.correo || "",
        fechaNacimiento: usuario.fechaNacimiento || "",
        direccion: usuario.direccion || "",
        region: usuario.region || "",
        comuna: usuario.comuna || "",
        password: usuario.password || "",
        rol: usuario.rol || "Cliente",
        estado: usuario.estado || "Activo"
    });
    const [errores, setErrores] = useState({});

    function actualizarCampo(evento) {
        const { name, value } = evento.target;
        setDatos({ ...datos, [name]: value });
        if (errores[name]) setErrores({ ...errores, [name]: undefined });
    }

    function generarPassword() {
        setDatos({ ...datos, password: Math.random().toString(36).slice(-6) });
    }

    function enviar(evento) {
        evento.preventDefault();

        const normalizado = {
            ...datos,
            run: limpiarRun(datos.run),
            correo: datos.correo.trim().toLowerCase(),
            nombre: datos.nombre.trim(),
            apellidos: datos.apellidos.trim(),
            direccion: datos.direccion.trim()
        };

        let nuevosErrores = validarUsuario(normalizado);
        if (Object.keys(nuevosErrores).length === 0 && validarDuplicados) {
            nuevosErrores = validarDuplicados(normalizado);
        }

        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length === 0) onGuardar(normalizado);
    }

    return (
        <form onSubmit={enviar} noValidate className="mb-4">
            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                <i className="bi bi-person-vcard me-1"></i> Datos Personales y de Cuenta
            </h6>

            <div className="row">
                <CampoFormulario id="nombre" etiqueta="Nombre" className="col-md-6 mb-3" maxLength={50}
                    valor={datos.nombre} onChange={actualizarCampo} error={errores.nombre} />
                <CampoFormulario id="apellidos" etiqueta="Apellidos" className="col-md-6 mb-3" maxLength={100}
                    valor={datos.apellidos} onChange={actualizarCampo} error={errores.apellidos} />

                <CampoFormulario id="run" etiqueta="RUN" className="col-md-6 mb-3" maxLength={9} placeholder="19011022K"
                    valor={datos.run} onChange={actualizarCampo} error={errores.run} ayuda="Sin puntos ni guion." />
                <CampoFormulario id="correo" etiqueta="Correo Electrónico" tipo="email" className="col-md-6 mb-3" maxLength={100}
                    valor={datos.correo} onChange={actualizarCampo} error={errores.correo} />

                <CampoFormulario id="fechaNacimiento" etiqueta="Fecha de Nacimiento" tipo="date" className="col-md-6 mb-3"
                    valor={datos.fechaNacimiento} onChange={actualizarCampo} />
                <CampoFormulario id="direccion" etiqueta="Dirección" className="col-md-6 mb-3" maxLength={300}
                    valor={datos.direccion} onChange={actualizarCampo} error={errores.direccion} />
            </div>

            <SelectorRegionComuna
                prefijoId="usr-"
                region={datos.region}
                comuna={datos.comuna}
                errores={errores}
                onChange={cambio => setDatos({ ...datos, ...cambio })}
            />

            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
                    <div className="input-group has-validation">
                        <input
                            type="text"
                            id="password"
                            name="password"
                            className={`form-control ${errores.password ? "is-invalid" : ""}`}
                            value={datos.password}
                            onChange={actualizarCampo}
                        />
                        <button className="btn btn-outline-secondary" type="button" title="Generar Clave Aleatoria" onClick={generarPassword}>
                            <i className="bi bi-key"></i>
                        </button>
                        {errores.password && <div className="invalid-feedback">{errores.password}</div>}
                    </div>
                </div>
                <div className="col-md-4">
                    <label htmlFor="rol" className="form-label fw-semibold">Tipo de Usuario</label>
                    <select id="rol" name="rol" className="form-select" value={datos.rol} onChange={actualizarCampo} disabled={esPropio}>
                        <option value="Cliente">Cliente</option>
                        <option value="Vendedor">Vendedor</option>
                        <option value="Administrador">Administrador</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label htmlFor="estado" className="form-label fw-semibold">Estado de la Cuenta</label>
                    <select id="estado" name="estado" className="form-select" value={datos.estado} onChange={actualizarCampo} disabled={esPropio}>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            </div>

            {esPropio && (
                <div className="form-text mb-3" data-testid="aviso-cuenta-propia">
                    <i className="bi bi-info-circle me-1"></i>
                    Es tu propia cuenta: no puedes cambiar tu tipo de usuario ni desactivarla.
                </div>
            )}

            <div className="text-end">
                <button type="submit" className="btn btn-primary fw-bold">
                    <i className={`bi ${esNuevo ? "bi-person-plus" : "bi-save"} me-1`}></i>
                    {esNuevo ? "Crear Usuario" : "Actualizar Usuario"}
                </button>
            </div>
        </form>
    );
}

export default FormularioUsuario;
