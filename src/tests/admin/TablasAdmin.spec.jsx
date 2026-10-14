
import TablaProductosAdmin from "../../components/admin/TablaProductosAdmin";
import TablaUsuariosAdmin from "../../components/admin/TablaUsuariosAdmin";
import TablaCategorias from "../../components/admin/TablaCategorias";
import TablaOrdenes from "../../components/admin/TablaOrdenes";
import HistorialCompras from "../../components/admin/HistorialCompras";
import TarjetaEstadistica from "../../components/admin/TarjetaEstadistica";
import RankingBarras from "../../components/admin/RankingBarras";
import { categoriasIniciales } from "../../data/semillas";
import { botonPorTexto, click, montar, montarConRouter, simularLocalStorage } from "../utilidades";


const PRODUCTOS = [
    { id: 1, codigo: "PS5-001", nombre: "PS5", categoria: "consolas", precio: 549990, stock: 10, stockCritico: 3 },
    { id: 2, codigo: "ZEL-001", nombre: "Zelda", categoria: "juegos", precio: 59990, stock: 2, stockCritico: 5 }
];


describe("TablaProductosAdmin", () => {
    beforeEach(() => simularLocalStorage({ categorias: JSON.stringify(categoriasIniciales) }));


    it("renderiza una fila por producto con su código, categoría y precio", () => {
        const { contenedor } = montarConRouter(<TablaProductosAdmin productos={PRODUCTOS} editable />);
        const filas = contenedor.querySelectorAll("tbody tr");


        expect(filas.length).toBe(2);
        expect(filas[0].textContent).toContain("PS5-001");
        expect(filas[0].textContent).toContain("Consolas");
        expect(filas[0].textContent).toContain("$549.990");
    });


    it("marca en rojo el stock que está en nivel crítico", () => {
        const { contenedor } = montarConRouter(<TablaProductosAdmin productos={PRODUCTOS} editable />);
        const filas = contenedor.querySelectorAll("tbody tr");
        expect(filas[0].querySelector(".badge.bg-success").textContent).toBe("10 un.");
        expect(filas[1].querySelector(".badge.bg-danger").textContent).toBe("2 un.");
    });


    it("si es editable, los botones llaman a onEditar/onEliminar con el producto", () => {
        const onEditar = jasmine.createSpy("onEditar");
        const onEliminar = jasmine.createSpy("onEliminar");
        const { contenedor } = montarConRouter(
            <TablaProductosAdmin productos={PRODUCTOS} editable onEditar={onEditar} onEliminar={onEliminar} />
        );


        click(contenedor.querySelector("[aria-label='Editar Zelda']"));
        click(contenedor.querySelector("[aria-label='Eliminar PS5']"));


        expect(onEditar).toHaveBeenCalledWith(PRODUCTOS[1]);
        expect(onEliminar).toHaveBeenCalledWith(PRODUCTOS[0]);
    });


    it("si no es editable (vendedor) solo ofrece ver el detalle", () => {
        const { contenedor } = montarConRouter(<TablaProductosAdmin productos={PRODUCTOS} editable={false} />);
        expect(contenedor.querySelector("[aria-label^='Editar']")).toBeNull();
        expect(contenedor.querySelector("a").getAttribute("href")).toBe("/productos/1");
    });


    it("muestra un mensaje si no hay productos", () => {
        const { contenedor } = montarConRouter(<TablaProductosAdmin productos={[]} editable />);
        expect(contenedor.textContent).toContain("No hay productos que coincidan");
    });
});


