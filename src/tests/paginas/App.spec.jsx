
import App from "../../App";
import { inicializarDatos } from "../../data/db";
import { montarConProveedores, simularLocalStorage } from "../utilidades";


function montarRuta(ruta) {
    return montarConProveedores(<App />, ruta);
}


describe("App (rutas)", () => {
    beforeEach(() => {
        simularLocalStorage();
        inicializarDatos();
    });


    const RUTAS = [
        ["/", "Productos destacados"],
        ["/productos", "Catálogo de Productos"],
        ["/productos/1", "PlayStation 5"],
        ["/categorias", "Categorías"],
        ["/categorias/consolas", "Consolas"],
        ["/carrito", "Tu Carrito de Compras"],
        ["/login", "Iniciar sesión"],
        ["/registro", "Registro de Usuario"],
        ["/nosotros", "Sobre NUBEPLAY"],
        ["/blogs", "Noticias Gaming & Tech"],
        ["/blogs/1", "Grand Theft Auto VI"],
        ["/contacto", "Formulario de Contacto"],
        ["/una-ruta-que-no-existe", "Página no encontrada"]
    ];


    RUTAS.forEach(([ruta, textoEsperado]) => {
        it(`la ruta ${ruta} muestra "${textoEsperado}"`, () => {
            const { contenedor } = montarRuta(ruta);
            expect(contenedor.textContent).toContain(textoEsperado);
            expect(contenedor.querySelector("nav.navbar")).not.toBeNull();
            expect(contenedor.querySelector("footer")).not.toBeNull();
        });
    });


    it("en el inicio la Navbar es fija y el Footer es el completo", () => {
        const { contenedor } = montarRuta("/");
        expect(contenedor.querySelector("nav.navbar").classList).toContain("fixed-top");
        expect(contenedor.querySelector("footer").textContent).toContain("Enlaces");
    });


    it("en otras páginas la Navbar no es fija y el Footer es el simple", () => {
        const { contenedor } = montarRuta("/productos");
        expect(contenedor.querySelector("nav.navbar").classList).not.toContain("fixed-top");
        expect(contenedor.querySelector("footer").textContent).not.toContain("Enlaces");
    });


    it("/admin sin sesión redirige al login con un aviso", () => {
        const { contenedor } = montarRuta("/admin");
        expect(contenedor.textContent).toContain("Acceso denegado");
        expect(contenedor.querySelector("#email")).not.toBeNull();
    });
});

