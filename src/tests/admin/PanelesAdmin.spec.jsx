import PanelProductos from "../../components/admin/PanelProductos";
import PanelCategorias from "../../components/admin/PanelCategorias";
import PanelUsuarios from "../../components/admin/PanelUsuarios";
import PanelOrdenes from "../../components/admin/PanelOrdenes";
import PanelReportes from "../../components/admin/PanelReportes";
import PanelPerfil from "../../components/admin/PanelPerfil";
import RutaProtegida from "../../components/common/RutaProtegida";
import { productosIniciales } from "../../data/semillas";
import { botonPorTexto, click, enviar, escribir, montarConProveedores as montarSincrono, seleccionar, simularLocalStorage } from "../utilidades";
import { esperarApi, sesionGuardada, simularServidor, USUARIOS_PRUEBA } from "../servidorFalso";

// Los paneles leen y escriben con la API (servidor falso): se monta y se espera la respuesta.
async function montarConProveedores(elemento) {
    const montaje = montarSincrono(elemento);
    await esperarApi();
    await esperarApi(); // segunda vuelta: carga que empieza después de restaurar la sesión
    return montaje;
}

// Después de una acción (clic / envío) se deja terminar la petición y la recarga.
const tras = () => esperarApi(40);

const ADMIN = USUARIOS_PRUEBA.admin;
const CLIENTE = {
    id: 7, run: "190110222", nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", password: "1234",
    direccion: "Calle 1", region: "Valparaíso", comuna: "Quilpué", rol: "Cliente", estado: "Activo",
    compras: [{ fecha: "2026-10-01", producto: "Zelda", cantidad: 1, total: 59990 }]
};


