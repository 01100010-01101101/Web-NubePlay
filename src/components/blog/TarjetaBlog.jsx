import { Link } from "react-router-dom";
function TarjetaBlog({ blog }) {
    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
            <img src={blog.imagen} className="card-img-top" alt={blog.titulo} style={{ height: "240px", objectFit: "cover" }} />
            <div className="card-body p-4 d-flex flex-column">
                <div className="mb-2">
                    <span className={`badge ${blog.colorCategoria}`}>{blog.categoria}</span>
                </div>
                <h4 className="card-title fw-bold text-dark mb-3">{blog.titulo}</h4>
                <p className="card-text text-secondary flex-grow-1">{blog.resumen}</p>
                <div className="pt-3 border-top mt-3">
                    <Link to={`/blogs/${blog.id}`} className="btn btn-outline-primary w-100 fw-bold">
                        Leer noticia completa
                    </Link>
                </div>
            </div>
        </div>
    );
}
export default TarjetaBlog;