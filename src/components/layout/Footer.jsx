import { Link } from "react-router-dom";
function Footer({ completo = false }) {
    if (!completo) {
        return (
            <footer className="footer-nubeplay py-4 text-center mt-auto">
                <div className="container">
                    <p className="mb-0">© 2026 NUBEPLAY. Todos los derechos reservados.</p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="footer-nubeplay mt-auto">
            <div className="container">
                <div className="row g-4">
                    <div className="col-md-4">
                        <h4><i className="bi bi-cloud-fill"></i> NUBEPLAY</h4>
                        <p>Tu tienda de tecnología y videojuegos.</p>
                    </div>

                    <div className="col-md-4">
                        <h5>Enlaces</h5>
                        <ul className="footer-links">
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/productos">Productos</Link></li>
                            <li><Link to="/nosotros">Nosotros</Link></li>
                            <li><Link to="/contacto">Contacto</Link></li>
                        </ul>
                    </div>

                    <div className="col-md-4">
                        <h5>Contacto</h5>
                        <p><i className="bi bi-envelope"></i> nubeplay@gmail.com</p>
                        <p><i className="bi bi-phone"></i> +56 9 1234 5678</p>
                    </div>
                </div>

                <hr />

                <div className="text-center">
                    <p className="mb-0">© 2026 NUBEPLAY. Sebastian Garcia - Marcos Alvial</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
