// Utilidades compartidas por las pruebas: montar componentes React en el DOM real del
// navegador (Chrome, vía Karma), simular eventos del usuario y simular localStorage.
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

// Indica a React que estamos en un entorno de pruebas (habilita act()).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const montados = [];

// Renderiza un elemento React en un <div> nuevo y lo devuelve junto a funciones de ayuda.
export function montar(elemento) {
    const contenedor = document.createElement("div");
    document.body.appendChild(contenedor);
    const root = createRoot(contenedor);
    act(() => root.render(elemento));

    const montaje = {
        contenedor,
        rerender: nuevo => act(() => root.render(nuevo)),
        desmontar: () => {
            act(() => root.unmount());
            contenedor.remove();
        }
    };
    montados.push(montaje);
    return montaje;
}

// Igual que montar(), pero dentro de un router en memoria (necesario para <Link>, useNavigate, etc.).
export function montarConRouter(elemento, ruta = "/") {
    // Los "future flags" solo evitan los avisos de migración a React Router v7 en la consola.
    const future = { v7_startTransition: true, v7_relativeSplatPath: true };
    return montar(createElement(MemoryRouter, { initialEntries: [ruta], future }, elemento));
}

// Desmonta todo lo renderizado después de cada prueba para que no se mezclen entre sí.
afterEach(() => {
    while (montados.length) montados.pop().desmontar();
});

export function click(elemento) {
    act(() => {
        elemento.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
}

// React escucha el evento "input": se asigna el valor con el setter nativo para que React lo detecte.
export function escribir(input, valor) {
    const prototipo = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    act(() => {
        Object.getOwnPropertyDescriptor(prototipo, "value").set.call(input, valor);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

export function seleccionar(select, valor) {
    act(() => {
        Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, valor);
        select.dispatchEvent(new Event("change", { bubbles: true }));
    });
}

export function enviar(formulario) {
    act(() => {
        formulario.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
}

// MOCK de localStorage: reemplaza los métodos reales por espías de Jasmine que guardan
// en un objeto en memoria. Así las pruebas no tocan los datos reales del navegador
// y se puede verificar qué se guardó (expect(localStorage.setItem).toHaveBeenCalledWith(...)).
export function simularLocalStorage(inicial = {}) {
    const almacen = { ...inicial };
    spyOn(Storage.prototype, "getItem").and.callFake(clave => (clave in almacen ? almacen[clave] : null));
    spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => { almacen[clave] = String(valor); });
    spyOn(Storage.prototype, "removeItem").and.callFake(clave => { delete almacen[clave]; });
    spyOn(Storage.prototype, "clear").and.callFake(() => Object.keys(almacen).forEach(c => delete almacen[c]));
    return almacen;
}

// Busca un botón por su texto visible.
export function botonPorTexto(contenedor, texto) {
    return [...contenedor.querySelectorAll("button, a")].find(el => el.textContent.trim().includes(texto)) || null;
}
