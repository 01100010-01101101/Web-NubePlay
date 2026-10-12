import EncabezadoPagina from "../components/common/EncabezadoPagina";

const EQUIPO = [
    { nombre: "Sebastian Garcia", cargo: "Desarrollador fullstack", descripcion: "dueño de la tienda" },
    { nombre: "Marcos Alvial", cargo: "Desarrollador fullstack", descripcion: "dueño de la tienda" }
];

function TarjetaIntegrante({ integrante }) {
    return (
        <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
            <div className="card-body">
                <div className="mb-3"><i className="bi bi-person-circle display-2 text-primary"></i></div>
                <h5 className="card-title fw-bold">{integrante.nombre}</h5>
                <p className="text-muted">{integrante.cargo}</p>
                <p className="card-text text-secondary small">{integrante.descripcion}</p>
            </div>
        </div>
    );
}

function Nosotros() {
    return (
        <>
            <EncabezadoPagina
                titulo="Sobre NUBEPLAY"
                subtitulo="Tu plataforma de confianza para los mejores videojuegos y productos digitales."
            />

            <main className="container my-4">
                <section className="row align-items-center mb-5">
                    <div className="col-md-6 mb-4 mb-md-0">
                        <h2 className="fw-bold text-primary mb-3">¿Quiénes Somos?</h2>
                        <p className="text-secondary">
                            NUBEPLAY nació como una solución innovadora para conectar a los apasionados de los videojuegos
                            con los mejores títulos y accesorios del mercado. Nuestra misión es brindar una experiencia de
                            compra rápida, segura y accesible para todos los gamers.
                        </p>
                        <p className="text-secondary">
                            Nos caracterizamos por la calidad en el servicio, atención directa y una constante actualización
                            de nuestro catálogo digital.
                        </p>
                    </div>
                    <div className="col-md-6 text-center">
                        <div className="p-5 bg-light rounded-4 border shadow-sm">
                            <i className="bi bi-controller display-1 text-primary"></i>
                            <h4 className="fw-bold mt-3">Pasión por el Gaming</h4>
                        </div>
                    </div>
                </section>

                <hr className="my-5" />

                <section className="mb-5">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-primary">Equipo de Desarrollo</h2>
                        <p className="text-muted">Conoce a las mentes detrás del proyecto NUBEPLAY</p>
                    </div>

                    <div className="row g-4 justify-content-center">
                        {EQUIPO.map(integrante => (
                            <div className="col-md-6 col-lg-4" key={integrante.nombre}>
                                <TarjetaIntegrante integrante={integrante} />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}

export default Nosotros;
