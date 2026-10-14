
import { act } from "react";
import { useAviso } from "../../hooks/useAviso";
import { botonPorTexto, click, montar } from "../utilidades";


function DemoAviso({ duracion }) {
    const { aviso, mostrar, ocultar } = useAviso(duracion);
    return (
        <div>
            <button onClick={() => mostrar("Guardado")}>mostrar</button>
            <button onClick={() => mostrar("Error", "danger")}>error</button>
            <button onClick={ocultar}>ocultar</button>
            {aviso && <p className={`aviso-${aviso.tipo}`}>{aviso.mensaje}</p>}
        </div>
    );
}


describe("useAviso (hook)", () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());


    it("muestra el aviso con tipo success por defecto", () => {
        const { contenedor } = montar(<DemoAviso duracion={3000} />);
        click(botonPorTexto(contenedor, "mostrar"));
        expect(contenedor.querySelector(".aviso-success").textContent).toBe("Guardado");
    });


    it("lo oculta automáticamente cuando pasa la duración", () => {
        const { contenedor } = montar(<DemoAviso duracion={3000} />);
        click(botonPorTexto(contenedor, "error"));


        act(() => jasmine.clock().tick(2999));
        expect(contenedor.querySelector("p")).not.toBeNull();


        act(() => jasmine.clock().tick(1));
        expect(contenedor.querySelector("p")).toBeNull();
    });


    it("un nuevo aviso reinicia el temporizador", () => {
        const { contenedor } = montar(<DemoAviso duracion={3000} />);
        click(botonPorTexto(contenedor, "mostrar"));
        act(() => jasmine.clock().tick(2000));
        click(botonPorTexto(contenedor, "error"));
        act(() => jasmine.clock().tick(2000));


        expect(contenedor.querySelector(".aviso-danger")).not.toBeNull();
    });


    it("se puede ocultar a mano, y con duración 0 no se oculta solo", () => {
        const { contenedor } = montar(<DemoAviso duracion={0} />);
        click(botonPorTexto(contenedor, "mostrar"));
        act(() => jasmine.clock().tick(60000));
        expect(contenedor.querySelector("p")).not.toBeNull();


        click(botonPorTexto(contenedor, "ocultar"));
        expect(contenedor.querySelector("p")).toBeNull();
    });
});

