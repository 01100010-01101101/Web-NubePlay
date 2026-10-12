import Estrellas from "./Estrellas";

function ListaResenas({ resenas }) {
    if (resenas.length === 0) {
        return (
            <div className="text-center py-3 text-muted">
                <i className="bi bi-chat-square-text fs-3 d-block mb-2"></i>
                <p className="mb-0">Este producto aún no tiene reseñas.</p>
                <small>Sé el primero en compartir tu opinión.</small>
            </div>
        );
    }

    return (
        <div>
            {[...resenas].reverse().map(resena => (
                <div className="border-bottom py-3" key={resena.id}>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <h6 className="fw-bold mb-1">{resena.nombre}</h6>
                            <div className="small mb-2"><Estrellas puntuacion={Number(resena.puntuacion)} /></div>
                        </div>
                        <small className="text-muted">{resena.fecha}</small>
                    </div>
                    <p className="mb-0 text-secondary">{resena.comentario}</p>
                </div>
            ))}
        </div>
    );
}

export default ListaResenas;