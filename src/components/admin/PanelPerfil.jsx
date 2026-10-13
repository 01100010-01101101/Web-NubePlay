import { useState } from "react";
import CampoFormulario from "../common/CampoFormulario";
import { actualizarUsuario } from "../../data/db";
import { validarPerfil } from "../../utils/validaciones";
import { useAuth } from "../../context/AuthContext";

const CLAVES_VACIAS = { passwordActual: "", passwordNueva: "", confirmarPassword: "" };

// Pestaña "Mi Perfil": el usuario conectado edita su nombre y su contraseña.
function PanelPerfil({ mostrar }) {
    const { usuario, esAdmin, refrescarSesion } = useAuth();
    const [datos, setDatos] = useState({ nombre: usuario.nombre || "", apellidos: usuario.apellidos || "", ...CLAVES_VACIAS });
    const [errores, setErrores] = useState({});

    function actualizarCampo(evento) {
        const { name, value } = evento.target;
        setDatos({ ...datos, [name]: value });
        if (errores[name]) setErrores({ ...errores, [name]: undefined });
    }

    function guardar(evento) {
        evento.preventDefault();
        const nuevosErrores = validarPerfil(datos, usuario.password);
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        const cambios = { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim() };
        if (datos.passwordNueva) cambios.password = datos.passwordNueva;

        actualizarUsuario(usuario.id, cambios);
        refrescarSesion();
        setDatos({ ...datos, ...CLAVES_VACIAS });
        mostrar(datos.passwordNueva ? "Perfil y contraseña actualizados." : "Perfil actualizado.");
    }

    return (
        <>
            <div className="card-header bg-white p-3">
                <h5 className="fw-bold mb-0">Mi Perfil</h5>
            </div>

            <div className="card-body p-4">
                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="text-center border rounded-4 p-4 h-100">
                            <i className="bi bi-person-circle display-3 text-primary"></i>
                            <h5 className="fw-bold mt-2 mb-0">{`${usuario.nombre} ${usuario.apellidos || ""}`.trim()}</h5>
                            <p className="text-muted small mb-2">{usuario.correo}</p>
                            <span className={`badge ${esAdmin ? "bg-danger" : "bg-warning text-dark"}`}>{usuario.rol}</span>
                            <hr />
                            <div className="small text-start text-secondary">
                                <div><strong>RUN:</strong> {usuario.run || "—"}</div>
                                <div><strong>Comuna:</strong> {usuario.comuna ? `${usuario.comuna}, ${usuario.region}` : "—"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <form onSubmit={guardar} noValidate>
                            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Datos personales</h6>
                            <div className="row">
                                <CampoFormulario id="perfilNombre" name="nombre" etiqueta="Nombre" className="col-md-6 mb-3" maxLength={50}
                                    valor={datos.nombre} onChange={actualizarCampo} error={errores.nombre} />
                                <CampoFormulario id="perfilApellidos" name="apellidos" etiqueta="Apellidos" className="col-md-6 mb-3" maxLength={100}
                                    valor={datos.apellidos} onChange={actualizarCampo} error={errores.apellidos} />
                            </div>

                            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 mt-2">Cambiar contraseña (opcional)</h6>
                            <div className="row">
                                <CampoFormulario id="perfilPasswordActual" name="passwordActual" etiqueta="Contraseña actual" tipo="password"
                                    className="col-md-4 mb-3" autoComplete="current-password"
                                    valor={datos.passwordActual} onChange={actualizarCampo} error={errores.passwordActual} />
                                <CampoFormulario id="perfilPasswordNueva" name="passwordNueva" etiqueta="Nueva contraseña" tipo="password"
                                    className="col-md-4 mb-3" maxLength={10} autoComplete="new-password"
                                    valor={datos.passwordNueva} onChange={actualizarCampo} error={errores.passwordNueva} />
                                <CampoFormulario id="perfilConfirmar" name="confirmarPassword" etiqueta="Confirmar contraseña" tipo="password"
                                    className="col-md-4 mb-3" maxLength={10} autoComplete="new-password"
                                    valor={datos.confirmarPassword} onChange={actualizarCampo} error={errores.confirmarPassword} />
                            </div>

                            <div className="text-end">
                                <button type="submit" className="btn btn-primary fw-bold">
                                    <i className="bi bi-save me-1"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PanelPerfil;
