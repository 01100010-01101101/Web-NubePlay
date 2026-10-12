import { useState } from "react";
import CampoFormulario from "../components/common/CampoFormulario";
import Alerta from "../components/common/Alerta";
import { validarCorreo, validarTexto } from "../utils/validaciones";

const FORMULARIO_VACIO = { nombre: "", correo: "", comentario: "" };

export function validarContacto(datos) {
    const errores = {};
    if (!validarTexto(datos.nombre, 100)) {
        errores.nombre = "El nombre es requerido (máximo 100 caracteres).";
    }
    if (datos.correo.trim() !== "" && !validarCorreo(datos.correo)) {
        errores.correo = "Si ingresas un correo, debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100 caracteres).";
    }
    if (!validarTexto(datos.comentario, 500)) {
        errores.comentario = "El mensaje es requerido (máximo 500 caracteres).";
    }
    return errores;
}

function Contacto() {
    const [datos, setDatos] = useState(FORMULARIO_VACIO);
    const [enviado, setEnviado] = useState(false);
    const [exito, setExito] = useState(false);

    const errores = enviado ? validarContacto(datos) : {};

    function actualizarCampo(evento) {
        setDatos({ ...datos, [evento.target.name]: evento.target.value });
        setExito(false);
    }

    function enviar(evento) {
        evento.preventDefault();
        setEnviado(true);
        if (Object.keys(validarContacto(datos)).length > 0) return;

        setDatos(FORMULARIO_VACIO);
        setEnviado(false);
        setExito(true);
    }

    return (
        <main className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="text-center mb-4">
                        <i className="bi bi-cloud-fill text-primary display-3"></i>
                        <h2 className="fw-bold mt-2">NUBEPLAY</h2>
                        <p className="text-muted">¿Tienes alguna duda o sugerencia? Escríbenos.</p>
                    </div>

                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-primary text-white text-center py-3 rounded-top-4">
                            <h4 className="mb-0 fw-bold"><i className="bi bi-envelope-paper-fill me-2"></i>Formulario de Contacto</h4>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <Alerta
                                mensaje={exito ? "¡Mensaje enviado con éxito! Gracias por contactarte con NUBEPLAY." : null}
                                onCerrar={() => setExito(false)}
                            />

                            <form onSubmit={enviar} noValidate>
                                <CampoFormulario id="nombre" etiqueta="Nombre Completo *" maxLength={100} placeholder="Ingresa tu nombre completo"
                                    valor={datos.nombre} onChange={actualizarCampo} error={errores.nombre} />

                                <CampoFormulario id="correo" etiqueta="Correo Electrónico (Opcional)" tipo="email" maxLength={100} placeholder="ejemplo@duoc.cl"
                                    valor={datos.correo} onChange={actualizarCampo} error={errores.correo} />

                                <CampoFormulario id="comentario" etiqueta="Comentario / Mensaje *" multilinea rows="4" maxLength={500} className="mb-4"
                                    placeholder="Escribe tu mensaje aquí..."
                                    valor={datos.comentario} onChange={actualizarCampo} error={errores.comentario}
                                    ayuda={`${datos.comentario.length}/500 caracteres`} />

                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                                    <i className="bi bi-send-fill me-1"></i> Enviar Mensaje
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Contacto;