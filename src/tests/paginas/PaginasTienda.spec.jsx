
import { Route, Routes } from "react-router-dom";
import Inicio from "../../pages/Inicio";
import Productos from "../../pages/Productos";
import Categorias from "../../pages/Categorias";
import DetalleProducto from "../../pages/DetalleProducto";
import Blogs from "../../pages/Blogs";
import DetalleBlog from "../../pages/DetalleBlog";
import Nosotros from "../../pages/Nosotros";
import NoEncontrado from "../../pages/NoEncontrado";
import CompraExitosa from "../../pages/CompraExitosa";
import PagoError from "../../pages/PagoError";
import { CLAVES, crearOrden, inicializarDatos } from "../../data/db";
import { blogs } from "../../data/blogs";
import { productosIniciales } from "../../data/semillas";
import { botonPorTexto, click, enviar, escribir, montarConProveedores, seleccionar, simularLocalStorage } from "../utilidades";


// Monta una página en su ruta (con parámetros) dentro de los proveedores.
function montarPagina(patron, elemento, ruta, extras = null) {
    return montarConProveedores(
        <Routes>
            <Route path={patron} element={elemento} />
            {extras}
        </Routes>,
        ruta
    );
}


function contador(contenedor) {
    return JSON.parse(localStorage.getItem(CLAVES.carrito) || "[]").reduce((t, i) => t + i.cantidad, 0);
}


