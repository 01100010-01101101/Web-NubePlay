
import { Route, Routes } from "react-router-dom";
import Registro from "../../pages/Registro";
import Contacto, { validarContacto } from "../../pages/Contacto";
import Carrito from "../../pages/Carrito";
import Login from "../../pages/Login";
import { CLAVES, inicializarDatos } from "../../data/db";
import { usuariosIniciales } from "../../data/semillas";
import { botonPorTexto, click, enviar, escribir, montarConProveedores, seleccionar, simularLocalStorage } from "../utilidades";


const ADMIN = usuariosIniciales[0];


describe("Registro", () => {
    let almacen;


    beforeEach(() => {
        almacen = simularLocalStorage();
        inicializarDatos();
    });


    function montarRegistro() {
        return montarConProveedores(
            <Routes>
                <Route path="/registro" element={<Registro />} />
                <Route path="/login" element={<Login />} />
            </Routes>,
            "/registro"
        );
    }


    function llenar(contenedor, cambios = {}) {
        const datos = {
            run: "190110222", nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com",
            password: "1234", confirmPassword: "1234", direccion: "Av. Siempre Viva 123", ...cambios
        };
        Object.entries(datos).forEach(([campo, valor]) => escribir(contenedor.querySelector(`#${campo}`), valor));
        seleccionar(contenedor.querySelector("#region"), "Valparaíso");
        seleccionar(contenedor.querySelector("#comuna"), "Quilpué");
    }


    it("no muestra errores hasta que se envía", () => {
        const { contenedor } = montarRegistro();
        expect(contenedor.querySelectorAll(".is-invalid").length).toBe(0);


        enviar(contenedor.querySelector("form"));


        expect(contenedor.querySelectorAll(".is-invalid").length).toBe(9);
    });


    it("registra al usuario y lo envía al login con mensaje de éxito", () => {
        const { contenedor } = montarRegistro();
        llenar(contenedor);
        enviar(contenedor.querySelector("form"));


        const usuarios = JSON.parse(almacen[CLAVES.usuarios]);
        expect(usuarios.find(u => u.correo === "ana@gmail.com")).toEqual(
            jasmine.objectContaining({ run: "190110222", rol: "Cliente", comuna: "Quilpué" })
        );
        expect(contenedor.textContent).toContain("¡Registro completado con éxito!");
    });


    it("rechaza un correo ya registrado", () => {
        const { contenedor } = montarRegistro();
        llenar(contenedor, { correo: ADMIN.correo.toUpperCase() });
        enviar(contenedor.querySelector("form"));


        expect(contenedor.textContent).toContain("El correo electrónico ya se encuentra registrado.");
    });


    it("rechaza un RUN ya registrado", () => {
        const { contenedor } = montarRegistro();
        llenar(contenedor, { run: ADMIN.run });
        enviar(contenedor.querySelector("form"));


        expect(contenedor.textContent).toContain("El RUN ya se encuentra registrado.");
    });
});


describe("Contacto", () => {
    it("validarContacto: el correo es opcional, pero si se escribe debe ser válido", () => {
        expect(validarContacto({ nombre: "Ana", correo: "", comentario: "Hola" })).toEqual({});
        expect(validarContacto({ nombre: "Ana", correo: "x@hotmail.com", comentario: "Hola" }).correo).toBeDefined();
        expect(Object.keys(validarContacto({ nombre: "", correo: "", comentario: "" }))).toEqual(["nombre", "comentario"]);
    });


    it("muestra errores al enviar vacío", () => {
        const { contenedor } = montarConProveedores(<Contacto />);
        enviar(contenedor.querySelector("form"));
        expect(contenedor.querySelectorAll(".invalid-feedback").length).toBe(2);
    });


    it("cuenta los caracteres del mensaje y al enviar muestra éxito y limpia el formulario", () => {
        const { contenedor } = montarConProveedores(<Contacto />);
        escribir(contenedor.querySelector("#nombre"), "Ana");
        escribir(contenedor.querySelector("#comentario"), "Hola NUBEPLAY");
        expect(contenedor.textContent).toContain("13/500 caracteres");


        enviar(contenedor.querySelector("form"));


        expect(contenedor.querySelector(".alert-success").textContent).toContain("Mensaje enviado con éxito");
        expect(contenedor.querySelector("#nombre").value).toBe("");


        escribir(contenedor.querySelector("#nombre"), "B");
        expect(contenedor.querySelector(".alert-success")).toBeNull();
    });
});


