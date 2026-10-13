import { Link } from "react-router-dom";


function TarjetaCategoria({ categoria, cantidad, activa = false }) {
    return (
        <Link
            to={`/categorias/${categoria.valor}`}
            className={`card h-100 text-center border-0 shadow-sm rounded-4 p-3 text-decoration-none ${activa ? "bg-primary text-white" : "text-dark"}`}
            aria-current={activa ? "page" : undefined}
        >
            <i className={`bi ${categoria.icono} display-5 ${activa ? "" : "text-primary"}`}></i>
            <h5 className="fw-bold mt-2 mb-1">{categoria.nombre}</h5>
            <small className={activa ? "text-white-50" : "text-muted"}>{cantidad} producto(s)</small>
        </Link>
    );
}


export default TarjetaCategoria;



