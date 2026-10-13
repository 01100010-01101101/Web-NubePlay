import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import MenuUsuario from "./MenuUsuario";




const ENLACES_TIENDA = [
    { ruta: "/", texto: "Inicio", icono: "bi-house", exacto: true },
    { ruta: "/productos", texto: "Productos", icono: "bi-controller" },
    { ruta: "/categorias", texto: "Categorías", icono: "bi-grid" },
    { ruta: "/blogs", texto: "Noticias", icono: "bi-newspaper" },
    { ruta: "/nosotros", texto: "Nosotros", icono: "bi-people" },
    { ruta: "/contacto", texto: "Contacto", icono: "bi-envelope" }
];




const ENLACES_VENDEDOR = [
    { ruta: "/productos", texto: "Productos", icono: "bi-controller" },
    { ruta: "/admin?tab=ordenes", texto: "Órdenes", icono: "bi-receipt" }
];




function Navbar({ fija = false }) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const { usuario, esAdmin, esVendedor, cerrarSesion } = useAuth();
    const { totalUnidades } = useCart();
    const navigate = useNavigate();




    const enlaces = esVendedor ? ENLACES_VENDEDOR : ENLACES_TIENDA;
    const cerrarMenu = () => setMenuAbierto(false);




    function manejarCerrarSesion() {
        cerrarSesion();
        cerrarMenu();
        navigate("/login");
    }




    return (
        <nav className={`navbar navbar-expand-xl navbar-dark navbar-nubeplay ${fija ? "fixed-top" : ""}`}>
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/" onClick={cerrarMenu}>
                    <i className="bi bi-cloud-fill"></i> NUBEPLAY
                </Link>




                <button
                    className="navbar-toggler"
                    type="button"
                    aria-label="Abrir menú"
                    aria-expanded={menuAbierto}
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>




                <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""}`}>
                    <ul className="navbar-nav ms-auto align-items-xl-center">
                        {enlaces.map(enlace => (
                            <li className="nav-item" key={enlace.ruta}>
                                <NavLink className="nav-link" to={enlace.ruta} end={enlace.exacto} onClick={cerrarMenu}>
                                    <i className={`bi ${enlace.icono} me-1`}></i> {enlace.texto}
                                </NavLink>
                            </li>
                        ))}




                        {!esVendedor && (
                            <li className="nav-item ms-xl-2">
                                <NavLink className="nav-link carrito-nav" to="/carrito" onClick={cerrarMenu}>
                                    <i className="bi bi-cart3 me-1"></i> Carrito
                                    <span className="badge bg-primary ms-1" data-testid="contador-carrito">
                                        {totalUnidades}
                                    </span>
                                </NavLink>
                            </li>
                        )}




                        <li className="nav-item ms-xl-2 mt-2 mt-xl-0">
                            {usuario ? (
                                <MenuUsuario
                                    usuario={usuario}
                                    esAdmin={esAdmin}
                                    onCerrarSesion={manejarCerrarSesion}
                                    onNavegar={cerrarMenu}
                                />
                            ) : (
                                <Link className="btn btn-outline-light btn-sm" to="/login" onClick={cerrarMenu}>
                                    <i className="bi bi-person me-1"></i> Iniciar sesión
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;



