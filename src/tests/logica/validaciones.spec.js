// PRUEBAS DE LÓGICA: reglas de validación de los formularios.
import {
    limpiarRun, validarCategoria, validarCorreo, validarPassword, validarPerfil,
    validarProducto, validarRun, validarTexto, validarUsuario
} from "../../utils/validaciones";

describe("validaciones", () => {
    describe("validarRun", () => {
        it("acepta RUN con dígito verificador correcto (numérico y K)", () => {
            expect(validarRun("111111111")).toBeTrue();
            expect(validarRun("190110222")).toBeTrue();
            expect(validarRun("10000013K")).toBeTrue();
        });

        it("acepta RUN escrito con puntos y guion", () => {
            expect(validarRun("19.011.022-2")).toBeTrue();
        });

        it("rechaza dígito verificador incorrecto, vacío o muy corto", () => {
            expect(validarRun("190110221")).toBeFalse();
            expect(validarRun("")).toBeFalse();
            expect(validarRun("1234")).toBeFalse();
        });

        it("limpiarRun quita puntos, guion y pasa la k a mayúscula", () => {
            expect(limpiarRun(" 10.000.013-k ")).toBe("10000013K");
        });
    });

    it("validarCorreo solo permite los dominios autorizados", () => {
        expect(validarCorreo("alumno@duoc.cl")).toBeTrue();
        expect(validarCorreo("profe@profesor.duoc.cl")).toBeTrue();
        expect(validarCorreo("ALGUIEN@GMAIL.COM")).toBeTrue();
        expect(validarCorreo("alguien@hotmail.com")).toBeFalse();
        expect(validarCorreo("")).toBeFalse();
        expect(validarCorreo("a".repeat(95) + "@gmail.com")).toBeFalse();
    });

    it("validarPassword exige entre 4 y 10 caracteres", () => {
        expect(validarPassword("123")).toBeFalse();
        expect(validarPassword("1234")).toBeTrue();
        expect(validarPassword("1234567890")).toBeTrue();
        expect(validarPassword("12345678901")).toBeFalse();
    });

    it("validarTexto respeta obligatoriedad y largo máximo", () => {
        expect(validarTexto("  ", 10)).toBeFalse();
        expect(validarTexto("", 10, false)).toBeTrue();
        expect(validarTexto("12345", 4)).toBeFalse();
    });

    describe("validarUsuario", () => {
        const valido = {
            run: "190110222", nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com",
            password: "1234", confirmPassword: "1234", region: "Valparaíso", comuna: "Quilpué", direccion: "Calle 1"
        };

        it("no devuelve errores con datos correctos", () => {
            expect(validarUsuario(valido, { confirmarPassword: true })).toEqual({});
        });

        it("devuelve un error por cada campo inválido", () => {
            const errores = validarUsuario({}, { confirmarPassword: true });
            expect(Object.keys(errores).sort()).toEqual(
                ["apellidos", "comuna", "confirmPassword", "correo", "direccion", "nombre", "password", "region", "run"]
            );
        });

        it("detecta contraseñas que no coinciden", () => {
            const errores = validarUsuario({ ...valido, confirmPassword: "9999" }, { confirmarPassword: true });
            expect(errores.confirmPassword).toBe("Las contraseñas no coinciden.");
        });
    });

    describe("validarProducto", () => {
        it("acepta un producto correcto", () => {
            const producto = { codigo: "PS5", nombre: "PS5", categoria: "consolas", precio: 10, stock: 1, stockCritico: 0 };
            expect(validarProducto(producto)).toEqual({});
        });

        it("rechaza precio negativo, stock decimal e imagen sin http", () => {
            const errores = validarProducto({
                codigo: "AB", nombre: "", categoria: "", precio: -1, stock: 1.5, imagen: "ftp://x"
            });
            expect(Object.keys(errores)).toEqual(
                jasmine.arrayContaining(["codigo", "nombre", "categoria", "precio", "stock", "imagen"])
            );
        });
    });

    it("validarCategoria evita nombres repetidos, salvo la que se está editando", () => {
        const existentes = [{ valor: "consolas", nombre: "Consolas" }];
        expect(validarCategoria({ nombre: "consolas", icono: "x" }, existentes).nombre)
            .toBe("Ya existe una categoría con ese nombre.");
        expect(validarCategoria({ nombre: "Consolas", icono: "x" }, existentes, "consolas")).toEqual({});
    });

    it("validarPerfil solo valida contraseñas si se quiere cambiarla", () => {
        expect(validarPerfil({ nombre: "Ana", apellidos: "P" }, "1234")).toEqual({});

        const errores = validarPerfil(
            { nombre: "Ana", apellidos: "P", passwordActual: "mala", passwordNueva: "12", confirmarPassword: "13" },
            "1234"
        );
        expect(Object.keys(errores).sort()).toEqual(["confirmarPassword", "passwordActual", "passwordNueva"]);
    });
});
