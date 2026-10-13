// PRUEBAS DE RENDERIZADO CONDICIONAL: el mensaje de error solo aparece cuando hay un error.
import Alerta from "../../components/common/Alerta";
import { click, montar } from "../utilidades";

describe("Alerta (renderizado condicional)", () => {
    it("no renderiza nada cuando no hay mensaje", () => {
        const { contenedor } = montar(<Alerta mensaje={null} tipo="danger" />);
        expect(contenedor.querySelector(".alert")).toBeNull();
        expect(contenedor.innerHTML).toBe("");
    });

    it("muestra el mensaje de error cuando existe un error", () => {
        const { contenedor } = montar(<Alerta mensaje="Correo o contraseña incorrectos." tipo="danger" />);
        const alerta = contenedor.querySelector("[role='alert']");

        expect(alerta).not.toBeNull();
        expect(alerta.textContent).toContain("Correo o contraseña incorrectos.");
        expect(alerta.classList).toContain("alert-danger");
    });

    it("aparece y desaparece al cambiar la prop mensaje", () => {
        const montaje = montar(<Alerta mensaje="" />);
        expect(montaje.contenedor.querySelector(".alert")).toBeNull();

        montaje.rerender(<Alerta mensaje="Hubo un error" tipo="warning" />);
        expect(montaje.contenedor.querySelector(".alert-warning")).not.toBeNull();

        montaje.rerender(<Alerta mensaje="" />);
        expect(montaje.contenedor.querySelector(".alert")).toBeNull();
    });

    it("solo muestra el botón cerrar si recibe onCerrar, y lo ejecuta al hacer clic", () => {
        const sinCerrar = montar(<Alerta mensaje="Hola" />);
        expect(sinCerrar.contenedor.querySelector(".btn-close")).toBeNull();

        const onCerrar = jasmine.createSpy("onCerrar");
        const conCerrar = montar(<Alerta mensaje="Hola" onCerrar={onCerrar} />);
        click(conCerrar.contenedor.querySelector(".btn-close"));

        expect(onCerrar).toHaveBeenCalled();
    });
});
