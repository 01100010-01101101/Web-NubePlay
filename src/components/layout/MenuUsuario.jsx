import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";


function MenuUsuario({ usuario, esAdmin, onCerrarSesion, onNavegar }) {
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef(null);


    useEffect(() => {
        function clicFuera(evento) {
            if (contenedor.current && !contenedor.current.contains(evento.target)) setAbierto(false);
        }
        document.addEventListener("click", clicFuera);
        return () => document.removeEventListener("click", clicFuera);
    }, []);


    function elegir(accion) {
        setAbierto(false);
        accion?.();
    }


    return (
        <div className="dropdown" ref={contenedor}>
            <button
                type="button"
                className="btn btn-outline-light btn-sm dropdown-toggle"
                aria-expanded={abierto}
                onClick={() => setAbierto(!abierto)}
            >
                <i className="bi bi-person-circle me-1"></i> {usuario.nombre || "Usuario"}
            </button>


            <ul className={`dropdown-menu dropdown-menu-end ${abierto ? "show" : ""}`}>
                <li><span className="dropdown-item-text small text-muted">{usuario.correo}</span></li>
                <li><hr className="dropdown-divider" /></li>
                {esAdmin && (
                    <li>
                        <Link className="dropdown-item" to="/admin" onClick={() => elegir(onNavegar)}>
                            <i className="bi bi-speedometer2 me-2"></i> Panel Admin
                        </Link>
                    </li>
                )}
                <li>
                    <button type="button" className="dropdown-item text-danger" onClick={() => elegir(onCerrarSesion)}>
                        <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
                    </button>
                </li>
            </ul>
        </div>
    );
}


export default MenuUsuario;

