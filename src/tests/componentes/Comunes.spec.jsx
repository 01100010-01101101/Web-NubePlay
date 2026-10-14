
import Modal from "../../components/common/Modal";
import AvisoFlotante from "../../components/common/AvisoFlotante";
import EncabezadoPagina from "../../components/common/EncabezadoPagina";
import Buscador from "../../components/common/Buscador";
import EstadoVacio from "../../components/common/EstadoVacio";
import { click, escribir, montar } from "../utilidades";


describe("Modal", () => {
    it("no renderiza nada cuando está cerrado", () => {
        const { contenedor } = montar(<Modal abierto={false} titulo="Hola" onCerrar={() => {}}>Contenido</Modal>);
        expect(contenedor.innerHTML).toBe("");
    });


    it("muestra título, contenido (children) y footer cuando está abierto", () => {
        const { contenedor } = montar(
            <Modal abierto titulo="Editar Producto" onCerrar={() => {}} footer={<span>Pie</span>}>
                <p>Formulario</p>
            </Modal>
        );
        expect(contenedor.querySelector(".modal-title").textContent).toBe("Editar Producto");
        expect(contenedor.querySelector(".modal-body").textContent).toBe("Formulario");
        expect(contenedor.querySelector(".modal-footer").textContent).toBe("Pie");
    });


    it("se cierra con el botón X y al hacer clic en el fondo, pero no al hacer clic dentro", () => {
        const onCerrar = jasmine.createSpy("onCerrar");
        const { contenedor } = montar(<Modal abierto titulo="T" onCerrar={onCerrar}><p id="dentro">x</p></Modal>);


        click(contenedor.querySelector("#dentro"));
        expect(onCerrar).not.toHaveBeenCalled();


        click(contenedor.querySelector(".btn-close"));
        click(contenedor.querySelector(".modal"));
        expect(onCerrar).toHaveBeenCalledTimes(2);
    });
});


describe("AvisoFlotante", () => {
    it("no se muestra sin aviso", () => {
        expect(montar(<AvisoFlotante aviso={null} onCerrar={() => {}} />).contenedor.innerHTML).toBe("");
    });


    it("usa el color e ícono según el tipo y se puede cerrar", () => {
        const onCerrar = jasmine.createSpy("onCerrar");
        const { contenedor } = montar(<AvisoFlotante aviso={{ mensaje: "Sin stock", tipo: "danger" }} onCerrar={onCerrar} />);


        expect(contenedor.querySelector(".alert-danger").textContent).toContain("Sin stock");
        expect(contenedor.querySelector(".bi-exclamation-triangle-fill")).not.toBeNull();


        click(contenedor.querySelector(".btn-close"));
        expect(onCerrar).toHaveBeenCalled();
    });


    it("muestra el ícono de éxito para avisos success", () => {
        const { contenedor } = montar(<AvisoFlotante aviso={{ mensaje: "Listo", tipo: "success" }} onCerrar={() => {}} />);
        expect(contenedor.querySelector(".bi-check-circle-fill")).not.toBeNull();
    });
});


describe("EncabezadoPagina", () => {
    it("muestra título, subtítulo e ícono recibidos", () => {
        const { contenedor } = montar(<EncabezadoPagina titulo="Catálogo" subtitulo="Los mejores juegos" icono="bi-controller" />);
        expect(contenedor.querySelector("h1").textContent).toBe("Catálogo");
        expect(contenedor.querySelector("p.lead").textContent).toBe("Los mejores juegos");
        expect(contenedor.querySelector("i.bi-controller")).not.toBeNull();
    });


    it("omite subtítulo e ícono si no se entregan", () => {
        const { contenedor } = montar(<EncabezadoPagina titulo="Nosotros" />);
        expect(contenedor.querySelector("p")).toBeNull();
        expect(contenedor.querySelector("i")).toBeNull();
    });
});


describe("Buscador", () => {
    it("muestra el valor y notifica cada cambio con el texto escrito", () => {
        const onChange = jasmine.createSpy("onChange");
        const { contenedor } = montar(<Buscador valor="ps" onChange={onChange} placeholder="Buscar..." etiqueta="Buscar producto" />);
        const input = contenedor.querySelector("input");


        expect(input.value).toBe("ps");
        expect(input.getAttribute("aria-label")).toBe("Buscar producto");


        escribir(input, "ps5");
        expect(onChange).toHaveBeenCalledWith("ps5");
    });
});


describe("EstadoVacio", () => {
    it("muestra título, descripción, ícono y los hijos", () => {
        const { contenedor } = montar(
            <EstadoVacio icono="bi-cart-x" titulo="Carrito vacío" descripcion="Agrega productos"><button>Ir</button></EstadoVacio>
        );
        expect(contenedor.querySelector("h4").textContent).toBe("Carrito vacío");
        expect(contenedor.querySelector("p").textContent).toBe("Agrega productos");
        expect(contenedor.querySelector("i.bi-cart-x")).not.toBeNull();
        expect(contenedor.querySelector("button").textContent).toBe("Ir");
    });


    it("usa un ícono por defecto y omite la descripción si no viene", () => {
        const { contenedor } = montar(<EstadoVacio titulo="Nada" />);
        expect(contenedor.querySelector("i.bi-emoji-frown")).not.toBeNull();
        expect(contenedor.querySelector("p")).toBeNull();
    });
});

