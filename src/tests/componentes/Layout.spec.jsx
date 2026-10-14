
import { Route, Routes } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import MenuUsuario from "../../components/layout/MenuUsuario";
import Navbar from "../../components/layout/Navbar";
import { CLAVES } from "../../data/db";
import { botonPorTexto, click, montarConProveedores, montarConRouter, simularLocalStorage } from "../utilidades";


const ADMIN = { id: 1, nombre: "Admin", correo: "admin@duoc.cl", rol: "Administrador", estado: "Activo" };
const VENDEDOR = { id: 2, nombre: "Vera", correo: "vera@duoc.cl", rol: "Vendedor", estado: "Activo" };


describe("Footer", () => {
    it("versión simple: solo el copyright", () => {
        const { contenedor } = montarConRouter(<Footer />);
        expect(contenedor.querySelectorAll("a").length).toBe(0);
        expect(contenedor.textContent).toContain("Todos los derechos reservados");
    });


    it("versión completa: enlaces de navegación y datos de contacto", () => {
        const { contenedor } = montarConRouter(<Footer completo />);
        const rutas = [...contenedor.querySelectorAll("a")].map(a => a.getAttribute("href"));


        expect(rutas).toEqual(["/", "/productos", "/nosotros", "/contacto"]);
        expect(contenedor.textContent).toContain("nubeplay@gmail.com");
    });
});


describe("MenuUsuario", () => {
    function montarMenu(props = {}) {
        return montarConRouter(
            <MenuUsuario usuario={ADMIN} esAdmin onCerrarSesion={() => {}} onNavegar={() => {}} {...props} />
        );
    }


    it("muestra el nombre del usuario y el menú empieza cerrado", () => {
        const { contenedor } = montarMenu();
        expect(contenedor.querySelector("button").textContent).toContain("Admin");
        expect(contenedor.querySelector(".dropdown-menu").classList).not.toContain("show");
    });


    it("se abre al hacer clic y se cierra al hacer clic fuera", () => {
        const { contenedor } = montarMenu();
        const boton = contenedor.querySelector("button");


        click(boton);
        expect(contenedor.querySelector(".dropdown-menu").classList).toContain("show");
        expect(boton.getAttribute("aria-expanded")).toBe("true");


        click(document.body);
        expect(contenedor.querySelector(".dropdown-menu").classList).not.toContain("show");
    });


    it("solo muestra 'Panel Admin' a los administradores", () => {
        expect(montarMenu().contenedor.textContent).toContain("Panel Admin");
        expect(montarMenu({ esAdmin: false, usuario: VENDEDOR }).contenedor.textContent).not.toContain("Panel Admin");
    });


    it("ejecuta onCerrarSesion y onNavegar al elegir cada opción", () => {
        const onCerrarSesion = jasmine.createSpy("onCerrarSesion");
        const onNavegar = jasmine.createSpy("onNavegar");
        const { contenedor } = montarMenu({ onCerrarSesion, onNavegar });


        click(contenedor.querySelector("button"));
        click(botonPorTexto(contenedor, "Panel Admin"));
        expect(onNavegar).toHaveBeenCalled();


        click(contenedor.querySelector("button"));
        click(botonPorTexto(contenedor, "Cerrar sesión"));
        expect(onCerrarSesion).toHaveBeenCalled();
    });
});


describe("Navbar", () => {
    function montarNavbar(sesion) {
        const datos = { [CLAVES.usuarios]: JSON.stringify([ADMIN, VENDEDOR]) };
        if (sesion) datos[CLAVES.sesion] = JSON.stringify(sesion);
        const almacen = simularLocalStorage(datos);
        const montaje = montarConProveedores(
            <>
                <Navbar />
                <Routes>
                    <Route path="*" element={null} />
                    <Route path="/login" element={<h1>Login</h1>} />
                </Routes>
            </>
        );
        return { ...montaje, almacen };
    }


    it("sin sesión muestra los enlaces de la tienda, el carrito y 'Iniciar sesión'", () => {
        const { contenedor } = montarNavbar(null);
        const textos = [...contenedor.querySelectorAll(".nav-link")].map(a => a.textContent.trim());


        expect(textos).toEqual(jasmine.arrayContaining(["Inicio", "Productos", "Categorías", "Noticias", "Nosotros", "Contacto"]));
        expect(contenedor.querySelector("[data-testid='contador-carrito']")).not.toBeNull();
        expect(botonPorTexto(contenedor, "Iniciar sesión")).not.toBeNull();
    });


    it("al vendedor le muestra solo Productos y Órdenes, sin carrito", () => {
        const { contenedor } = montarNavbar(VENDEDOR);
        const textos = [...contenedor.querySelectorAll(".nav-link")].map(a => a.textContent.trim());


        expect(textos).toEqual(["Productos", "Órdenes"]);
        expect(contenedor.querySelector("[data-testid='contador-carrito']")).toBeNull();
    });


    it("el botón hamburguesa abre y cierra el menú en móviles", () => {
        const { contenedor } = montarNavbar(null);
        const toggler = contenedor.querySelector(".navbar-toggler");


        click(toggler);
        expect(contenedor.querySelector(".navbar-collapse").classList).toContain("show");
        click(toggler);
        expect(contenedor.querySelector(".navbar-collapse").classList).not.toContain("show");
    });


    it("cerrar sesión borra la sesión guardada y lleva al login", () => {
        const { contenedor, almacen } = montarNavbar(ADMIN);


        click(contenedor.querySelector(".dropdown-toggle"));
        click(botonPorTexto(contenedor, "Cerrar sesión"));


        expect(almacen[CLAVES.sesion]).toBeUndefined();
        expect(contenedor.querySelector("h1").textContent).toBe("Login");
    });
});




