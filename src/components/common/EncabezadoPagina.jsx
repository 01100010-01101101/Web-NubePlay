function EncabezadoPagina({ titulo, subtitulo, icono }) {
    return (
        <header className="bg-primary text-white py-5 text-center mb-4">
            <div className="container">
                <h1 className="fw-bold display-5">
                    {icono && <i className={`bi ${icono} me-2`}></i>}
                    {titulo}
                </h1>
                {subtitulo && <p className="lead mb-0">{subtitulo}</p>}
            </div>
        </header>
    );
}
export default EncabezadoPagina;