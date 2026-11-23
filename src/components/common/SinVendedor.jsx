import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


// Rutas de compra (carrito y pago): abiertas para visitantes, clientes y administradores,
// pero no para el Vendedor, que solo puede ver productos y órdenes.
function SinVendedor({ children }) {
    const { esVendedor } = useAuth();
    if (esVendedor) {
        return <Navigate to="/admin?tab=ordenes" replace />;
    }
    return children;
}


export default SinVendedor;