describe("TablaUsuariosAdmin", () => {
    const USUARIOS = [
        { id: 1791900000123, nombre: "Admin", apellidos: "Duoc", correo: "admin@duoc.cl", rol: "Administrador", estado: "Activo" },
        { id: 2, nombre: "Vera", correo: "vera@duoc.cl", rol: "Vendedor", estado: "Inactivo" },
        { id: 3, nombre: "Ana", correo: "ana@gmail.com", rol: "Cliente", estado: "Activo" }
    ];


    it("lista los usuarios con su rol coloreado y acorta los id largos", () => {
        const { contenedor } = montar(<TablaUsuariosAdmin usuarios={USUARIOS} usuarioActualId={1} onVer={() => {}} onEliminar={() => {}} />);
        const filas = contenedor.querySelectorAll("tbody tr");


        expect(filas.length).toBe(3);
        expect(filas[0].textContent).toContain("#000123");
        expect(filas[0].querySelector(".bg-danger").textContent).toBe("Administrador");
        expect(filas[1].querySelector(".bg-warning").textContent).toBe("Vendedor");
        expect(filas[1].querySelector(".bg-secondary").textContent).toBe("Inactivo");
        expect(filas[2].querySelector(".bg-info").textContent).toBe("Cliente");
    });


    it("marca la cuenta propia con 'Tú' y no permite eliminarla", () => {
        const { contenedor } = montar(
            <TablaUsuariosAdmin usuarios={USUARIOS} usuarioActualId={1791900000123} onVer={() => {}} onEliminar={() => {}} />
        );
        expect(contenedor.querySelector("tbody tr").textContent).toContain("Tú");
        expect(contenedor.querySelector("[aria-label='Eliminar admin@duoc.cl']").disabled).toBeTrue();
    });


    it("los botones llaman a onVer y onEliminar con el usuario", () => {
        const onVer = jasmine.createSpy("onVer");
        const onEliminar = jasmine.createSpy("onEliminar");
        const { contenedor } = montar(<TablaUsuariosAdmin usuarios={USUARIOS} usuarioActualId={1} onVer={onVer} onEliminar={onEliminar} />);


        click(contenedor.querySelectorAll("tbody tr")[2].querySelector("button"));
        click(contenedor.querySelector("[aria-label='Eliminar vera@duoc.cl']"));


        expect(onVer).toHaveBeenCalledWith(USUARIOS[2]);
        expect(onEliminar).toHaveBeenCalledWith(USUARIOS[1]);
    });


    it("muestra un mensaje si la búsqueda no encuentra usuarios", () => {
        const { contenedor } = montar(<TablaUsuariosAdmin usuarios={[]} usuarioActualId={1} onVer={() => {}} onEliminar={() => {}} />);
        expect(contenedor.textContent).toContain("No hay usuarios que coincidan");
    });
});


describe("TablaCategorias", () => {
    it("lista categorías con su cantidad de productos y descripción", () => {
        const contarProductos = jasmine.createSpy("contarProductos").and.callFake(valor => (valor === "consolas" ? 2 : 0));
        const { contenedor } = montar(
            <TablaCategorias categorias={categoriasIniciales} contarProductos={contarProductos} onEditar={() => {}} onEliminar={() => {}} />
        );
        const filas = contenedor.querySelectorAll("tbody tr");


        expect(filas.length).toBe(3);
        expect(contarProductos).toHaveBeenCalledTimes(3);
        expect(filas[1].querySelector(".badge").textContent).toBe("2");
        expect(filas[1].querySelector("[aria-label^='Eliminar']").title).toBe("Tiene productos asociados");
    });


    it("los botones editar/eliminar entregan la categoría", () => {
        const onEditar = jasmine.createSpy("onEditar");
        const onEliminar = jasmine.createSpy("onEliminar");
        const { contenedor } = montar(
            <TablaCategorias categorias={categoriasIniciales} contarProductos={() => 0} onEditar={onEditar} onEliminar={onEliminar} />
        );


        click(contenedor.querySelector("[aria-label='Editar categoría Videojuegos']"));
        click(contenedor.querySelector("[aria-label='Eliminar categoría Accesorios']"));


        expect(onEditar).toHaveBeenCalledWith(categoriasIniciales[0]);
        expect(onEliminar).toHaveBeenCalledWith(categoriasIniciales[2]);
    });


    it("muestra un mensaje sin categorías", () => {
        const { contenedor } = montar(<TablaCategorias categorias={[]} contarProductos={() => 0} onEditar={() => {}} onEliminar={() => {}} />);
        expect(contenedor.textContent).toContain("No hay categorías registradas.");
    });
});


