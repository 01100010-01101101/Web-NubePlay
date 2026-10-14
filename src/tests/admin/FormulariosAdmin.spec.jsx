import FormularioProducto from "../../components/admin/FormularioProducto";
import FormularioCategoria from "../../components/admin/FormularioCategoria";
import FormularioUsuario from "../../components/admin/FormularioUsuario";
import { categoriasIniciales, ICONOS_CATEGORIA } from "../../data/semillas";
import { botonPorTexto, click, enviar, escribir, montar, seleccionar } from "../utilidades";

describe("FormularioProducto", () => {
    function llenar(contenedor, datos) {
        Object.entries(datos).forEach(([id, valor]) => escribir(contenedor.querySelector(`#${id}`), valor));
    }

    it("un producto nuevo empieza vacío con la primera categoría elegida", () => {
        const { contenedor } = montar(<FormularioProducto categorias={categoriasIniciales} onGuardar={() => {}} onCancelar={() => {}} />);
        expect(contenedor.querySelector("#prodNombre").value).toBe("");
        expect(contenedor.querySelector("#prodCategoria").value).toBe("juegos");
        expect(contenedor.querySelectorAll("#prodCategoria option").length).toBe(3);
    });

    it("al editar carga los datos del producto", () => {
        const producto = { id: 1, codigo: "PS5-001", nombre: "PS5", categoria: "consolas", precio: 10, stock: 2, stockCritico: 1 };
        const { contenedor } = montar(<FormularioProducto producto={producto} categorias={categoriasIniciales} onGuardar={() => {}} />);
        expect(contenedor.querySelector("#prodCodigo").value).toBe("PS5-001");
        expect(contenedor.querySelector("#prodCategoria").value).toBe("consolas");
    });

    it("no guarda y muestra errores si los datos son inválidos", () => {
        const onGuardar = jasmine.createSpy("onGuardar");
        const { contenedor } = montar(<FormularioProducto categorias={categoriasIniciales} onGuardar={onGuardar} />);

        llenar(contenedor, { prodPrecio: "-5", prodImagen: "imagen.png" });
        enviar(contenedor.querySelector("form"));

        expect(onGuardar).not.toHaveBeenCalled();
        const errores = [...contenedor.querySelectorAll(".invalid-feedback")].map(e => e.textContent);
        expect(errores).toContain("El código debe tener al menos 3 caracteres.");
        expect(errores).toContain("El precio debe ser un número mayor o igual a 0.");
        expect(errores).toContain("La imagen debe ser una URL válida (http/https) o dejarse vacía.");
    });

    it("el error de un campo se borra al corregirlo", () => {
        const { contenedor } = montar(<FormularioProducto categorias={categoriasIniciales} onGuardar={() => {}} />);
        enviar(contenedor.querySelector("form"));
        expect(contenedor.querySelector("#prodNombre").classList).toContain("is-invalid");

        escribir(contenedor.querySelector("#prodNombre"), "Nuevo");

        expect(contenedor.querySelector("#prodNombre").classList).not.toContain("is-invalid");
    });

    it("usa la validación de código duplicado recibida por props", () => {
        const validarCodigo = jasmine.createSpy("validarCodigo").and.returnValue("Ya existe otro producto con ese código.");
        const onGuardar = jasmine.createSpy("onGuardar");
        const { contenedor } = montar(
            <FormularioProducto categorias={categoriasIniciales} onGuardar={onGuardar} validarCodigo={validarCodigo} />
        );

        llenar(contenedor, { prodCodigo: " PS5-001 ", prodNombre: "PS5", prodPrecio: "10", prodStock: "1" });
        enviar(contenedor.querySelector("form"));

        expect(validarCodigo).toHaveBeenCalledWith("PS5-001");
        expect(contenedor.textContent).toContain("Ya existe otro producto con ese código.");
        expect(onGuardar).not.toHaveBeenCalled();
    });

    it("entrega a onGuardar los datos convertidos a número y sin espacios", () => {
        const onGuardar = jasmine.createSpy("onGuardar");
        const { contenedor } = montar(<FormularioProducto categorias={categoriasIniciales} onGuardar={onGuardar} />);

        llenar(contenedor, { prodCodigo: "NSW-01", prodNombre: " Switch ", prodPrecio: "299990", prodStock: "4", prodStockCritico: "2" });
        seleccionar(contenedor.querySelector("#prodCategoria"), "consolas");
        enviar(contenedor.querySelector("form"));

        expect(onGuardar).toHaveBeenCalledWith({
            codigo: "NSW-01", nombre: "Switch", categoria: "consolas", precio: 299990,
            stock: 4, stockCritico: 2, descripcion: "", imagen: ""
        });
    });

    it("el botón Cancelar llama a onCancelar", () => {
        const onCancelar = jasmine.createSpy("onCancelar");
        const { contenedor } = montar(<FormularioProducto categorias={categoriasIniciales} onGuardar={() => {}} onCancelar={onCancelar} />);
        click(botonPorTexto(contenedor, "Cancelar"));
        expect(onCancelar).toHaveBeenCalled();
    });
});

