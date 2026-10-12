function Estrellas({ puntuacion }) {
    return (
        <span className="text-warning" aria-label={`${puntuacion} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map(numero => (
                <i key={numero} className={`bi ${numero <= puntuacion ? "bi-star-fill" : "bi-star"}`}></i>
            ))}
        </span>
    );
}

export default Estrellas;