describe("Páginas de la tienda", () => {
    let almacen;


    beforeEach(() => {
        almacen = simularLocalStorage();
        inicializarDatos();
    });


    describe("Inicio", () => {
        it("muestra hasta 4 productos destacados con stock", () => {
            const { contenedor } = montarPagina("/", <Inicio />, "/");
            expect(contenedor.querySelectorAll(".producto-card").length).toBe(4);
        });


        it("agregar un destacado al carrito muestra un aviso flotante", () => {
            const { contenedor } = montarPagina("/", <Inicio />, "/");
            click(botonPorTexto(contenedor, "Agregar al Carrito"));


            expect(contenedor.querySelector(".alert-success").textContent).toContain("añadido al carrito");
            expect(contador(contenedor)).toBe(1);
        });
    });


    describe("Productos", () => {
        it("lista todo el catálogo y filtra por texto y categoría", () => {
            const { contenedor } = montarPagina("/productos", <Productos />, "/productos");
            expect(contenedor.querySelectorAll(".producto-card").length).toBe(productosIniciales.length);


            escribir(contenedor.querySelector("[aria-label='Buscar producto']"), "series x");
            expect(contenedor.querySelectorAll(".producto-card").length).toBe(1);


            escribir(contenedor.querySelector("[aria-label='Buscar producto']"), "");
            seleccionar(contenedor.querySelector("select"), "consolas");
            const consolas = productosIniciales.filter(p => p.categoria === "consolas").length;
            expect(contenedor.querySelectorAll(".producto-card").length).toBe(consolas);
        });


        it("muestra un aviso de error si el producto ya no tiene stock suficiente", () => {
            const { contenedor } = montarPagina("/productos", <Productos />, "/productos");
            escribir(contenedor.querySelector("[aria-label='Buscar producto']"), "series x");
            const boton = botonPorTexto(contenedor, "Agregar al Carrito");


            for (let i = 0; i < 9; i++) click(boton); // la Xbox tiene stock 8


            expect(contenedor.querySelector(".alert-danger").textContent).toContain("No hay stock suficiente");
            expect(contador(contenedor)).toBe(8);
        });


        it("el vendedor ve el catálogo sin botones para comprar", () => {
            almacen[CLAVES.usuarios] = JSON.stringify([{ id: 9, nombre: "V", rol: "Vendedor", estado: "Activo" }]);
            almacen[CLAVES.sesion] = JSON.stringify({ id: 9 });
            const { contenedor } = montarPagina("/productos", <Productos />, "/productos");
            expect(botonPorTexto(contenedor, "Agregar al Carrito")).toBeNull();
        });
    });


    describe("Categorías", () => {
        it("sin categoría elegida muestra solo las tarjetas de categorías", () => {
            const { contenedor } = montarPagina("/categorias", <Categorias />, "/categorias");
            expect(contenedor.querySelectorAll("a.card").length).toBe(3);
            expect(contenedor.querySelectorAll(".producto-card").length).toBe(0);
        });


        it("con una categoría muestra solo sus productos y la marca como activa", () => {
            const { contenedor } = montarPagina("/categorias/:categoria", <Categorias />, "/categorias/consolas");
            const nombres = [...contenedor.querySelectorAll(".card-title")].map(t => t.textContent);


            const esperados = productosIniciales.filter(p => p.categoria === "consolas").map(p => p.nombre);
            expect(nombres).toEqual(esperados);
            expect(contenedor.querySelector("a[aria-current='page']").textContent).toContain("Consolas");
        });


        it("agrega productos de la categoría al carrito", () => {
            const { contenedor } = montarPagina("/categorias/:categoria", <Categorias />, "/categorias/juegos");
            click(botonPorTexto(contenedor, "Agregar al Carrito"));
            expect(contenedor.querySelector(".alert-success")).not.toBeNull();
        });


        it("informa cuando la categoría no existe", () => {
            const { contenedor } = montarPagina("/categorias/:categoria", <Categorias />, "/categorias/inventada");
            expect(contenedor.textContent).toContain("Categoría no encontrada");
        });
    });


    describe("DetalleProducto", () => {
        const montarDetalle = id => montarPagina("/productos/:id", <DetalleProducto />, `/productos/${id}`);


        it("muestra los datos del producto", () => {
            const { contenedor } = montarDetalle(1);
            expect(contenedor.querySelector("h2").textContent).toBe("PlayStation 5");
            expect(contenedor.textContent).toContain("$549.990");
            expect(contenedor.textContent).toContain("En stock: 10");
        });


        it("agrega la cantidad elegida al carrito", () => {
            const { contenedor } = montarDetalle(1);
            click(contenedor.querySelector("[aria-label='Sumar']"));
            click(contenedor.querySelector("[aria-label='Sumar']"));
            click(botonPorTexto(contenedor, "Añadir al Carrito"));


            expect(contenedor.querySelector(".alert-success").textContent).toContain("Se agregaron 3 unidad(es)");
            expect(contador(contenedor)).toBe(3);
        });


        it("avisa al intentar superar el stock con el selector", () => {
            almacen[CLAVES.productos] = JSON.stringify([{ ...productosIniciales[0], stock: 1 }]);
            const { contenedor } = montarDetalle(1);
            click(contenedor.querySelector("[aria-label='Sumar']"));
            expect(contenedor.querySelector(".alert-warning").textContent).toContain("No puedes superar el stock");
        });


        it("bloquea la compra de un producto agotado", () => {
            almacen[CLAVES.productos] = JSON.stringify([{ ...productosIniciales[0], stock: 0 }]);
            const { contenedor } = montarDetalle(1);
            expect(botonPorTexto(contenedor, "Producto agotado").disabled).toBeTrue();
        });


        it("publica una reseña y la muestra en la lista", () => {
            const { contenedor } = montarDetalle(1);
            expect(contenedor.textContent).toContain("aún no tiene reseñas");


            escribir(contenedor.querySelector("[name='nombre']"), "Ana");
            escribir(contenedor.querySelector("[name='comentario']"), "¡Me encantó!");
            enviar(contenedor.querySelector("form"));


            expect(contenedor.textContent).toContain("¡Me encantó!");
            expect(contenedor.querySelector(".alert-success").textContent).toContain("reseña fue publicada");
            expect(JSON.parse(almacen[CLAVES.resenas])[0].productoId).toBe(1);
        });


        it("muestra 'Producto no encontrado' para un id inexistente", () => {
            expect(montarDetalle(9999).contenedor.textContent).toContain("Producto no encontrado");
        });
    });


    describe("Blogs, Nosotros y NoEncontrado", () => {
        it("Blogs renderiza una tarjeta por noticia", () => {
            const { contenedor } = montarPagina("/blogs", <Blogs />, "/blogs");
            expect(contenedor.querySelectorAll(".card").length).toBe(blogs.length);
        });


        it("DetalleBlog muestra todos los párrafos y puntos de la noticia", () => {
            const blog = blogs[1];
            const { contenedor } = montarPagina("/blogs/:id", <DetalleBlog />, `/blogs/${blog.id}`);


            expect(contenedor.querySelector("h1").textContent).toBe(blog.tituloDetalle);
            expect(contenedor.querySelectorAll("li:not(.breadcrumb-item)").length).toBe(blog.puntos.length);
            blog.parrafos.forEach(parrafo => expect(contenedor.textContent).toContain(parrafo));
        });


        it("DetalleBlog informa si la noticia no existe", () => {
            const { contenedor } = montarPagina("/blogs/:id", <DetalleBlog />, "/blogs/999");
            expect(contenedor.textContent).toContain("Noticia no encontrada");
        });


        it("Nosotros muestra una tarjeta por integrante del equipo", () => {
            const { contenedor } = montarPagina("/nosotros", <Nosotros />, "/nosotros");
            const nombres = [...contenedor.querySelectorAll(".card-title")].map(t => t.textContent);
            expect(nombres).toEqual(["Sebastian Garcia", "Marcos Alvial"]);
        });


        it("NoEncontrado ofrece volver al inicio", () => {
            const { contenedor } = montarPagina("*", <NoEncontrado />, "/xyz");
            expect(contenedor.querySelector("a").getAttribute("href")).toBe("/");
        });
    });


    describe("CompraExitosa y PagoError", () => {
        it("CompraExitosa muestra la boleta y simula el envío por email", () => {
            const orden = crearOrden({
                fecha: "2026-10-13", cliente: "Ana Pérez", correo: "ana@gmail.com", total: 119000, subtotal: 119000,
                comprador: { nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com" },
                envio: { calle: "Calle 1", departamento: "603", comuna: "Santiago", region: "RM", indicaciones: "Tocar timbre" },
                items: [{ id: 1, nombre: "PlayStation 5", precio: 119000, cantidad: 1 }]
            });
            const { contenedor } = montarPagina("/compra-exitosa/:id", <CompraExitosa />, `/compra-exitosa/${orden.id}`);


            expect(contenedor.textContent).toContain("Se ha realizado la compra");
            expect(contenedor.textContent).toContain("depto. 603");
            expect(contenedor.textContent).toContain("IVA incluido (19%)");
            expect(contenedor.querySelector(".alert")).toBeNull();


            click(botonPorTexto(contenedor, "Enviar boleta por email"));
            expect(contenedor.querySelector(".alert-success").textContent).toContain("ana@gmail.com");
        });


        it("CompraExitosa informa si la orden no existe", () => {
            const { contenedor } = montarPagina("/compra-exitosa/:id", <CompraExitosa />, "/compra-exitosa/123");
            expect(contenedor.textContent).toContain("Orden no encontrada");
        });


        it("PagoError sin datos de la compra redirige al carrito", () => {
            const { contenedor } = montarPagina("/pago-error", <PagoError />, "/pago-error",
                <Route path="/carrito" element={<h1>Carrito</h1>} />);
            expect(contenedor.querySelector("h1").textContent).toBe("Carrito");
        });
    });
});



