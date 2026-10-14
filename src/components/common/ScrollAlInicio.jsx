import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router cambia de página sin recargar, así que el navegador conserva el scroll
// de la página anterior. Al cambiar de ruta se vuelve al inicio de la página.
// Solo depende de `pathname`: cambiar ?tab= en el panel admin no mueve el scroll.
function ScrollAlInicio() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default ScrollAlInicio;
