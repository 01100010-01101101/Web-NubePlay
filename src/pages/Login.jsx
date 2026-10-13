import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alerta from "../components/common/Alerta";
import { useAuth } from "../context/AuthContext";
import { esRolAdmin, esRolVendedor } from "../utils/formato";
import { validarCorreo, validarPassword } from "../utils/validaciones";


const CLAVE_RECORDAR = "recordar_correo";


function Login() {
    const { iniciarSesion } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const correoRecordado = localStorage.getItem(CLAVE_RECORDAR) || "";
    const [correo, setCorreo] = useState(correoRecordado);
    const [password, setPassword] = useState("");
    const [recordarme, setRecordarme] = useState(Boolean(correoRecordado));
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState(
        location.state?.mensaje ? { texto: location.state.mensaje, tipo: "warning" } : null
    );


    function enviar(evento) {
        evento.preventDefault();


        const nuevosErrores = {
            correo: !validarCorreo(correo),
            password: !validarPassword(password.trim())
        };
        setErrores(nuevosErrores);


        if (nuevosErrores.correo || nuevosErrores.password) {
            setMensaje({ texto: "Por favor, corrige los errores en los campos antes de continuar.", tipo: "danger" });
            return;
        }


        const resultado = iniciarSesion(correo, password);
        if (!resultado.ok) {
            setMensaje({ texto: resultado.mensaje, tipo: resultado.tipo });
            return;
        }


        if (recordarme) {
            localStorage.setItem(CLAVE_RECORDAR, correo.trim());
        } else {
            localStorage.removeItem(CLAVE_RECORDAR);
        }


        setMensaje({ texto: `¡Bienvenido/a ${resultado.usuario.nombre}! Redirigiendo...`, tipo: "success" });


        // Si se llegó al login desde otra página (ej: el checkout), se vuelve a ella.
        const destino = location.state?.desde ||
            (esRolAdmin(resultado.usuario) || esRolVendedor(resultado.usuario) ? "/admin" : "/productos");
        setTimeout(() => navigate(destino), 1200);
    }


    function claseCampo(campo) {
        if (errores[campo] === undefined) return "form-control";
        return `form-control ${errores[campo] ? "is-invalid" : "is-valid"}`;
    }


    return (
        <main className="login-contenido bg-light flex-grow-1">
            <div className="container">
                <div className="row justify-content-center align-items-center">
                    <div className="col-md-7 col-lg-5">
                        <div className="auth-card card shadow-lg border-0 rounded-4 p-4 mx-auto">
                            <div className="login-logo text-center mb-3">
                                <div className="logo-placeholder"><i className="bi bi-cloud-fill"></i></div>
                            </div>


                            <h1 className="text-center h3 fw-bold">Iniciar sesión</h1>
                            <p className="auth-subtitle text-center text-muted mb-4">Ingresa a tu cuenta NUBEPLAY</p>


                            <Alerta mensaje={mensaje?.texto} tipo={mensaje?.tipo} />


                            <form onSubmit={enviar} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">Correo electrónico</label>
                                    <div className="input-group has-validation">
                                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                        <input
                                            type="email"
                                            id="email"
                                            className={claseCampo("correo")}
                                            placeholder="correo@duoc.cl"
                                            value={correo}
                                            onChange={evento => { setCorreo(evento.target.value); setMensaje(null); }}
                                        />
                                        <div className="invalid-feedback">
                                            Debe ser un correo válido (@duoc.cl, @profesor.duoc.cl o @gmail.com) y máx. 100 caracteres.
                                        </div>
                                    </div>
                                </div>


                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
                                    <div className="input-group has-validation">
                                        <span className="input-group-text"><i className="bi bi-lock"></i></span>
                                        <input
                                            type="password"
                                            id="password"
                                            className={claseCampo("password")}
                                            placeholder="Ingresa tu contraseña"
                                            value={password}
                                            onChange={evento => { setPassword(evento.target.value); setMensaje(null); }}
                                        />
                                        <div className="invalid-feedback">La contraseña debe tener entre 4 y 10 caracteres.</div>
                                    </div>
                                </div>


                                <div className="login-opciones d-flex justify-content-between align-items-center mb-3">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="recordarme"
                                            checked={recordarme}
                                            onChange={evento => setRecordarme(evento.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="recordarme">Recordarme</label>
                                    </div>
                                </div>


                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold login-boton">
                                    <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar sesión
                                </button>
                            </form>


                            <div className="auth-footer text-center mt-4 pt-3 border-top">
                                <p className="mb-2">¿No tienes una cuenta?</p>
                                <Link to="/registro" className="btn btn-outline-primary w-100">Crear cuenta</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}


export default Login;

