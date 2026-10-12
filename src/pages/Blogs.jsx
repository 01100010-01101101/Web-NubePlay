import EncabezadoPagina from "../components/common/EncabezadoPagina";
import TarjetaBlog from "../components/blog/TarjetaBlog";
import { blogs } from "../data/blogs";

function Blogs() {
    return (
        <>
            <EncabezadoPagina
                icono="bi-newspaper"
                titulo="Noticias Gaming & Tech"
                subtitulo="Entérate de las últimas novedades del mundo de los videojuegos y la tecnología."
            />

            <main className="container my-4">
                <div className="row g-4 justify-content-center">
                    {blogs.map(blog => (
                        <div className="col-md-6" key={blog.id}>
                            <TarjetaBlog blog={blog} />
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}

export default Blogs;