// PRUEBAS DE RENDERIZADO + EVENTOS de la tabla del carrito (TablaCarrito -> FilaCarrito -> SelectorCantidad).
import TablaCarrito from "../../components/carrito/TablaCarrito";
import { categoriasIniciales } from "../../data/semillas";
import { click, montar, simularLocalStorage } from "../utilidades";

const ITEMS = [
    { id: 1, nombre: "PlayStation 5", categoria: "consolas", precio: 500000, cantidad: 2, stock: 10 },
    { id: 2, nombre: "Zelda", categoria: "juegos", precio: 50000, cantidad: 1, stock: 3 }
];

describe("TablaCarrito", () => {
    beforeEach(() => simularLocalStorage({ categorias: JSON.stringify(categoriasIniciales) }));

    it("renderiza una fila por cada producto del carrito", () => {
        const { contenedor } = montar(<TablaCarrito items={ITEMS} onCambiarCantidad={() => {}} onEliminar={() => {}} />);
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(2);
    });

    it("calcula el subtotal de cada fila (precio x cantidad)", () => {
        const { contenedor } = montar(<TablaCarrito items={ITEMS} onCambiarCantidad={() => {}} onEliminar={() => {}} />);
        const primeraFila = contenedor.querySelector("tbody tr");
        expect(primeraFila.textContent).toContain("$1.000.000");
    });

    it("al pulsar + en una fila informa el id y la nueva cantidad", () => {
        const onCambiarCantidad = jasmine.createSpy("onCambiarCantidad");
        const { contenedor } = montar(<TablaCarrito items={ITEMS} onCambiarCantidad={onCambiarCantidad} onEliminar={() => {}} />);

        click(contenedor.querySelectorAll("[aria-label='Sumar']")[1]);

        expect(onCambiarCantidad).toHaveBeenCalledWith(2, 2);
    });

    it("al pulsar eliminar informa el id del producto", () => {
        const onEliminar = jasmine.createSpy("onEliminar");
        const { contenedor } = montar(<TablaCarrito items={ITEMS} onCambiarCantidad={() => {}} onEliminar={onEliminar} />);

        click(contenedor.querySelector("[aria-label='Eliminar Zelda']"));

        expect(onEliminar).toHaveBeenCalledWith(2);
    });
});
