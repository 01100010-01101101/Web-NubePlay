import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
function LayoutTienda() {
    const { pathname } = useLocation();
    const esInicio = pathname === "/";

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar fija={esInicio} />
            <div className="flex-grow-1 d-flex flex-column">
                <Outlet />
            </div>
            <Footer completo={esInicio} />
        </div>
    );
}

export default LayoutTienda;