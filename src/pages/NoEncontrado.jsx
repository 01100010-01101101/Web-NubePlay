import { Link } from "react-router-dom";
import EstadoVacio from "../components/common/EstadoVacio";

function NoEncontrado() {
    return (
        <main className="container my-5">
            <EstadoVacio icono="bi-signpost-split" titulo="Página no encontrada" descripcion="La dirección que buscas no existe.">
                <Link to="/" className="btn btn-primary mt-2">Volver al inicio</Link>
            </EstadoVacio>
        </main>
    );
}

export default NoEncontrado;
