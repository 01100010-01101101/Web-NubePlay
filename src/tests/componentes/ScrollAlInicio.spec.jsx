// PRUEBAS DE ScrollAlInicio: al navegar a otra página el scroll vuelve arriba,
// pero cambiar solo los parámetros (?tab=) no lo mueve. window.scrollTo se reemplaza por un espía.
import { Link, Route, Routes } from "react-router-dom";
import ScrollAlInicio from "../../components/common/ScrollAlInicio";
import { click, montarConRouter } from "../utilidades";

function Rutas() {
    return (
        <>
            <ScrollAlInicio />
            <Routes>
                <Route path="/productos" element={<Link to="/productos/1">Ver detalle</Link>} />
                <Route path="/productos/:id" element={<Link to="/productos/1?tab=resenas">Reseñas</Link>} />
            </Routes>
        </>
    );
}

describe("ScrollAlInicio", () => {
    beforeEach(() => spyOn(window, "scrollTo"));

    it("sube al inicio al cargar la página", () => {
        montarConRouter(<Rutas />, "/productos");
        expect(window.scrollTo).toHaveBeenCalledOnceWith(0, 0);
    });

    it("sube al inicio al pasar del catálogo al detalle de un producto", () => {
        const { contenedor } = montarConRouter(<Rutas />, "/productos");
        window.scrollTo.calls.reset();

        click(contenedor.querySelector("a"));

        expect(contenedor.textContent).toBe("Reseñas");
        expect(window.scrollTo).toHaveBeenCalledOnceWith(0, 0);
    });

    it("no mueve el scroll si solo cambian los parámetros de la URL", () => {
        const { contenedor } = montarConRouter(<Rutas />, "/productos/1");
        window.scrollTo.calls.reset();

        click(contenedor.querySelector("a"));

        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("no dibuja nada en pantalla", () => {
        const { contenedor } = montarConRouter(<ScrollAlInicio />);
        expect(contenedor.innerHTML).toBe("");
    });
});
