import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";


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
        <nav className={`navbar navbar-expand-lg navbar-dark navbar-nubeplay ${fija ? "fixed-top" : ""}`}>
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
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        {enlaces.map(enlace => (
                            <li className="nav-item" key={enlace.ruta}>
                                <NavLink className="nav-link" to={enlace.ruta} end={enlace.exacto} onClick={cerrarMenu}>
                                    <i className={`bi ${enlace.icono} me-1`}></i> {enlace.texto}
                                </NavLink>
                            </li>
                        ))}


                        {!esVendedor && (
                            <li className="nav-item ms-lg-2">
                                <NavLink className="nav-link carrito-nav" to="/carrito" onClick={cerrarMenu}>
                                    <i className="bi bi-cart3 me-1"></i> Carrito
                                    <span className="badge bg-primary ms-1" data-testid="contador-carrito">
                                        {totalUnidades}
                                    </span>
                                </NavLink>
                            </li>
                        )}


                        {esAdmin && (
                            <li className="nav-item ms-lg-2">
                                <NavLink className="nav-link" to="/admin" onClick={cerrarMenu}>
                                    <i className="bi bi-speedometer2 me-1"></i> Panel Admin
                                </NavLink>
                            </li>
                        )}


                        <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                            {usuario ? (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="navbar-text text-white small">
                                        <i className="bi bi-person-circle me-1"></i>
                                        {usuario.nombre || "Usuario"}
                                    </span>
                                    <button type="button" className="btn btn-outline-light btn-sm" onClick={manejarCerrarSesion}>
                                        <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
                                    </button>
                                </div>
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