describe("FormularioCategoria", () => {
    it("muestra un botón por cada ícono y el primero queda elegido", () => {
        const { contenedor } = montar(<FormularioCategoria onGuardar={() => {}} onCancelar={() => {}} />);
        const radios = contenedor.querySelectorAll("input[type='radio']");
        expect(radios.length).toBe(ICONOS_CATEGORIA.length);
        expect(radios[0].checked).toBeTrue();
    });

    it("cuenta los caracteres de la descripción mientras se escribe", () => {
        const { contenedor } = montar(<FormularioCategoria onGuardar={() => {}} />);
        escribir(contenedor.querySelector("#catDescripcion"), "Hola");
        expect(contenedor.textContent).toContain("4/150 caracteres");
    });

    it("rechaza un nombre repetido", () => {
        const onGuardar = jasmine.createSpy("onGuardar");
        const { contenedor } = montar(<FormularioCategoria existentes={categoriasIniciales} onGuardar={onGuardar} />);

        escribir(contenedor.querySelector("#catNombre"), "consolas");
        enviar(contenedor.querySelector("form"));

        expect(contenedor.textContent).toContain("Ya existe una categoría con ese nombre.");
        expect(onGuardar).not.toHaveBeenCalled();
    });

    it("guarda nombre, descripción e ícono elegido", () => {
        const onGuardar = jasmine.createSpy("onGuardar");
        const { contenedor } = montar(<FormularioCategoria existentes={categoriasIniciales} onGuardar={onGuardar} />);

        escribir(contenedor.querySelector("#catNombre"), " Notebooks ");
        click(contenedor.querySelector("#icono-bi-laptop"));
        enviar(contenedor.querySelector("form"));

        expect(onGuardar).toHaveBeenCalledWith({ nombre: "Notebooks", descripcion: "", icono: "bi-laptop" });
    });

    it("al editar muestra la URL de la categoría y permite mantener su nombre", () => {
        const onGuardar = jasmine.createSpy("onGuardar");
        const categoria = categoriasIniciales[1];
        const { contenedor } = montar(
            <FormularioCategoria categoria={categoria} existentes={categoriasIniciales} onGuardar={onGuardar} />
        );

        expect(contenedor.textContent).toContain("/categorias/consolas");
        enviar(contenedor.querySelector("form"));
        expect(onGuardar).toHaveBeenCalled();
    });
});

describe("FormularioUsuario", () => {
    const USUARIO = {
        id: 5, nombre: "Ana", apellidos: "Pérez", run: "190110222", correo: "ana@gmail.com", password: "1234",
        direccion: "Calle 1", region: "Valparaíso", comuna: "Quilpué", rol: "Vendedor", estado: "Activo"
    };

    it("en modo nuevo muestra 'Crear Usuario' y el rol Cliente por defecto", () => {
        const { contenedor } = montar(<FormularioUsuario esNuevo onGuardar={() => {}} />);
        expect(contenedor.querySelector("button[type='submit']").textContent).toContain("Crear Usuario");
        expect(contenedor.querySelector("#rol").value).toBe("Cliente");
    });

    it("genera una contraseña aleatoria con el botón de la llave", () => {
        const { contenedor } = montar(<FormularioUsuario esNuevo onGuardar={() => {}} />);
        click(contenedor.querySelector("[title='Generar Clave Aleatoria']"));
        expect(contenedor.querySelector("#password").value.length).toBeGreaterThan(0);
    });

    it("normaliza correo y RUN y usa validarDuplicados antes de guardar", () => {
        const onGuardar = jasmine.createSpy("onGuardar");
        const validarDuplicados = jasmine.createSpy("validarDuplicados").and.returnValue({});
        const { contenedor } = montar(
            <FormularioUsuario usuario={{ ...USUARIO, correo: " ANA@GMAIL.COM ", run: "19.011.022-2" }}
                validarDuplicados={validarDuplicados} onGuardar={onGuardar} />
        );

        enviar(contenedor.querySelector("form"));

        const esperado = jasmine.objectContaining({ correo: "ana@gmail.com", run: "190110222", rol: "Vendedor" });
        expect(validarDuplicados).toHaveBeenCalledWith(esperado);
        expect(onGuardar).toHaveBeenCalledWith(esperado);
    });

    it("muestra el error devuelto por validarDuplicados", () => {
        const onGuardar = jasmine.createSpy("onGuardar");
        const { contenedor } = montar(
            <FormularioUsuario usuario={USUARIO} onGuardar={onGuardar}
                validarDuplicados={() => ({ correo: "Ya existe un usuario con ese correo." })} />
        );

        enviar(contenedor.querySelector("form"));

        expect(contenedor.textContent).toContain("Ya existe un usuario con ese correo.");
        expect(onGuardar).not.toHaveBeenCalled();
    });

    it("con datos inválidos marca los campos y el error se borra al corregir", () => {
        const { contenedor } = montar(<FormularioUsuario esNuevo onGuardar={() => {}} />);
        enviar(contenedor.querySelector("form"));
        expect(contenedor.querySelector("#password").classList).toContain("is-invalid");

        escribir(contenedor.querySelector("#password"), "abcd");
        expect(contenedor.querySelector("#password").classList).not.toContain("is-invalid");
    });

    it("en la cuenta propia bloquea rol y estado y muestra un aviso", () => {
        const { contenedor } = montar(<FormularioUsuario usuario={USUARIO} esPropio onGuardar={() => {}} />);
        expect(contenedor.querySelector("#rol").disabled).toBeTrue();
        expect(contenedor.querySelector("#estado").disabled).toBeTrue();
        expect(contenedor.querySelector("[data-testid='aviso-cuenta-propia']")).not.toBeNull();
    });
});
