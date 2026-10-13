// PRUEBAS DEL FLUJO DE COMPRA: Checkout -> Compra exitosa / Pago con error.
// Usa localStorage simulado con una sesión iniciada y un carrito con productos.
import { Route, Routes } from "react-router-dom";
import Checkout from "../../pages/Checkout";
import CompraExitosa from "../../pages/CompraExitosa";
import PagoError from "../../pages/PagoError";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import { CLAVES } from "../../data/db";
import { categoriasIniciales, productosIniciales, usuariosIniciales } from "../../data/semillas";
import { click, enviar, escribir, montarConRouter, simularLocalStorage } from "../utilidades";

const ADMIN = usuariosIniciales[0];           // tiene nombre, dirección, región y comuna
const CLIENTE_SIN_DIRECCION = {
    id: 300, nombre: "Luis", apellidos: "Soto", correo: "luis@gmail.com", password: "1234",
    rol: "Cliente", estado: "Activo", compras: []
};
const PS5 = productosIniciales[0];

function prepararDatos(usuario, carrito = [{ id: PS5.id, cantidad: 2 }]) {
    return simularLocalStorage({
        [CLAVES.productos]: JSON.stringify(productosIniciales),
        [CLAVES.categorias]: JSON.stringify(categoriasIniciales),
        [CLAVES.usuarios]: JSON.stringify([ADMIN, CLIENTE_SIN_DIRECCION]),
        [CLAVES.sesion]: JSON.stringify(usuario),
        [CLAVES.carrito]: JSON.stringify(carrito)
    });
}

function montarCheckout() {
    return montarConRouter(
        <AuthProvider>
            <CartProvider>
                <Routes>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/compra-exitosa/:id" element={<CompraExitosa />} />
                    <Route path="/pago-error" element={<PagoError />} />
                    <Route path="/carrito" element={<h1>Carrito</h1>} />
                    <Route path="/login" element={<h1>Login</h1>} />
                </Routes>
            </CartProvider>
        </AuthProvider>,
        "/checkout"
    );
}

describe("Página Checkout", () => {
    it("redirige al login si no hay sesión iniciada", () => {
        simularLocalStorage({ [CLAVES.productos]: JSON.stringify(productosIniciales) });
        const { contenedor } = montarCheckout();
        expect(contenedor.querySelector("h1").textContent).toBe("Login");
    });

    it("redirige al carrito si el carrito está vacío", () => {
        prepararDatos(ADMIN, []);
        const { contenedor } = montarCheckout();
        expect(contenedor.querySelector("h1").textContent).toBe("Carrito");
    });

    it("autocompleta los datos del usuario con sesión y muestra el total", () => {
        prepararDatos(ADMIN);
        const { contenedor } = montarCheckout();

        expect(contenedor.querySelector("#nombre").value).toBe(ADMIN.nombre);
        expect(contenedor.querySelector("#correo").value).toBe(ADMIN.correo);
        expect(contenedor.querySelector("[data-testid='total-compra']").textContent).toContain("$1.099.980");
    });

    it("muestra los errores de validación solo después de intentar pagar", () => {
        prepararDatos(CLIENTE_SIN_DIRECCION);
        const { contenedor } = montarCheckout();
        expect(contenedor.querySelectorAll(".invalid-feedback").length).toBe(0);

        enviar(contenedor.querySelector("form"));

        const errores = [...contenedor.querySelectorAll(".invalid-feedback")].map(e => e.textContent);
        expect(errores).toContain("La calle es requerida (máx. 300 caracteres).");
        expect(errores).toContain("Debe seleccionar una región.");
    });

    it("el error de un campo desaparece cuando el usuario lo corrige", () => {
        prepararDatos(CLIENTE_SIN_DIRECCION);
        const { contenedor } = montarCheckout();
        enviar(contenedor.querySelector("form"));
        expect(contenedor.querySelector("#calle").classList).toContain("is-invalid");

        escribir(contenedor.querySelector("#calle"), "Av. Los Crisantemos 123");

        expect(contenedor.querySelector("#calle").classList).not.toContain("is-invalid");
    });

    it("con un pago aprobado registra la orden, descuenta stock y muestra la boleta", () => {
        const almacen = prepararDatos(ADMIN);
        const { contenedor } = montarCheckout();

        enviar(contenedor.querySelector("form"));

        expect(contenedor.textContent).toContain("Se ha realizado la compra");
        expect(contenedor.querySelector("[data-testid='total-boleta']").textContent).toContain("$1.099.980");

        const ordenes = JSON.parse(almacen[CLAVES.ordenes]);
        const productos = JSON.parse(almacen[CLAVES.productos]);
        expect(ordenes.length).toBe(1);
        expect(productos.find(p => p.id === PS5.id).stock).toBe(PS5.stock - 2);
        expect(almacen[CLAVES.carrito]).toBeUndefined(); // el carrito se vació
    });

    it("con el pago rechazado muestra la vista de error y NO registra la orden", () => {
        const almacen = prepararDatos(ADMIN);
        const { contenedor } = montarCheckout();

        click(contenedor.querySelector("#simularRechazo"));
        enviar(contenedor.querySelector("form"));

        expect(contenedor.textContent).toContain("No se pudo realizar el pago");
        expect(contenedor.textContent).toContain("El banco rechazó la transacción");
        expect(almacen[CLAVES.ordenes]).toBeUndefined();
        expect(JSON.parse(almacen[CLAVES.carrito]).length).toBe(1); // el carrito se conserva
    });

    it("desde el pago con error se puede volver a intentar el pago", () => {
        prepararDatos(ADMIN);
        const { contenedor } = montarCheckout();
        click(contenedor.querySelector("#simularRechazo"));
        enviar(contenedor.querySelector("form"));

        click([...contenedor.querySelectorAll("button")].find(b => b.textContent.includes("VOLVER A REALIZAR EL PAGO")));

        expect(contenedor.textContent).toContain("Pagar ahora");
        expect(contenedor.querySelector("#nombre").value).toBe(ADMIN.nombre);
    });
});