describe("Paneles del administrador", () => {
    let servidor, mostrar, onCambio;

    function preparar(opciones = {}) {
        jasmine.getEnv().allowRespy(true);
        simularLocalStorage();
        servidor = simularServidor({ usuarios: [ADMIN, CLIENTE], ...opciones });
        sesionGuardada(ADMIN);
    }

    beforeEach(() => {
        preparar();
        mostrar = jasmine.createSpy("mostrar");
        onCambio = jasmine.createSpy("onCambio");
    });


    describe("PanelProductos", () => {
        function montarPanel(props = {}) {
            return montarConProveedores(
                <PanelProductos esAdmin soloCriticos={false} onSoloCriticosChange={() => {}} mostrar={mostrar} onCambio={onCambio} {...props} />
            );
        }


        it("lista el inventario y busca por nombre o código", async () => {
            const { contenedor } = await montarPanel();
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(productosIniciales.length);


            escribir(contenedor.querySelector("[aria-label='Buscar producto']"), "zel-001");
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);
        });


        it("con soloCriticos muestra solo los productos en stock crítico", async () => {
            preparar({ productos: productosIniciales.map((p, i) => (i === 0 ? { ...p, stock: 1 } : p)) });
            const { contenedor } = await montarPanel({ soloCriticos: true });


            expect(contenedor.querySelector("h5").textContent).toBe("Productos con stock crítico");
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);
        });


        it("el switch de stock crítico avisa el cambio", async () => {
            const onSoloCriticosChange = jasmine.createSpy("onSoloCriticosChange");
            const { contenedor } = await montarPanel({ onSoloCriticosChange });
            click(contenedor.querySelector("#soloCriticos"));
            expect(onSoloCriticosChange).toHaveBeenCalledWith(true);
        });


        it("crea un producto nuevo desde el modal", async () => {
            const { contenedor } = await montarPanel();
            click(botonPorTexto(contenedor, "Agregar Producto"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Agregar Producto");


            escribir(contenedor.querySelector("#prodCodigo"), "TST-001");
            escribir(contenedor.querySelector("#prodNombre"), "Nintendo Switch");
            escribir(contenedor.querySelector("#prodPrecio"), "299990");
            escribir(contenedor.querySelector("#prodStock"), "6");
            escribir(contenedor.querySelector("#prodStockCritico"), "2");
            enviar(contenedor.querySelector(".modal form"));
            await tras();


            const peticion = servidor.peticiones.find(p => p.metodo === "POST" && p.ruta === "/productos");
            expect(peticion.auth).toBeTrue();
            expect(servidor.productos.some(p => p.nombre === "Nintendo Switch")).toBeTrue();
            expect(contenedor.querySelector(".modal")).toBeNull();
            expect(mostrar).toHaveBeenCalledWith("Producto guardado correctamente.");
            expect(onCambio).toHaveBeenCalled();
        });


        it("no permite repetir el código de otro producto", async () => {
            const { contenedor } = await montarPanel();
            click(botonPorTexto(contenedor, "Agregar Producto"));
            escribir(contenedor.querySelector("#prodCodigo"), "ps5-001");
            escribir(contenedor.querySelector("#prodNombre"), "Copia");
            escribir(contenedor.querySelector("#prodPrecio"), "1");
            escribir(contenedor.querySelector("#prodStock"), "1");
            enviar(contenedor.querySelector(".modal form"));


            expect(contenedor.textContent).toContain("Ya existe otro producto con ese código.");
        });


        it("edita un producto y advierte si queda en stock crítico", async () => {
            const { contenedor } = await montarPanel();
            click(contenedor.querySelector("[aria-label='Editar PlayStation 5']"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Editar Producto");


            escribir(contenedor.querySelector("#prodStock"), "1");
            enviar(contenedor.querySelector(".modal form"));
            await tras();


            expect(servidor.productos.find(p => p.id === 1).stock).toBe(1);
            expect(mostrar).toHaveBeenCalledWith('Advertencia: "PlayStation 5" quedó en stock crítico.', "warning");
        });


        it("cierra el modal con Cancelar sin guardar", async () => {
            const { contenedor } = await montarPanel();
            click(botonPorTexto(contenedor, "Agregar Producto"));
            click(botonPorTexto(contenedor, "Cancelar"));
            expect(contenedor.querySelector(".modal")).toBeNull();
            expect(onCambio).not.toHaveBeenCalled();
        });


        it("elimina un producto solo si se confirma", async () => {
            const confirmar = spyOn(window, "confirm").and.returnValue(false);
            const { contenedor } = await montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar Xbox Series X']"));
            await tras();
            expect(servidor.productos.length).toBe(productosIniciales.length);


            confirmar.and.returnValue(true);
            click(contenedor.querySelector("[aria-label='Eliminar Xbox Series X']"));
            await tras();
            expect(servidor.productos.some(p => p.id === 2)).toBeFalse();
            expect(mostrar).toHaveBeenCalledWith("Producto eliminado.");
        });


        it("el vendedor no ve el botón de agregar ni las acciones de edición", async () => {
            const { contenedor } = await montarPanel({ esAdmin: false });
            expect(botonPorTexto(contenedor, "Agregar Producto")).toBeNull();
            expect(contenedor.querySelector("[aria-label^='Editar']")).toBeNull();
        });
    });


    describe("PanelCategorias", () => {
        const montarPanel = () => montarConProveedores(<PanelCategorias mostrar={mostrar} onCambio={onCambio} />);


        it("crea una categoría nueva", async () => {
            const { contenedor } = await montarPanel();
            click(botonPorTexto(contenedor, "Nueva Categoría"));
            escribir(contenedor.querySelector("#catNombre"), "Notebooks");
            enviar(contenedor.querySelector(".modal form"));
            await tras();


            expect(servidor.categorias.find(c => c.valor === "notebooks")).toBeDefined();
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(4);
            expect(mostrar).toHaveBeenCalledWith('Categoría "Notebooks" creada.');
        });


        it("edita el nombre de una categoría", async () => {
            const { contenedor } = await montarPanel();
            click(contenedor.querySelector("[aria-label='Editar categoría Consolas']"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Editar Categoría");


            escribir(contenedor.querySelector("#catNombre"), "Consolas Next-Gen");
            enviar(contenedor.querySelector(".modal form"));
            await tras();


            expect(servidor.categorias.find(c => c.valor === "consolas").nombre).toBe("Consolas Next-Gen");
        });


        it("no elimina una categoría con productos y lo informa", async () => {
            spyOn(window, "confirm").and.returnValue(true);
            const { contenedor } = await montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar categoría Consolas']"));
            await tras();


            // El backend responde 409 y el panel muestra su mensaje.
            expect(mostrar).toHaveBeenCalledWith(jasmine.stringContaining(`tiene ${productosIniciales.filter(p => p.categoria === "consolas").length} producto(s)`), "danger");
            expect(servidor.categorias.length).toBe(3);
        });


        it("elimina una categoría vacía", async () => {
            spyOn(window, "confirm").and.returnValue(true);
            preparar({ productos: productosIniciales.filter(p => p.categoria !== "accesorios") });
            const { contenedor } = await montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar categoría Accesorios']"));
            await tras();


            expect(servidor.categorias.length).toBe(2);
            expect(mostrar).toHaveBeenCalledWith('Categoría "Accesorios" eliminada.');
        });
    });


    describe("PanelUsuarios", () => {
        // Como en la app, el panel se muestra dentro de la ruta protegida (cuando la sesión ya se restauró).
        const montarPanel = () => montarConProveedores(<RutaProtegida roles={["admin"]}><PanelUsuarios mostrar={mostrar} onCambio={onCambio} /></RutaProtegida>);


        it("lista y busca usuarios por nombre, correo o RUN", async () => {
            const { contenedor } = await montarPanel();
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(2);


            escribir(contenedor.querySelector("[aria-label='Buscar usuario']"), "190110222");
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(1);
        });


        it("el formulario de nuevo usuario exige región y comuna", async () => {
            const { contenedor } = await montarPanel();
            click(botonPorTexto(contenedor, "Nuevo Usuario"));
            enviar(contenedor.querySelector(".modal form"));


            expect(contenedor.querySelector(".modal #usr-region").classList).toContain("is-invalid");
            expect(contenedor.querySelector(".modal #usr-comuna").classList).toContain("is-invalid");
        });


        it("crea un usuario nuevo con el rol elegido", async () => {
            const { contenedor } = await montarPanel();
            click(botonPorTexto(contenedor, "Nuevo Usuario"));
            expect(contenedor.querySelector(".modal-title").textContent).toBe("Nuevo Usuario");


            const campos = { nombre: "Luis", apellidos: "Soto", run: "10000013K", correo: "luis@duoc.cl", direccion: "Calle 2", password: "abcd" };
            Object.entries(campos).forEach(([id, valor]) => escribir(contenedor.querySelector(`.modal #${id}`), valor));
            seleccionar(contenedor.querySelector(".modal #usr-region"), "Valparaíso");
            seleccionar(contenedor.querySelector(".modal #usr-comuna"), "Viña del Mar");
            seleccionar(contenedor.querySelector(".modal #rol"), "Vendedor");
            enviar(contenedor.querySelector(".modal form"));
            await tras();


            const creado = servidor.usuarios.find(u => u.correo === "luis@duoc.cl");
            expect(creado).toEqual(jasmine.objectContaining({ rol: "Vendedor", comuna: "Viña del Mar", run: "10000013K" }));
            expect(contenedor.querySelectorAll("tbody tr").length).toBe(3);
            expect(mostrar).toHaveBeenCalledWith("Usuario luis@duoc.cl creado correctamente.");
        });


        it("detecta correo o RUN duplicados", async () => {
            const { contenedor } = await montarPanel();
            click(contenedor.querySelectorAll("tbody tr")[1].querySelector("button"));


            escribir(contenedor.querySelector(".modal #correo"), ADMIN.correo);
            enviar(contenedor.querySelector(".modal form"));
            expect(contenedor.textContent).toContain("Ya existe un usuario con ese correo.");


            escribir(contenedor.querySelector(".modal #correo"), "ana@gmail.com");
            escribir(contenedor.querySelector(".modal #run"), ADMIN.run);
            enviar(contenedor.querySelector(".modal form"));
            expect(contenedor.textContent).toContain("Ya existe un usuario con ese RUN.");
        });


        it("abre el expediente con el historial de compras y actualiza el usuario", async () => {
            const { contenedor } = await montarPanel();
            click(contenedor.querySelectorAll("tbody tr")[1].querySelector("button"));


            expect(contenedor.querySelector(".modal-title").textContent).toBe("Expediente Completo del Usuario");
            expect(contenedor.querySelector(".modal").textContent).toContain("Historial de Compras");
            expect(contenedor.querySelector(".modal").textContent).toContain("$59.990");


            escribir(contenedor.querySelector(".modal #nombre"), "Ana María");
            enviar(contenedor.querySelector(".modal form"));
            await tras();


            expect(servidor.usuarios.find(u => u.id === CLIENTE.id).nombre).toBe("Ana María");
            expect(mostrar).toHaveBeenCalledWith("Usuario actualizado correctamente.");
        });


        it("al editar su propia cuenta conserva el rol de administrador", async () => {
            const { contenedor } = await montarPanel();
            click(contenedor.querySelectorAll("tbody tr")[0].querySelector("button"));
            enviar(contenedor.querySelector(".modal form"));
            await tras();


            expect(servidor.usuarios.find(u => u.id === ADMIN.id).rol).toBe("Administrador");
        });


        it("elimina a otro usuario si se confirma", async () => {
            spyOn(window, "confirm").and.returnValue(true);
            const { contenedor } = await montarPanel();


            click(contenedor.querySelector("[aria-label='Eliminar ana@gmail.com']"));
            await tras();


            expect(servidor.usuarios.length).toBe(1);
            expect(mostrar).toHaveBeenCalledWith("Usuario ana@gmail.com eliminado.");
        });
    });


    describe("PanelOrdenes", () => {
        beforeEach(() => {
            preparar({
                boletas: [
                    { id: 1, fecha: "2026-10-01", cliente: "Ana Pérez", correo: "ana@gmail.com", estado: "Pagada", total: 59990, items: [] },
                    { id: 2, fecha: "2026-10-02", cliente: "Luis Soto", correo: "luis@duoc.cl", estado: "Pagada", total: 549990, items: [] }
                ]
            });
        });


        it("lista las órdenes (la más reciente primero) y filtra por cliente", async () => {
            const { contenedor } = await montarConProveedores(<PanelOrdenes />);
            const filas = () => contenedor.querySelectorAll("tbody tr");


            expect(filas().length).toBe(2);
            expect(filas()[0].textContent).toContain("2026-10-02");


            escribir(contenedor.querySelector("[aria-label='Buscar orden']"), "ana");
            expect(filas().length).toBe(1);
        });


        it("muestra la boleta en un modal y la cierra", async () => {
            const { contenedor } = await montarConProveedores(<PanelOrdenes />);


            click(botonPorTexto(contenedor, "Ver detalle"));
            expect(contenedor.querySelector("[data-testid='boleta']")).not.toBeNull();


            click(contenedor.querySelector(".modal .btn-close"));
            expect(contenedor.querySelector(".modal")).toBeNull();
        });


        it("el administrador cambia el estado con PUT /boletas/{id}/estado; el vendedor no ve ese control", async () => {
            let montaje = await montarConProveedores(<PanelOrdenes esAdmin mostrar={mostrar} />);
            click(botonPorTexto(montaje.contenedor, "Ver detalle"));
            seleccionar(montaje.contenedor.querySelector("#estadoOrden"), "Enviada");
            click(botonPorTexto(montaje.contenedor, "Actualizar estado"));
            await tras();
            expect(servidor.boletas.find(b => b.id === 2).estado).toBe("Enviada");

            montaje = await montarConProveedores(<PanelOrdenes esAdmin={false} />);
            click(botonPorTexto(montaje.contenedor, "Ver detalle"));
            expect(montaje.contenedor.querySelector("[data-testid='cambiar-estado']")).toBeNull();
        });
    });


    describe("PanelReportes", () => {
        it("calcula los indicadores a partir de las órdenes", async () => {
            preparar({
                boletas: [
                    { id: 1, estado: "Pagada", total: 100000, descuento: 10000, items: [{ id: 1, nombre: "PS5", categoria: "consolas", precio: 100000, cantidad: 1 }] },
                    { id: 2, estado: "Pagada", total: 50000, items: [{ id: 3, nombre: "Zelda", categoria: "juegos", precio: 25000, cantidad: 2 }] },
                    { id: 3, estado: "Anulada", total: 999999, items: [{ id: 3, nombre: "Zelda", categoria: "juegos", precio: 999999, cantidad: 1 }] }
                ]
            });
            const { contenedor } = await montarConProveedores(<PanelReportes />);
            const valores = [...contenedor.querySelectorAll("h2")].map(h => h.textContent);


            expect(valores).toEqual(["$150.000", "2", "$75.000", "3"]);
            expect(contenedor.textContent).toContain("Descuentos: $10.000");
            expect(contenedor.textContent).toContain("Consolas");
        });


        it("sin órdenes muestra los rankings vacíos", async () => {
            const { contenedor } = await montarConProveedores(<PanelReportes />);
            expect(contenedor.textContent).toContain("Sin datos todavía.");
        });
    });


    describe("PanelPerfil", () => {
        const montarPanel = () => montarConProveedores(<RutaProtegida roles={["admin"]}><PanelPerfil mostrar={mostrar} onCambio={onCambio} /></RutaProtegida>);


        it("muestra los datos del usuario conectado", async () => {
            const { contenedor } = await montarPanel();
            expect(contenedor.querySelector("#perfilNombre").value).toBe(ADMIN.nombre);
            expect(contenedor.textContent).toContain(ADMIN.correo);
            expect(contenedor.textContent).toContain("Santiago, Metropolitana de Santiago");
        });


        it("actualiza el nombre", async () => {
            const { contenedor } = await montarPanel();
            escribir(contenedor.querySelector("#perfilNombre"), "Sebastián");
            enviar(contenedor.querySelector("form"));
            await tras();


            expect(servidor.usuarios[0].nombre).toBe("Sebastián");
            expect(mostrar).toHaveBeenCalledWith("Perfil actualizado.");
        });


        it("rechaza el cambio de contraseña si la actual es incorrecta", async () => {
            const { contenedor } = await montarPanel();
            escribir(contenedor.querySelector("#perfilPasswordActual"), "mala");
            escribir(contenedor.querySelector("#perfilPasswordNueva"), "nueva1");
            escribir(contenedor.querySelector("#perfilConfirmar"), "nueva1");
            enviar(contenedor.querySelector("form"));
            await tras();


            // La verificación la hace el backend (400 con campo "passwordActual").
            expect(contenedor.textContent).toContain("La contraseña actual no es correcta.");
            expect(mostrar).not.toHaveBeenCalled();
        });


        it("cambia la contraseña y limpia los campos", async () => {
            const { contenedor } = await montarPanel();
            escribir(contenedor.querySelector("#perfilPasswordActual"), ADMIN.password);
            escribir(contenedor.querySelector("#perfilPasswordNueva"), "nueva1");
            escribir(contenedor.querySelector("#perfilConfirmar"), "nueva1");
            enviar(contenedor.querySelector("form"));
            await tras();


            expect(servidor.usuarios[0].password).toBe("nueva1");
            expect(contenedor.querySelector("#perfilPasswordNueva").value).toBe("");
            expect(mostrar).toHaveBeenCalledWith("Perfil y contraseña actualizados.");
        });
    });
});

