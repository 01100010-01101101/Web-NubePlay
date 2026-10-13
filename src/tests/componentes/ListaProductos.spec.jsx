// PRUEBAS DE RENDERIZADO: la lista muestra todos los elementos del conjunto de datos.
import ListaProductos from "../../components/productos/ListaProductos";
import { categoriasIniciales } from "../../data/semillas";
import { click, montarConRouter, simularLocalStorage } from "../utilidades";

const PRODUCTOS = [
    { id: 1, nombre: "PlayStation 5", categoria: "consolas", precio: 549990, stock: 10, descripcion: "Consola" },
    { id: 2, nombre: "Zelda", categoria: "juegos", precio: 59990, stock: 5 },
    { id: 3, nombre: "Audífonos HyperX", categoria: "accesorios", precio: 39990, stock: 0 }
];

describe("ListaProductos (renderizado de listas)", () => {
    beforeEach(() => {
        // Mock: las tarjetas leen el nombre de la categoría desde localStorage.
        simularLocalStorage({ categorias: JSON.stringify(categoriasIniciales) });
    });

    it("renderiza una tarjeta por cada producto del arreglo", () => {
        const { contenedor } = montarConRouter(<ListaProductos productos={PRODUCTOS} onAgregar={() => {}} />);
        const titulos = [...contenedor.querySelectorAll(".card-title")].map(t => t.textContent);

        expect(contenedor.querySelectorAll(".producto-card").length).toBe(PRODUCTOS.length);
        expect(titulos).toEqual(["PlayStation 5", "Zelda", "Audífonos HyperX"]);
    });

    it("muestra los precios formateados en pesos chilenos y el nombre de la categoría", () => {
        const { contenedor } = montarConRouter(<ListaProductos productos={PRODUCTOS.slice(0, 1)} />);
        const texto = contenedor.textContent;

        expect(texto).toContain("$549.990");
        expect(texto).toContain("Consolas");
    });

    it("muestra un mensaje cuando la lista está vacía", () => {
        const { contenedor } = montarConRouter(<ListaProductos productos={[]} />);

        expect(contenedor.querySelectorAll(".producto-card").length).toBe(0);
        expect(contenedor.textContent).toContain("No se encontraron productos");
    });

    it("cada tarjeta enlaza al detalle de su producto", () => {
        const { contenedor } = montarConRouter(<ListaProductos productos={PRODUCTOS} />);
        const enlaces = [...contenedor.querySelectorAll("a")].map(a => a.getAttribute("href"));

        expect(enlaces).toEqual(["/productos/1", "/productos/2", "/productos/3"]);
    });

    it("oculta el botón 'Agregar' si no recibe onAgregar (ej: perfil vendedor)", () => {
        const { contenedor } = montarConRouter(<ListaProductos productos={PRODUCTOS} onAgregar={null} />);
        expect(contenedor.textContent).not.toContain("Agregar al Carrito");
    });

    it("deshabilita el producto agotado y llama a onAgregar con el producto correcto", () => {
        const onAgregar = jasmine.createSpy("onAgregar");
        const { contenedor } = montarConRouter(<ListaProductos productos={PRODUCTOS} onAgregar={onAgregar} />);
        const botones = contenedor.querySelectorAll("button");

        expect(botones[2].disabled).toBeTrue();
        expect(botones[2].textContent).toContain("Agotado");

        click(botones[1]);
        expect(onAgregar).toHaveBeenCalledOnceWith(PRODUCTOS[1]);
    });
});
