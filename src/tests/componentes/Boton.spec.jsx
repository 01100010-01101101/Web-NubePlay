// PRUEBAS DE PROPIEDADES (props): el botón recibe su etiqueta y su función onClick.
import Boton from "../../components/common/Boton";
import { click, montar } from "../utilidades";

describe("Boton (props)", () => {
    it("muestra la etiqueta recibida por props", () => {
        const { contenedor } = montar(<Boton etiqueta="Guardar cambios" onClick={() => {}} />);
        expect(contenedor.querySelector("button").textContent).toBe("Guardar cambios");
    });

    it("ejecuta la función onClick recibida al hacer clic", () => {
        const alHacerClic = jasmine.createSpy("onClick");
        const { contenedor } = montar(<Boton etiqueta="Comprar" onClick={alHacerClic} />);

        click(contenedor.querySelector("button"));

        expect(alHacerClic).toHaveBeenCalledTimes(1);
    });

    it("aplica la variante, el tipo y el ícono recibidos", () => {
        const { contenedor } = montar(<Boton etiqueta="Eliminar" variante="danger" type="submit" icono="bi-trash" />);
        const boton = contenedor.querySelector("button");

        expect(boton.classList).toContain("btn-danger");
        expect(boton.getAttribute("type")).toBe("submit");
        expect(boton.querySelector("i.bi-trash")).not.toBeNull();
    });

    it("no muestra ícono si no se entrega la prop icono", () => {
        const { contenedor } = montar(<Boton etiqueta="Aceptar" />);
        expect(contenedor.querySelector("i")).toBeNull();
    });

    it("no ejecuta onClick cuando está deshabilitado", () => {
        const alHacerClic = jasmine.createSpy("onClick");
        const { contenedor } = montar(<Boton etiqueta="Pagar" onClick={alHacerClic} disabled />);

        click(contenedor.querySelector("button"));

        expect(contenedor.querySelector("button").disabled).toBeTrue();
        expect(alHacerClic).not.toHaveBeenCalled();
    });
});
