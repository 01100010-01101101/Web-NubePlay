import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { rolesDe } from "../../utils/formato";


// Protege una ruta según el rol del usuario conectado.
//   roles: lista de roles permitidos ("admin", "vendedor", "cliente").
//   Sin sesión          -> redirige al login (y luego vuelve a la ruta pedida).
//   Rol no permitido    -> redirige a `redirigirA` con un mensaje.
// Mientras se valida la sesión guardada (recarga de página) muestra un indicador,
// para no expulsar al usuario antes de saber quién es.
function RutaProtegida({ children, roles = ["admin", "vendedor"], redirigirA = "/" }) {
    const { usuario, verificando } = useAuth();
    const location = useLocation();


    if (verificando) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5" data-testid="verificando-sesion">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }


    if (!usuario) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ mensaje: "Acceso denegado. Debes iniciar sesión con un perfil autorizado.", desde: location.pathname + location.search }}
            />
        );
    }


    if (!roles.includes(rolesDe(usuario))) {
        return <Navigate to={redirigirA} replace state={{ mensaje: "No tienes permisos para acceder a esa sección." }} />;
    }


    return children;
}


export default RutaProtegida;



