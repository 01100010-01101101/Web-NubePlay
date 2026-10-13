// PRUEBAS DE COMPONENTES DE FORMULARIO controlados: CampoFormulario, FiltrosProductos
// y SelectorRegionComuna (props, renderizado condicional y eventos de cambio).
import { useState } from "react";
import CampoFormulario from "../../components/common/CampoFormulario";
import FiltrosProductos from "../../components/productos/FiltrosProductos";
import SelectorRegionComuna from "../../components/common/SelectorRegionComuna";
import { escribir, montar, seleccionar } from "../utilidades";

describe("CampoFormulario", () => {
    it("muestra la etiqueta asociada al input por su id", () => {
        const { contenedor } = montar(<CampoFormulario id="nombre" etiqueta="Nombre" valor="" onChange={() => {}} />);
        expect(contenedor.querySelector("label").getAttribute("for")).toBe("nombre");
        expect(contenedor.querySelector("input#nombre")).not.toBeNull();
    });

    it("muestra el mensaje de error y la clase is-invalid solo cuando hay error", () => {
        const montaje = montar(<CampoFormulario id="correo" valor="" onChange={() => {}} />);
        expect(montaje.contenedor.querySelector(".invalid-feedback")).toBeNull();

        montaje.rerender(<CampoFormulario id="correo" valor="" onChange={() => {}} error="Correo inválido" />);
        expect(montaje.contenedor.querySelector("input").classList).toContain("is-invalid");
        expect(montaje.contenedor.querySelector(".invalid-feedback").textContent).toBe("Correo inválido");
    });

    it("marca el campo como válido con la prop valido", () => {
        const { contenedor } = montar(<CampoFormulario id="run" valor="1" onChange={() => {}} valido />);
        expect(contenedor.querySelector("input").classList).toContain("is-valid");
    });

    it("renderiza un textarea cuando multilinea es true", () => {
        const { contenedor } = montar(<CampoFormulario id="direccion" valor="" onChange={() => {}} multilinea />);
        expect(contenedor.querySelector("textarea#direccion")).not.toBeNull();
    });

    it("el estado del formulario padre cambia cuando el usuario escribe", () => {
        // Componente de prueba que guarda el valor en su estado (patrón de componente controlado).
        function FormularioPrueba() {
            const [nombre, setNombre] = useState("");
            return (
                <>
                    <CampoFormulario id="nombre" valor={nombre} onChange={e => setNombre(e.target.value)} />
                    <p id="vista">{nombre}</p>
                </>
            );
        }
        const { contenedor } = montar(<FormularioPrueba />);

        escribir(contenedor.querySelector("#nombre"), "Sebastián");

        expect(contenedor.querySelector("#nombre").value).toBe("Sebastián");
        expect(contenedor.querySelector("#vista").textContent).toBe("Sebastián");
    });
});

describe("FiltrosProductos", () => {
    const categorias = [{ valor: "consolas", nombre: "Consolas" }, { valor: "juegos", nombre: "Videojuegos" }];

    it("renderiza una opción por categoría más 'Todas'", () => {
        const { contenedor } = montar(
            <FiltrosProductos busqueda="" categoria="todas" categorias={categorias}
                onBusquedaChange={() => {}} onCategoriaChange={() => {}} />
        );
        const opciones = [...contenedor.querySelectorAll("option")].map(o => o.textContent);
        expect(opciones).toEqual(["Todas las categorías", "Consolas", "Videojuegos"]);
    });

    it("notifica el texto buscado y la categoría elegida", () => {
        const onBusquedaChange = jasmine.createSpy("onBusquedaChange");
        const onCategoriaChange = jasmine.createSpy("onCategoriaChange");
        const { contenedor } = montar(
            <FiltrosProductos busqueda="" categoria="todas" categorias={categorias}
                onBusquedaChange={onBusquedaChange} onCategoriaChange={onCategoriaChange} />
        );

        escribir(contenedor.querySelector("input"), "zelda");
        seleccionar(contenedor.querySelector("select"), "juegos");

        expect(onBusquedaChange).toHaveBeenCalledWith("zelda");
        expect(onCategoriaChange).toHaveBeenCalledWith("juegos");
    });
});

describe("SelectorRegionComuna", () => {
    it("deshabilita la comuna hasta que se elige una región", () => {
        const { contenedor } = montar(<SelectorRegionComuna region="" comuna="" onChange={() => {}} />);
        expect(contenedor.querySelector("#comuna").disabled).toBeTrue();
    });

    it("al cambiar la región reinicia la comuna", () => {
        const onChange = jasmine.createSpy("onChange");
        const { contenedor } = montar(
            <SelectorRegionComuna region="Valparaíso" comuna="Quilpué" onChange={onChange} />
        );

        seleccionar(contenedor.querySelector("#region"), "Metropolitana de Santiago");

        expect(onChange).toHaveBeenCalledWith({ region: "Metropolitana de Santiago", comuna: "" });
    });

    it("muestra solo las comunas de la región seleccionada", () => {
        const { contenedor } = montar(<SelectorRegionComuna region="Valparaíso" comuna="" onChange={() => {}} />);
        const comunas = [...contenedor.querySelectorAll("#comuna option")].map(o => o.value).filter(Boolean);
        expect(comunas).toEqual(["Valparaíso", "Viña del Mar", "Quilpué", "San Antonio"]);
    });
});
