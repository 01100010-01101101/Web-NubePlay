import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// permisos
function RutaProtegida({ children }) {
    const { usuario, esAdmin, esVendedor } = useAuth();

    if (!usuario || (!esAdmin && !esVendedor)) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ mensaje: "Acceso denegado. Debes iniciar sesión con un perfil autorizado." }}
            />
        );
    }

    return children;
}
export default RutaProtegida;