describe("TablaOrdenes", () => {
    it("lista las órdenes con su código y total, y abre el detalle", () => {
        const onVerDetalle = jasmine.createSpy("onVerDetalle");
        const ordenes = [{ id: 1791912345678, fecha: "2026-10-13", cliente: "Ana", total: 59990 }];
        const { contenedor } = montar(<TablaOrdenes ordenes={ordenes} onVerDetalle={onVerDetalle} />);


        expect(contenedor.textContent).toContain("ORDER45678");
        expect(contenedor.textContent).toContain("$59.990");


        click(botonPorTexto(contenedor, "Ver detalle"));
        expect(onVerDetalle).toHaveBeenCalledWith(ordenes[0]);
    });


    it("muestra un mensaje si no hay órdenes", () => {
        const { contenedor } = montar(<TablaOrdenes ordenes={[]} onVerDetalle={() => {}} />);
        expect(contenedor.textContent).toContain("No existen órdenes registradas todavía.");
    });
});


describe("HistorialCompras", () => {
    it("muestra una fila por compra", () => {
        const compras = [
            { fecha: "2026-10-01", producto: "PS5", cantidad: 1, total: 549990 },
            { fecha: "2026-10-02", producto: "Zelda", cantidad: 2, total: 119980 }
        ];
        const { contenedor } = montar(<HistorialCompras compras={compras} />);
        expect(contenedor.querySelectorAll("tbody tr").length).toBe(2);
        expect(contenedor.textContent).toContain("$119.980");
    });


    it("indica cuando el usuario no tiene compras", () => {
        expect(montar(<HistorialCompras />).contenedor.textContent).toContain("No registra compras realizadas.");
    });
});


describe("TarjetaEstadistica", () => {
    it("sin onClick es una tarjeta estática", () => {
        const { contenedor } = montar(<TarjetaEstadistica titulo="Órdenes" valor={7} icono="bi-receipt" />);
        expect(contenedor.querySelector("button")).toBeNull();
        expect(contenedor.querySelector("h2").textContent).toBe("7");
    });


    it("con onClick es un botón que ejecuta la acción y muestra el detalle", () => {
        const onClick = jasmine.createSpy("onClick");
        const { contenedor } = montar(
            <TarjetaEstadistica titulo="Stock Crítico" valor={2} icono="bi-exclamation" detalle="Ver listado" onClick={onClick} />
        );


        click(contenedor.querySelector("button"));


        expect(onClick).toHaveBeenCalled();
        expect(contenedor.textContent).toContain("Ver listado");
    });
});


describe("RankingBarras", () => {
    it("muestra un texto cuando no hay datos", () => {
        const { contenedor } = montar(<RankingBarras titulo="Top" filas={[]} vacio="Sin ventas" />);
        expect(contenedor.textContent).toContain("Sin ventas");
    });


    it("dibuja una barra por fila proporcional al mayor monto", () => {
        const filas = [
            { clave: "1", nombre: "PS5", unidades: 2, monto: 1000 },
            { clave: "2", nombre: "Zelda", unidades: 5, monto: 250 }
        ];
        const { contenedor } = montar(<RankingBarras titulo="Top" filas={filas} />);
        const barras = contenedor.querySelectorAll(".progress-bar");


        expect(barras.length).toBe(2);
        expect(barras[0].style.width).toBe("100%");
        expect(barras[1].style.width).toBe("25%");
        expect(contenedor.querySelector(".progress").getAttribute("aria-label")).toBe("PS5: $1.000 (2 un.)");
    });
});



