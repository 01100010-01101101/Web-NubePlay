// PRUEBAS DE ESTADO: el componente guarda el cupón escrito en su estado interno y
// muestra un mensaje distinto según el resultado de aplicarlo.
import ResumenPedido from "../../components/carrito/ResumenPedido";
import { botonPorTexto, click, escribir, montar } from "../utilidades";

function montarResumen(props = {}) {
    return montar(
        <ResumenPedido
            subtotal={100000}
            descuento={0}
            onAplicarCupon={() => false}
            onPagar={() => {}}
            {...props}
        />
    );
}

describe("ResumenPedido (estado y eventos)", () => {
    it("actualiza el estado del input del cupón cuando el usuario escribe", () => {
        const { contenedor } = montarResumen();
        const input = contenedor.querySelector("#inputCupon");

        escribir(input, "NUBEPLAY123");

        expect(input.value).toBe("NUBEPLAY123");
    });

    it("envía el texto escrito a onAplicarCupon y muestra éxito si es válido", () => {
        const onAplicarCupon = jasmine.createSpy("onAplicarCupon").and.returnValue(true);
        const { contenedor } = montarResumen({ onAplicarCupon });

        escribir(contenedor.querySelector("#inputCupon"), "nubeplay123");
        click(botonPorTexto(contenedor, "Aplicar"));

        expect(onAplicarCupon).toHaveBeenCalledWith("nubeplay123");
        expect(contenedor.textContent).toContain("Cupón del 10% aplicado con éxito");
    });

    it("muestra un error solo cuando el cupón es inválido", () => {
        const { contenedor } = montarResumen({ onAplicarCupon: () => false });
        expect(contenedor.textContent).not.toContain("Código de descuento inválido");

        escribir(contenedor.querySelector("#inputCupon"), "FALSO");
        click(botonPorTexto(contenedor, "Aplicar"));

        expect(contenedor.querySelector(".text-danger").textContent).toBe("Código de descuento inválido.");
    });

    it("muestra la línea de descuento solo si hay descuento y calcula el total", () => {
        const sinDescuento = montarResumen();
        expect(sinDescuento.contenedor.textContent).not.toContain("Descuento (10%)");
        expect(sinDescuento.contenedor.textContent).toContain("$100.000");

        const conDescuento = montarResumen({ descuento: 10000, cuponAplicado: true });
        expect(conDescuento.contenedor.textContent).toContain("Descuento (10%)");
        expect(conDescuento.contenedor.textContent).toContain("$90.000");
    });

    it("ejecuta onPagar al hacer clic y lo bloquea si está deshabilitado", () => {
        const onPagar = jasmine.createSpy("onPagar");
        const activo = montarResumen({ onPagar });
        click(botonPorTexto(activo.contenedor, "Proceder al Pago"));
        expect(onPagar).toHaveBeenCalledTimes(1);

        const bloqueado = montarResumen({ onPagar, deshabilitado: true });
        expect(botonPorTexto(bloqueado.contenedor, "Proceder al Pago").disabled).toBeTrue();
    });
});
