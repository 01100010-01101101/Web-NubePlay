import PanelProductos from "../../components/admin/PanelProductos";
import PanelCategorias from "../../components/admin/PanelCategorias";
import PanelUsuarios from "../../components/admin/PanelUsuarios";
import PanelOrdenes from "../../components/admin/PanelOrdenes";
import PanelReportes from "../../components/admin/PanelReportes";
import PanelPerfil from "../../components/admin/PanelPerfil";
import { CLAVES, crearOrden, inicializarDatos } from "../../data/db";
import { productosIniciales, usuariosIniciales } from "../../data/semillas";
import { botonPorTexto, click, enviar, escribir, montarConProveedores, seleccionar, simularLocalStorage } from "../utilidades";


const ADMIN = usuariosIniciales[0];
const CLIENTE = {
    id: 7, run: "190110222", nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", password: "1234",
    direccion: "Calle 1", region: "Valparaíso", comuna: "Quilpué", rol: "Cliente", estado: "Activo",
    compras: [{ fecha: "2026-10-01", producto: "Zelda", cantidad: 1, total: 59990 }]
};


describe("Paneles del administrador", () => {
    let almacen, mostrar, onCambio;


    beforeEach(() => {
        almacen = simularLocalStorage();
        inicializarDatos();
        almacen[CLAVES.usuarios] = JSON.stringify([ADMIN, CLIENTE]);
        almacen[CLAVES.sesion] = JSON.stringify(ADMIN);
        mostrar = jasmine.createSpy("mostrar");
        onCambio = jasmine.createSpy("onCambio");
    });


    const guardados = clave => JSON.parse(almacen[clave]);


    describe("PanelProductos", () => {
        function montarPanel(props = {}) {
            return montarConProveedores(
                <PanelProductos esAdmin soloCriticos={false} onSoloCriticosChange={() => {}} mostrar={mostrar} onCambio={onCambio} {...props} />
            );
        }


        it("lista el inventario y busca por nombre o código", () => {
            const { contenedor } = montarPanel();
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(productosIniciales.length);


            escribir(contenedor.querySelector("[aria-label='Buscar producto']"), "zel-001");
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);
        });


        it("con soloCriticos muestra solo los productos en stock crítico", () => {
            almacen[CLAVES.productos] = JSON.stringify(productosIniciales.map((p, i) => (i === 0 ? { ...p, stock: 1 } : p)));
            const { contenedor } = montarPanel({ soloCriticos: true });


            expect(contenedor.querySelector("h5").textContent).toBe("Productos con stock crítico");
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);
        });


        it("el switch de stock crítico avisa el cambio", () => {
            const onSoloCriticosChange = jasmine.createSpy("onSoloCriticosChange");
            const { contenedor } = montarPanel({ onSoloCriticosChange });
            click(contenedor.querySelector("#soloCriticos"));
            expect(onSoloCriticosChange).toHaveBeenCalledWith(true);
        });


        it("crea un producto nuevo desde el modal", () => {
            const { contenedor } = montarPanel();
            click(botonPorTexto(contenedor, "Agregar Producto"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Agregar Producto");


            escribir(contenedor.querySelector("#prodCodigo"), "NSW-001");
            escribir(contenedor.querySelector("#prodNombre"), "Nintendo Switch");
            escribir(contenedor.querySelector("#prodPrecio"), "299990");
            escribir(contenedor.querySelector("#prodStock"), "6");
            escribir(contenedor.querySelector("#prodStockCritico"), "2");
            enviar(contenedor.querySelector(".modal form"));


            expect(guardados(CLAVES.productos).some(p => p.nombre === "Nintendo Switch")).toBeTrue();
            expect(contenedor.querySelector(".modal")).toBeNull();
            expect(mostrar).toHaveBeenCalledWith("Producto guardado correctamente.");
            expect(onCambio).toHaveBeenCalled();
        });


        it("no permite repetir el código de otro producto", () => {
            const { contenedor } = montarPanel();
            click(botonPorTexto(contenedor, "Agregar Producto"));
            escribir(contenedor.querySelector("#prodCodigo"), "ps5-001");
            escribir(contenedor.querySelector("#prodNombre"), "Copia");
            escribir(contenedor.querySelector("#prodPrecio"), "1");
            escribir(contenedor.querySelector("#prodStock"), "1");
            enviar(contenedor.querySelector(".modal form"));


            expect(contenedor.textContent).toContain("Ya existe otro producto con ese código.");
        });


        it("edita un producto y advierte si queda en stock crítico", () => {
            const { contenedor } = montarPanel();
            click(contenedor.querySelector("[aria-label='Editar PlayStation 5']"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Editar Producto");


            escribir(contenedor.querySelector("#prodStock"), "1");
            enviar(contenedor.querySelector(".modal form"));


            expect(guardados(CLAVES.productos).find(p => p.id === 1).stock).toBe(1);
            expect(mostrar).toHaveBeenCalledWith('Advertencia: "PlayStation 5" quedó en stock crítico.', "warning");
        });


        it("cierra el modal con Cancelar sin guardar", () => {
            const { contenedor } = montarPanel();
            click(botonPorTexto(contenedor, "Agregar Producto"));
            click(botonPorTexto(contenedor, "Cancelar"));
            expect(contenedor.querySelector(".modal")).toBeNull();
            expect(onCambio).not.toHaveBeenCalled();
        });


        it("elimina un producto solo si se confirma", () => {
            const confirmar = spyOn(window, "confirm").and.returnValue(false);
            const { contenedor } = montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar Xbox Series X']"));
            expect(guardados(CLAVES.productos).length).toBe(productosIniciales.length);


            confirmar.and.returnValue(true);
            click(contenedor.querySelector("[aria-label='Eliminar Xbox Series X']"));
            expect(guardados(CLAVES.productos).some(p => p.id === 2)).toBeFalse();
            expect(mostrar).toHaveBeenCalledWith("Producto eliminado.");
        });


        it("el vendedor no ve el botón de agregar ni las acciones de edición", () => {
            const { contenedor } = montarPanel({ esAdmin: false });
            expect(botonPorTexto(contenedor, "Agregar Producto")).toBeNull();
            expect(contenedor.querySelector("[aria-label^='Editar']")).toBeNull();
        });
    });


    describe("PanelCategorias", () => {
        const montarPanel = () => montarConProveedores(<PanelCategorias mostrar={mostrar} onCambio={onCambio} />);


        it("crea una categoría nueva", () => {
            const { contenedor } = montarPanel();
            click(botonPorTexto(contenedor, "Nueva Categoría"));
            escribir(contenedor.querySelector("#catNombre"), "Notebooks");
            enviar(contenedor.querySelector(".modal form"));


            expect(guardados(CLAVES.categorias).find(c => c.valor === "notebooks")).toBeDefined();
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(4);
            expect(mostrar).toHaveBeenCalledWith('Categoría "Notebooks" creada.');
        });


        it("edita el nombre de una categoría", () => {
            const { contenedor } = montarPanel();
            click(contenedor.querySelector("[aria-label='Editar categoría Consolas']"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Editar Categoría");


            escribir(contenedor.querySelector("#catNombre"), "Consolas Next-Gen");
            enviar(contenedor.querySelector(".modal form"));


            expect(guardados(CLAVES.categorias).find(c => c.valor === "consolas").nombre).toBe("Consolas Next-Gen");
        });


        it("no elimina una categoría con productos y lo informa", () => {
            spyOn(window, "confirm").and.returnValue(true);
            const { contenedor } = montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar categoría Consolas']"));


            expect(mostrar).toHaveBeenCalledWith(jasmine.stringContaining("tiene 2 producto(s)"), "danger");
            expect(guardados(CLAVES.categorias).length).toBe(3);
        });


        it("elimina una categoría vacía", () => {
            spyOn(window, "confirm").and.returnValue(true);
            almacen[CLAVES.productos] = JSON.stringify(productosIniciales.filter(p => p.categoria !== "accesorios"));
            const { contenedor } = montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar categoría Accesorios']"));


            expect(guardados(CLAVES.categorias).length).toBe(2);
            expect(mostrar).toHaveBeenCalledWith('Categoría "Accesorios" eliminada.');
        });
    });


    describe("PanelUsuarios", () => {
        const montarPanel = () => montarConProveedores(<PanelUsuarios mostrar={mostrar} onCambio={onCambio} />);


        it("lista y busca usuarios por nombre, correo o RUN", () => {
            const { contenedor } = montarPanel();
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(2);


            escribir(contenedor.querySelector("[aria-label='Buscar usuario']"), "190110222");
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);
        });


        it("el formulario de nuevo usuario exige región y comuna", () => {
            const { contenedor } = montarPanel();
            click(botonPorTexto(contenedor, "Nuevo Usuario"));
            enviar(contenedor.querySelector(".modal form"));


            expect(contenedor.querySelector(".modal #usr-region").classList).toContain("is-invalid");
            expect(contenedor.querySelector(".modal #usr-comuna").classList).toContain("is-invalid");
        });


        it("crea un usuario nuevo con el rol elegido", () => {
            const { contenedor } = montarPanel();
            click(botonPorTexto(contenedor, "Nuevo Usuario"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Nuevo Usuario");


            const campos = { nombre: "Luis", apellidos: "Soto", run: "10000013K", correo: "luis@duoc.cl", direccion: "Calle 2", password: "abcd" };
            Object.entries(campos).forEach(([id, valor]) => escribir(contenedor.querySelector(`.modal #${id}`), valor));
            seleccionar(contenedor.querySelector(".modal #usr-region"), "Valparaíso");
            seleccionar(contenedor.querySelector(".modal #usr-comuna"), "Viña del Mar");
            seleccionar(contenedor.querySelector(".modal #rol"), "Vendedor");
            enviar(contenedor.querySelector(".modal form"));


            const creado = guardados(CLAVES.usuarios).find(u => u.correo === "luis@duoc.cl");
            expect(creado).toEqual(jasmine.objectContaining({ rol: "Vendedor", comuna: "Viña del Mar", run: "10000013K" }));
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(3);
            expect(mostrar).toHaveBeenCalledWith("Usuario luis@duoc.cl creado correctamente.");
        });


        it("detecta correo o RUN duplicados", () => {
            const { contenedor } = montarPanel();
            click(contenedor.querySelectorAll("tbody tr")[1].querySelector("button"));


            escribir(contenedor.querySelector(".modal #correo"), ADMIN.correo);
            enviar(contenedor.querySelector(".modal form"));
            expect(contenedor.textContent).toContain("Ya existe un usuario con ese correo.");


            escribir(contenedor.querySelector(".modal #correo"), "ana@gmail.com");
            escribir(contenedor.querySelector(".modal #run"), ADMIN.run);
            enviar(contenedor.querySelector(".modal form"));
            expect(contenedor.textContent).toContain("Ya existe un usuario con ese RUN.");
        });


        it("abre el expediente con el historial de compras y actualiza el usuario", () => {
            const { contenedor } = montarPanel();
            click(contenedor.querySelectorAll("tbody tr")[1].querySelector("button"));


            expect(contenedor.querySelector(".modal-title").textContent).toBe("Expediente Completo del Usuario");
            expect(contenedor.querySelector(".modal").textContent).toContain("Historial de Compras");
            expect(contenedor.querySelector(".modal").textContent).toContain("$59.990");


            escribir(contenedor.querySelector(".modal #nombre"), "Ana María");
            enviar(contenedor.querySelector(".modal form"));


            expect(guardados(CLAVES.usuarios).find(u => u.id === CLIENTE.id).nombre).toBe("Ana María");
            expect(mostrar).toHaveBeenCalledWith("Usuario actualizado correctamente.");
        });


        it("al editar su propia cuenta conserva el rol de administrador", () => {
            const { contenedor } = montarPanel();
            click(contenedor.querySelectorAll("tbody tr")[0].querySelector("button"));
            enviar(contenedor.querySelector(".modal form"));


            expect(guardados(CLAVES.usuarios).find(u => u.id === ADMIN.id).rol).toBe("Administrador");
        });


        it("elimina a otro usuario si se confirma", () => {
            spyOn(window, "confirm").and.returnValue(true);
            const { contenedor } = montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar ana@gmail.com']"));


            expect(guardados(CLAVES.usuarios).length).toBe(1);
            expect(mostrar).toHaveBeenCalledWith("Usuario ana@gmail.com eliminado.");
        });
    });


    describe("PanelOrdenes", () => {
        beforeEach(() => {
            crearOrden({ fecha: "2026-10-01", cliente: "Ana Pérez", correo: "ana@gmail.com", total: 59990, items: [] });
            crearOrden({ fecha: "2026-10-02", cliente: "Luis Soto", correo: "luis@duoc.cl", total: 549990, items: [] });
        });


        it("lista las órdenes (la más reciente primero) y filtra por cliente", () => {
            const { contenedor } = montarConProveedores(<PanelOrdenes />);
            const filas = () => contenedor.querySelectorAll("tbody tr");


            expect(filas().length).toBe(2);
            expect(filas()[0].textContent).toContain("2026-10-02");


            escribir(contenedor.querySelector("[aria-label='Buscar orden']"), "ana");
            expect(filas().length).toBe(1);
        });


        it("muestra la boleta en un modal y la cierra", () => {
            const { contenedor } = montarConProveedores(<PanelOrdenes />);


            click(botonPorTexto(contenedor, "Ver detalle"));
            expect(contenedor.querySelector("[data-testid='boleta']")).not.toBeNull();


            click(contenedor.querySelector(".modal .btn-close"));
            expect(contenedor.querySelector(".modal")).toBeNull();
        });
    });


    describe("PanelReportes", () => {
        it("calcula los indicadores a partir de las órdenes", () => {
            crearOrden({ total: 100000, descuento: 10000, items: [{ id: 1, nombre: "PS5", categoria: "consolas", precio: 100000, cantidad: 1 }] });
            crearOrden({ total: 50000, items: [{ id: 3, nombre: "Zelda", categoria: "juegos", precio: 25000, cantidad: 2 }] });
            const { contenedor } = montarConProveedores(<PanelReportes />);
            const valores = [...contenedor.querySelectorAll("h2")].map(h => h.textContent);


            expect(valores).toEqual(["$150.000", "2", "$75.000", "3"]);
            expect(contenedor.textContent).toContain("Descuentos: $10.000");
            expect(contenedor.textContent).toContain("Consolas");
        });


        it("sin órdenes muestra los rankings vacíos", () => {
            const { contenedor } = montarConProveedores(<PanelReportes />);
            expect(contenedor.textContent).toContain("Sin datos todavía.");
        });
    });


    describe("PanelPerfil", () => {
        const montarPanel = () => montarConProveedores(<PanelPerfil mostrar={mostrar} onCambio={onCambio} />);


        it("muestra los datos del usuario conectado", () => {
            const { contenedor } = montarPanel();
            expect(contenedor.querySelector("#perfilNombre").value).toBe(ADMIN.nombre);
            expect(contenedor.textContent).toContain(ADMIN.correo);
            expect(contenedor.textContent).toContain("Santiago, Metropolitana de Santiago");
        });


        it("actualiza el nombre", () => {
            const { contenedor } = montarPanel();
            escribir(contenedor.querySelector("#perfilNombre"), "Sebastián");
            enviar(contenedor.querySelector("form"));


            expect(guardados(CLAVES.usuarios)[0].nombre).toBe("Sebastián");
            expect(mostrar).toHaveBeenCalledWith("Perfil actualizado.");
        });


        it("rechaza el cambio de contraseña si la actual es incorrecta", () => {
            const { contenedor } = montarPanel();
            escribir(contenedor.querySelector("#perfilPasswordActual"), "mala");
            escribir(contenedor.querySelector("#perfilPasswordNueva"), "nueva1");
            escribir(contenedor.querySelector("#perfilConfirmar"), "nueva1");
            enviar(contenedor.querySelector("form"));


            expect(contenedor.textContent).toContain("La contraseña actual no es correcta.");
            expect(mostrar).not.toHaveBeenCalled();
        });


        it("cambia la contraseña y limpia los campos", () => {
            const { contenedor } = montarPanel();
            escribir(contenedor.querySelector("#perfilPasswordActual"), ADMIN.password);
            escribir(contenedor.querySelector("#perfilPasswordNueva"), "nueva1");
            escribir(contenedor.querySelector("#perfilConfirmar"), "nueva1");
            enviar(contenedor.querySelector("form"));


            expect(guardados(CLAVES.usuarios)[0].password).toBe("nueva1");
            expect(contenedor.querySelector("#perfilPasswordNueva").value).toBe("");
            expect(mostrar).toHaveBeenCalledWith("Perfil y contraseña actualizados.");
        });
    });
});

