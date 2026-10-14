import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IMAGEN_POR_DEFECTO, usarImagenPorDefecto } from "../../utils/formato";

// Carrusel con las clases de Bootstrap, controlado por React
// Avanza solo cada `intervalo` ms y se pausa mientras el mouse está encima.
function Carrusel({ diapositivas, intervalo = 5000 }) {
    const [indice, setIndice] = useState(0);
    const [pausado, setPausado] = useState(false);
    const total = diapositivas.length;

    const irA = nuevo => setIndice((nuevo + total) % total);
    const siguiente = () => setIndice(actual => (actual + 1) % total);
    const anterior = () => setIndice(actual => (actual - 1 + total) % total);

    // Al cambiar de diapositiva (o al pausar/reanudar) se reinicia el temporizador.
    useEffect(() => {
        if (pausado || total < 2 || !intervalo) return undefined;
        const temporizador = setTimeout(siguiente, intervalo);
        return () => clearTimeout(temporizador);
    }, [indice, pausado, total, intervalo]);

    if (total === 0) return null;

    return (
        <div
            className="carousel slide carrusel-nubeplay"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Promociones destacadas"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
        >
            {total > 1 && (
                <div className="carousel-indicators">
                    {diapositivas.map((diapositiva, i) => (
                        <button
                            key={diapositiva.id}
                            type="button"
                            className={i === indice ? "active" : ""}
                            aria-current={i === indice ? "true" : undefined}
                            aria-label={`Ir a la diapositiva ${i + 1}`}
                            onClick={() => irA(i)}
                        ></button>
                    ))}
                </div>
            )}

            <div className="carousel-inner">
                {diapositivas.map((diapositiva, i) => (
                    <div
                        key={diapositiva.id}
                        className={`carousel-item ${i === indice ? "active" : ""}`}
                        aria-hidden={i !== indice}
                    >
                        <img
                            src={diapositiva.imagen || IMAGEN_POR_DEFECTO}
                            className="d-block w-100"
                            alt={diapositiva.titulo}
                            onError={usarImagenPorDefecto}
                        />
                        <div className="carousel-caption">
                            <h2 className="fw-bold">{diapositiva.titulo}</h2>
                            {diapositiva.texto && <p className="d-none d-sm-block">{diapositiva.texto}</p>}
                            {diapositiva.enlace && (
                                <Link to={diapositiva.enlace} className="btn btn-primary fw-bold" tabIndex={i === indice ? 0 : -1}>
                                    {diapositiva.boton || "Ver más"}
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {total > 1 && (
                <>
                    <button className="carousel-control-prev" type="button" onClick={anterior}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Anterior</span>
                    </button>
                    <button className="carousel-control-next" type="button" onClick={siguiente}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Siguiente</span>
                    </button>
                </>
            )}
        </div>
    );
}

export default Carrusel;
