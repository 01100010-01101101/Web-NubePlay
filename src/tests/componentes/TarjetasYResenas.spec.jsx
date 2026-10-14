
import TarjetaCategoria from "../../components/productos/TarjetaCategoria";
import TarjetaBlog from "../../components/blog/TarjetaBlog";
import Estrellas from "../../components/detalle/Estrellas";
import ListaResenas from "../../components/detalle/ListaResenas";
import FormularioResena from "../../components/detalle/FormularioResena";
import { blogs } from "../../data/blogs";
import { click, enviar, escribir, montar, montarConRouter, seleccionar } from "../utilidades";


const CATEGORIA = { valor: "consolas", nombre: "Consolas", icono: "bi-controller" };


describe("TarjetaCategoria", () => {
    it("muestra nombre, cantidad de productos y enlaza a su categoría", () => {
        const { contenedor } = montarConRouter(<TarjetaCategoria categoria={CATEGORIA} cantidad={4} />);
        const enlace = contenedor.querySelector("a");


        expect(enlace.getAttribute("href")).toBe("/categorias/consolas");
        expect(enlace.textContent).toContain("Consolas");
        expect(enlace.textContent).toContain("4 producto(s)");
    });


    it("se resalta cuando es la categoría activa", () => {
        const montaje = montarConRouter(<TarjetaCategoria categoria={CATEGORIA} cantidad={1} activa />);
        const enlace = montaje.contenedor.querySelector("a");
        expect(enlace.classList).toContain("bg-primary");
        expect(enlace.getAttribute("aria-current")).toBe("page");


        const inactiva = montarConRouter(<TarjetaCategoria categoria={CATEGORIA} cantidad={1} />);
        expect(inactiva.contenedor.querySelector("a").hasAttribute("aria-current")).toBeFalse();
    });
});


describe("TarjetaBlog", () => {
    it("muestra el título, resumen y categoría del blog, y enlaza a su detalle", () => {
        const blog = blogs[0];
        const { contenedor } = montarConRouter(<TarjetaBlog blog={blog} />);


        expect(contenedor.querySelector(".card-title").textContent).toBe(blog.titulo);
        expect(contenedor.textContent).toContain(blog.resumen);
        expect(contenedor.querySelector(".badge").textContent).toBe(blog.categoria);
        expect(contenedor.querySelector("a").getAttribute("href")).toBe(`/blogs/${blog.id}`);
    });
});


describe("Estrellas", () => {
    it("pinta tantas estrellas llenas como la puntuación", () => {
        const { contenedor } = montar(<Estrellas puntuacion={3} />);
        expect(contenedor.querySelectorAll(".bi-star-fill").length).toBe(3);
        expect(contenedor.querySelectorAll(".bi-star").length).toBe(2);
        expect(contenedor.querySelector("span").getAttribute("aria-label")).toBe("3 de 5 estrellas");
    });
});


describe("ListaResenas", () => {
    it("muestra un mensaje cuando no hay reseñas", () => {
        const { contenedor } = montar(<ListaResenas resenas={[]} />);
        expect(contenedor.textContent).toContain("Este producto aún no tiene reseñas.");
    });


    it("renderiza todas las reseñas, la más reciente primero", () => {
        const resenas = [
            { id: 1, nombre: "Ana", puntuacion: 5, comentario: "Excelente", fecha: "01-10-2026" },
            { id: 2, nombre: "Luis", puntuacion: "2", comentario: "Regular", fecha: "02-10-2026" }
        ];
        const { contenedor } = montar(<ListaResenas resenas={resenas} />);
        const nombres = [...contenedor.querySelectorAll("h6")].map(h => h.textContent);


        expect(nombres).toEqual(["Luis", "Ana"]);
        expect(contenedor.textContent).toContain("Excelente");
        expect(contenedor.querySelectorAll(".bi-star-fill").length).toBe(7);
    });
});


describe("FormularioResena", () => {
    it("muestra un error si se envía incompleto y no publica", () => {
        const onPublicar = jasmine.createSpy("onPublicar");
        const { contenedor } = montar(<FormularioResena onPublicar={onPublicar} />);


        enviar(contenedor.querySelector("form"));


        expect(contenedor.querySelector(".text-danger").textContent).toBe("Completa todos los campos de la reseña.");
        expect(onPublicar).not.toHaveBeenCalled();
    });


    it("el error desaparece al volver a escribir", () => {
        const { contenedor } = montar(<FormularioResena onPublicar={() => {}} />);
        enviar(contenedor.querySelector("form"));


        escribir(contenedor.querySelector("[name='nombre']"), "Ana");


        expect(contenedor.querySelector(".text-danger")).toBeNull();
    });


    it("publica la reseña con los datos escritos y limpia el formulario", () => {
        const onPublicar = jasmine.createSpy("onPublicar");
        const { contenedor } = montar(<FormularioResena onPublicar={onPublicar} />);


        escribir(contenedor.querySelector("[name='nombre']"), "  Ana ");
        seleccionar(contenedor.querySelector("[name='puntuacion']"), "4");
        escribir(contenedor.querySelector("[name='comentario']"), "Muy bueno");
        click(contenedor.querySelector("button[type='submit']"));


        expect(onPublicar).toHaveBeenCalledWith({ nombre: "Ana", comentario: "Muy bueno", puntuacion: 4 });
        expect(contenedor.querySelector("[name='nombre']").value).toBe("");
        expect(contenedor.querySelector("[name='puntuacion']").value).toBe("5");
    });
});

