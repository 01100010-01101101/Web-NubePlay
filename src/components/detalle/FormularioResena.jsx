import { useState } from "react";

const RESENA_VACIA = { nombre: "", puntuacion: "5", comentario: "" };

function FormularioResena({ onPublicar }) {
    const [datos, setDatos] = useState(RESENA_VACIA);
    const [error, setError] = useState("");

    function actualizarCampo(evento) {
        setDatos({ ...datos, [evento.target.name]: evento.target.value });
        setError("");
    }

    function enviar(evento) {
        evento.preventDefault();

        const nombre = datos.nombre.trim();
        const comentario = datos.comentario.trim();
        const puntuacion = Number(datos.puntuacion);

        if (!nombre || !comentario || puntuacion < 1 || puntuacion > 5) {
            setError("Completa todos los campos de la reseña.");
            return;
        }

        onPublicar({ nombre, comentario, puntuacion });
        setDatos(RESENA_VACIA);
    }

    return (
        <div className="bg-light p-3 rounded-3 border">
            <h6 className="fw-bold mb-3">Deja tu Opinión</h6>
            <form onSubmit={enviar} noValidate>
                <div className="row g-3 mb-2">
                    <div className="col-md-6">
                        <input
                            type="text"
                            name="nombre"
                            className="form-control form-control-sm"
                            placeholder="Tu Nombre"
                            aria-label="Tu nombre"
                            value={datos.nombre}
                            onChange={actualizarCampo}
                        />
                    </div>
                    <div className="col-md-6">
                        <select
                            name="puntuacion"
                            className="form-select form-select-sm"
                            aria-label="Puntuación"
                            value={datos.puntuacion}
                            onChange={actualizarCampo}
                        >
                            <option value="5">★★★★★ (5/5)</option>
                            <option value="4">★★★★☆ (4/5)</option>
                            <option value="3">★★★☆☆ (3/5)</option>
                            <option value="2">★★☆☆☆ (2/5)</option>
                            <option value="1">★☆☆☆☆ (1/5)</option>
                        </select>
                    </div>
                </div>
                <div className="mb-2">
                    <textarea
                        name="comentario"
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Escribe tu opinión sobre el producto..."
                        aria-label="Comentario"
                        value={datos.comentario}
                        onChange={actualizarCampo}
                    ></textarea>
                </div>
                {error && <div className="text-danger small mb-2">{error}</div>}
                <button type="submit" className="btn btn-primary btn-sm fw-bold">Publicar Reseña</button>
            </form>
        </div>
    );
}

export default FormularioResena;