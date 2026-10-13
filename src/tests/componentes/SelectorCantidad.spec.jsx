// PRUEBAS DE EVENTOS: clic en los botones + / - y respeto de los límites de stock.
import SelectorCantidad from "../../components/detalle/SelectorCantidad";
import { click, montar } from "../utilidades";

function botones(contenedor) {
    return {
        restar: contenedor.querySelector("[aria-label='Restar']"),
        sumar: contenedor.querySelector("[aria-label='Sumar']"),
        input: contenedor.querySelector("[aria-label='Cantidad']")
    };
}

describe("SelectorCantidad (eventos)", () => {
    it("muestra la cantidad recibida", () => {
        const { contenedor } = montar(<SelectorCantidad cantidad={3} maximo={10} onChange={() => {}} />);
        expect(botones(contenedor).input.value).toBe("3");
    });

    it("al hacer clic en + llama a onChange con la cantidad + 1", () => {
        const onChange = jasmine.createSpy("onChange");
        const { contenedor } = montar(<SelectorCantidad cantidad={2} maximo={5} onChange={onChange} />);

        click(botones(contenedor).sumar);

        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("al hacer clic en - llama a onChange con la cantidad - 1", () => {
        const onChange = jasmine.createSpy("onChange");
        const { contenedor } = montar(<SelectorCantidad cantidad={2} maximo={5} onChange={onChange} />);

        click(botones(contenedor).restar);

        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("deshabilita '-' en el mínimo y '+' en el máximo (stock)", () => {
        const { contenedor } = montar(<SelectorCantidad cantidad={1} maximo={1} onChange={() => {}} />);
        const { restar, sumar } = botones(contenedor);

        expect(restar.disabled).toBeTrue();
        expect(sumar.disabled).toBeTrue();
    });

    it("si recibe onLimite, avisa al intentar superar el stock en vez de cambiar la cantidad", () => {
        const onChange = jasmine.createSpy("onChange");
        const onLimite = jasmine.createSpy("onLimite");
        const { contenedor } = montar(<SelectorCantidad cantidad={4} maximo={4} onChange={onChange} onLimite={onLimite} />);

        click(botones(contenedor).sumar);

        expect(onLimite).toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });
});
