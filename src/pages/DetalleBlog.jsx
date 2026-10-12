import { Link, useParams } from "react-router-dom";
import EstadoVacio from "../components/common/EstadoVacio";
import { blogs } from "../data/blogs";

function DetalleBlog() {
    const { id } = useParams();
    const blog = blogs.find(item => String(item.id) === id);

    if (!blog) {
        return (
            <main className="container my-5">
                <EstadoVacio icono="bi-exclamation-triangle" titulo="Noticia no encontrada">
                    <Link to="/blogs" className="btn btn-primary mt-2">Volver a Noticias</Link>
                </EstadoVacio>
            </main>
        );
    }

    return (
        <main className="container my-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
                    <li className="breadcrumb-item"><Link to="/blogs">Noticias</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{blog.tituloDetalle}</li>
                </ol>
            </nav>

            <article className="card border-0 shadow-sm rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "860px" }}>
                <img src={blog.imagen} className="w-100" style={{ maxHeight: "360px", objectFit: "cover" }} alt={blog.titulo} />
                <div className="card-body p-4 p-md-5">
                    <span className={`badge ${blog.colorCategoria} mb-3`}>{blog.categoria}</span>
                    <h1 className="h2 fw-bold mb-3"><i className={`bi ${blog.icono} me-2`}></i>{blog.tituloDetalle}</h1>
                    <p className="lead">{blog.introduccion}</p>
                    {blog.parrafos.map(parrafo => <p key={parrafo.slice(0, 30)}>{parrafo}</p>)}

                    <p className="fw-bold mb-2">{blog.tituloPuntos}</p>
                    <ul>
                        {blog.puntos.map(punto => (
                            <li key={punto.titulo}><strong>{punto.titulo}:</strong> {punto.texto}</li>
                        ))}
                    </ul>

                    <Link to="/blogs" className="btn btn-outline-primary mt-3">
                        <i className="bi bi-arrow-left me-1"></i> Volver a Noticias
                    </Link>
                </div>
            </article>
        </main>
    );
}

export default DetalleBlog;