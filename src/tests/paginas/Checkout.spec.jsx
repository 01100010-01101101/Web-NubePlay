// PRUEBAS DEL FLUJO DE COMPRA: Checkout -> Compra exitosa / Pago con error.
// La sesión y la compra pasan por la API (servidor falso en memoria, ver servidorFalso.js).
import { Route, Routes } from "react-router-dom";
import Checkout from "../../pages/Checkout";
import CompraExitosa from "../../pages/CompraExitosa";
import PagoError from "../../pages/PagoError";
import { CLAVES } from "../../data/db";
import { productosIniciales } from "../../data/semillas";
import { click, enviar, escribir, montarConProveedores, simularLocalStorage } from "../utilidades";
import { esperarApi, sesionGuardada, simularServidor, USUARIOS_PRUEBA } from "../servidorFalso";

const ADMIN = USUARIOS_PRUEBA.admin; // tiene nombre, dirección, región y comuna
const CLIENTE_SIN_DIRECCION = {
    id: 300, run: "300300300", nombre: "Luis", apellidos: "Soto", correo: "luis@gmail.com", password: "1234",
    rol: "Cliente", estado: "Activo", region: "", comuna: "", direccion: "", compras: []
};
const PS5 = productosIniciales[0];

function prepararDatos(usuario, carrito = [{ id: PS5.id, cantidad: 2 }]) {
    const almacen = simularLocalStorage({ [CLAVES.carrito]: JSON.stringify(carrito) });
    const servidor = simularServidor({ usuarios: [...Object.values(USUARIOS_PRUEBA), CLIENTE_SIN_DIRECCION] });
    if (usuario) sesionGuardada(usuario);
    return { almacen, servidor };
}

async function montarCheckout() {
    const montaje = montarConProveedores(
        <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/compra-exitosa/:id" element={<CompraExitosa />} />
            <Route path="/pago-error" element={<PagoError />} />
            <Route path="/carrito" element={<h1>Carrito</h1>} />
            <Route path="/login" element={<h1>Login</h1>} />
        </Routes>,
        "/checkout"
    );
    await esperarApi();
    return montaje;
}

describe("Página Checkout", () => {
    it("redirige al login si no hay sesión iniciada", async () => {
        prepararDatos(null);
        const { contenedor } = await montarCheckout();
        expect(contenedor.querySelector("h1").textContent).toBe("Login");
    });

    it("redirige al carrito si el carrito está vacío", async () => {
        prepararDatos(ADMIN, []);
        const { contenedor } = await montarCheckout();
        expect(contenedor.querySelector("h1").textContent).toBe("Carrito");
    });

    it("tras restaurar la sesión autocompleta los datos del usuario y muestra el total", async () => {
        prepararDatos(ADMIN);
        const { contenedor } = await montarCheckout();

        expect(contenedor.querySelector("#nombre").value).toBe(ADMIN.nombre);
        expect(contenedor.querySelector("#correo").value).toBe(ADMIN.correo);
        expect(contenedor.querySelector("[data-testid='total-compra']").textContent).toContain("$1.099.980");
    });

    it("muestra los errores de validación solo después de intentar pagar", async () => {
        prepararDatos(CLIENTE_SIN_DIRECCION);
        const { contenedor } = await montarCheckout();
        expect(contenedor.querySelectorAll(".invalid-feedback").length).toBe(0);

        enviar(contenedor.querySelector("form"));

        const errores = [...contenedor.querySelectorAll(".invalid-feedback")].map(e => e.textContent);
        expect(errores).toContain("La calle es requerida (máx. 300 caracteres).");
        expect(errores).toContain("Debe seleccionar una región.");
    });

    it("el error de un campo desaparece cuando el usuario lo corrige", async () => {
        prepararDatos(CLIENTE_SIN_DIRECCION);
        const { contenedor } = await montarCheckout();
        enviar(contenedor.querySelector("form"));
        expect(contenedor.querySelector("#calle").classList).toContain("is-invalid");

        escribir(contenedor.querySelector("#calle"), "Av. Los Crisantemos 123");

        expect(contenedor.querySelector("#calle").classList).not.toContain("is-invalid");
    });

    it("con un pago aprobado envía POST /boletas con el token, descuenta stock y muestra la boleta", async () => {
        const { almacen, servidor } = prepararDatos(ADMIN);
        const { contenedor } = await montarCheckout();

        enviar(contenedor.querySelector("form"));
        await esperarApi(40);

        expect(contenedor.textContent).toContain("Se ha realizado la compra");
        expect(contenedor.querySelector("[data-testid='total-boleta']").textContent).toContain("$1.099.980");

        const compra = servidor.peticiones.find(p => p.ruta === "/boletas" && p.metodo === "POST");
        expect(compra.auth).toBeTrue();
        expect(compra.cuerpo.items).toEqual([{ productoId: PS5.id, cantidad: 2 }]);
        expect(servidor.boletas.length).toBe(1);
        expect(servidor.productos.find(p => p.id === PS5.id).stock).toBe(PS5.stock - 2);
        expect(almacen[CLAVES.carrito]).toBeUndefined(); // el carrito se vació
    });

    it("con el pago rechazado muestra la vista de error y NO registra la orden", async () => {
        const { almacen, servidor } = prepararDatos(ADMIN);
        const { contenedor } = await montarCheckout();

        click(contenedor.querySelector("#simularRechazo"));
        enviar(contenedor.querySelector("form"));
        await esperarApi();

        expect(contenedor.textContent).toContain("No se pudo realizar el pago");
        expect(contenedor.textContent).toContain("El banco rechazó la transacción");
        expect(servidor.boletas.length).toBe(0);
        expect(JSON.parse(almacen[CLAVES.carrito]).length).toBe(1); // el carrito se conserva
    });

    it("si el backend rechaza la compra (409 sin stock) muestra su mensaje en la vista de error", async () => {
        const { servidor } = prepararDatos(ADMIN);
        const { contenedor } = await montarCheckout();
        servidor.productos.find(p => p.id === PS5.id).stock = 1; // otro cliente compró antes

        enviar(contenedor.querySelector("form"));
        await esperarApi(40);

        expect(contenedor.textContent).toContain("No hay stock suficiente");
        expect(servidor.boletas.length).toBe(0);
    });

    it("desde el pago con error se puede volver a intentar el pago", async () => {
        prepararDatos(ADMIN);
        const { contenedor } = await montarCheckout();
        click(contenedor.querySelector("#simularRechazo"));
        enviar(contenedor.querySelector("form"));
        await esperarApi();

        click([...contenedor.querySelectorAll("button")].find(b => b.textContent.includes("VOLVER A REALIZAR EL PAGO")));
        await esperarApi();

        expect(contenedor.textContent).toContain("Pagar ahora");
        expect(contenedor.querySelector("#nombre").value).toBe(ADMIN.nombre);
    });
});
