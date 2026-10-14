import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";




globalThis.IS_REACT_ACT_ENVIRONMENT = true;


const montados = [];


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


export function montarConRouter(elemento, ruta = "/") {
    const future = { v7_startTransition: true, v7_relativeSplatPath: true };
    return montar(createElement(MemoryRouter, { initialEntries: [ruta], future }, elemento));
}
export function montarConProveedores(elemento, ruta = "/") {
    return montarConRouter(
        createElement(AuthProvider, null, createElement(CartProvider, null, elemento)),
        ruta
    );
}




afterEach(() => {
    while (montados.length) montados.pop().desmontar();
});


export function click(elemento) {
    act(() => {


        elemento.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
}




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




export function simularLocalStorage(inicial = {}) {
    const almacen = { ...inicial };
    spyOn(Storage.prototype, "getItem").and.callFake(clave => (clave in almacen ? almacen[clave] : null));
    spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => { almacen[clave] = String(valor); });
    spyOn(Storage.prototype, "removeItem").and.callFake(clave => { delete almacen[clave]; });
    spyOn(Storage.prototype, "clear").and.callFake(() => Object.keys(almacen).forEach(c => delete almacen[c]));
    return almacen;
}


export function botonPorTexto(contenedor, texto) {
    return [...contenedor.querySelectorAll("button, a")].find(el => el.textContent.trim().includes(texto)) || null;
}