describe("Carrito (página)", () => {
    let almacen;


    function montarCarrito(carrito, sesion = null) {
        almacen = simularLocalStorage();
        inicializarDatos();
        almacen[CLAVES.carrito] = JSON.stringify(carrito);
        if (sesion) almacen[CLAVES.sesion] = JSON.stringify(sesion);


        return montarConProveedores(
            <Routes>
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/checkout" element={<h1>Checkout</h1>} />
                <Route path="/login" element={<h1>Login</h1>} />
            </Routes>,
            "/carrito"
        );
    }


    it("muestra el estado vacío y deshabilita el pago", () => {
        const { contenedor } = montarCarrito([]);
        expect(contenedor.textContent).toContain("Tu carrito está vacío");
        expect(botonPorTexto(contenedor, "Proceder al Pago").disabled).toBeTrue();
    });


    it("cambia cantidades y elimina productos", () => {
        const { contenedor } = montarCarrito([{ id: 1, cantidad: 1 }, { id: 3, cantidad: 2 }]);
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(2);


        click(contenedor.querySelectorAll("[aria-label='Sumar']")[0]);
        expect(contenedor.querySelectorAll("[aria-label='Cantidad']")[0].value).toBe("2");


        click(contenedor.querySelector("[aria-label^='Eliminar']"));
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);
    });


    it("aplica el cupón NUBEPLAY123 y lo recuerda en localStorage", () => {
        const { contenedor } = montarCarrito([{ id: 3, cantidad: 1 }]); // Zelda $59.990
        escribir(contenedor.querySelector("#inputCupon"), "NUBEPLAY123");
        click(botonPorTexto(contenedor, "Aplicar"));


        expect(contenedor.textContent).toContain("Descuento (10%)");
        expect(contenedor.textContent).toContain("$53.991");
        expect(almacen[CLAVES.cupon]).toBe("true");
    });


    it("vacía el carrito solo si el usuario confirma (mock de window.confirm)", () => {
        const confirmar = spyOn(window, "confirm").and.returnValue(false);
        const { contenedor } = montarCarrito([{ id: 1, cantidad: 1 }]);


        click(botonPorTexto(contenedor, "Vaciar Carrito"));
        expect(confirmar).toHaveBeenCalled();
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);


        confirmar.and.returnValue(true);
        click(botonPorTexto(contenedor, "Vaciar Carrito"));
        expect(contenedor.textContent).toContain("Tu carrito está vacío");
    });


    it("sin sesión, 'Proceder al Pago' lleva al login", () => {
        const { contenedor } = montarCarrito([{ id: 1, cantidad: 1 }]);
        click(botonPorTexto(contenedor, "Proceder al Pago"));
        expect(contenedor.querySelector("h1").textContent).toBe("Login");
    });


    it("con sesión, 'Proceder al Pago' lleva al checkout", () => {
        const { contenedor } = montarCarrito([{ id: 1, cantidad: 1 }], ADMIN);
        click(botonPorTexto(contenedor, "Proceder al Pago"));
        expect(contenedor.querySelector("h1").textContent).toBe("Checkout");
    });


    it("bloquea el pago si el stock bajó mientras el producto estaba en el carrito", () => {
        const { contenedor } = montarCarrito([{ id: 1, cantidad: 5 }], ADMIN);
        // Otro cliente compró: el stock de la PS5 baja a 2.
        const productos = JSON.parse(almacen[CLAVES.productos]);
        productos[0].stock = 2;
        almacen[CLAVES.productos] = JSON.stringify(productos);


        click(botonPorTexto(contenedor, "Proceder al Pago"));


        expect(contenedor.querySelector(".alert-danger").textContent).toContain("ya no tienen stock suficiente");
        expect(contenedor.querySelector("[aria-label='Cantidad']").value).toBe("2");
    });
});



