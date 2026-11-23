import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampoFormulario from "../components/common/CampoFormulario";
import SelectorRegionComuna from "../components/common/SelectorRegionComuna";
import Alerta from "../components/common/Alerta";
import BotonGoogle from "../components/common/BotonGoogle";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/servicios";
import { limpiarRun, validarUsuario } from "../utils/validaciones";

const FORMULARIO_VACIO = {
    run: "",
    nombre: "",
    apellidos: "",
    correo: "",
    password: "",
    confirmPassword: "",
    fechaNacimiento: "",
    region: "",
    comuna: "",
    direccion: ""
};

function Registro() {
    const [datos, setDatos] = useState(FORMULARIO_VACIO);
    const [enviado, setEnviado] = useState(false);
    const [erroresExtra, setErroresExtra] = useState({});
    const [errorGeneral, setErrorGeneral] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    const errores = enviado ? { ...validarUsuario(datos, { confirmarPassword: true }), ...erroresExtra } : {};

    function actualizarCampo(evento) {
        setDatos({ ...datos, [evento.target.name]: evento.target.value });
        setErroresExtra({});
    }

    const { iniciarSesionConGoogle } = useAuth();

    // Registro con Google: si el correo no existe se crea un Cliente; si ya existe, se vincula la cuenta.
    async function registrarConGoogle(credential) {
        setErrorGeneral(null);
        setEnviando(true);
        const resultado = await iniciarSesionConGoogle(credential);
        setEnviando(false);
        if (!resultado.ok) {
            setErrorGeneral(resultado.mensaje);
            return;
        }
        navigate("/productos");
    }

    async function enviar(evento) {
        evento.preventDefault();
        setEnviado(true);
        setErrorGeneral(null);

        if (Object.keys(validarUsuario(datos, { confirmarPassword: true })).length > 0) return;

        // POST /api/v1/auth/registro: el backend valida de nuevo y revisa correo/RUN duplicados (409).
        setEnviando(true);
        try {
            await authApi.registrar({
                run: limpiarRun(datos.run),
                nombre: datos.nombre.trim(),
                apellidos: datos.apellidos.trim(),
                correo: datos.correo.trim().toLowerCase(),
                password: datos.password.trim(),
                fechaNacimiento: datos.fechaNacimiento || null,
                region: datos.region,
                comuna: datos.comuna,
                direccion: datos.direccion.trim()
            });
            navigate("/login", { state: { mensaje: "¡Registro completado con éxito! Ya puedes iniciar sesión." } });
        } catch (error) {
            if (error.campo) {
                setErroresExtra({ [error.campo]: error.message });
            } else {
                setErrorGeneral(error.message);
            }
        } finally {
            setEnviando(false);
        }
    }

    const valido = campo => enviado && !errores[campo];

    return (
        <main className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-7">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h3 className="fw-bold text-primary"><i className="bi bi-person-plus-fill"></i> Registro de Usuario</h3>
                                <p className="text-muted">Crea tu cuenta para comprar en NUBEPLAY</p>
                            </div>

                            <Alerta mensaje={errorGeneral} tipo="danger" onCerrar={() => setErrorGeneral(null)} />

                            <BotonGoogle texto="signup_with" onCredencial={registrarConGoogle} deshabilitado={enviando}
                                separador="abajo" textoSeparador="o completa el formulario" />

                            <form onSubmit={enviar} noValidate>
                                <CampoFormulario id="run" etiqueta="RUN (Sin puntos ni guión)" maxLength={9} placeholder="Ej: 19011022K"
                                    valor={datos.run} onChange={actualizarCampo} error={errores.run} valido={valido("run")} />

                                <div className="row">
                                    <CampoFormulario id="nombre" etiqueta="Nombre" className="col-md-6 mb-3" maxLength={50} placeholder="Tu nombre"
                                        valor={datos.nombre} onChange={actualizarCampo} error={errores.nombre} valido={valido("nombre")} />
                                    <CampoFormulario id="apellidos" etiqueta="Apellidos" className="col-md-6 mb-3" maxLength={100} placeholder="Tus apellidos"
                                        valor={datos.apellidos} onChange={actualizarCampo} error={errores.apellidos} valido={valido("apellidos")} />
                                </div>

                                <CampoFormulario id="correo" etiqueta="Correo Electrónico" tipo="email" maxLength={100} placeholder="ejemplo@duoc.cl"
                                    valor={datos.correo} onChange={actualizarCampo} error={errores.correo} valido={valido("correo")} />

                                <div className="row">
                                    <CampoFormulario id="password" etiqueta="Contraseña" tipo="password" className="col-md-6 mb-3" maxLength={10} placeholder="4 a 10 caracteres"
                                        valor={datos.password} onChange={actualizarCampo} error={errores.password} valido={valido("password")} />
                                    <CampoFormulario id="confirmPassword" etiqueta="Confirmar Contraseña" tipo="password" className="col-md-6 mb-3"
                                        valor={datos.confirmPassword} onChange={actualizarCampo} error={errores.confirmPassword} valido={valido("confirmPassword")} />
                                </div>

                                <CampoFormulario id="fechaNacimiento" etiqueta="Fecha de Nacimiento (Opcional)" tipo="date"
                                    valor={datos.fechaNacimiento} onChange={actualizarCampo} />

                                <SelectorRegionComuna
                                    region={datos.region}
                                    comuna={datos.comuna}
                                    errores={errores}
                                    onChange={cambio => setDatos({ ...datos, ...cambio })}
                                />

                                <CampoFormulario id="direccion" etiqueta="Dirección" multilinea rows="2" maxLength={300} className="mb-4"
                                    placeholder="Av. Siempre Viva 123"
                                    valor={datos.direccion} onChange={actualizarCampo} error={errores.direccion} valido={valido("direccion")} />

                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={enviando}>
                                    <i className="bi bi-check-circle-fill me-1"></i> Registrarse
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="mb-0">¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Registro;
