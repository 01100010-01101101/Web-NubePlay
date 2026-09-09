document.addEventListener("DOMContentLoaded", () => {

    const regionesComunas = [
        {
            region: "Arica y Parinacota",
            comunas: ["Arica", "Camarones", "Putre", "General Lagos"]
        },
        {
            region: "Tarapacá",
            comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"]
        },
        {
            region: "Antofagasta",
            comunas: ["Antofagasta", "Calama", "Tocopilla", "Mejillones"]
        },
        {
            region: "Atacama",
            comunas: ["Copiapó", "Caldera", "Vallenar", "Huasco"]
        },
        {
            region: "Coquimbo",
            comunas: ["La Serena", "Coquimbo", "Ovalle", "Illapel"]
        },
        {
            region: "Valparaíso",
            comunas: ["Valparaíso", "Viña del Mar", "Quilpué", "San Antonio"]
        },
        {
            region: "Metropolitana de Santiago",
            comunas: ["Santiago", "Maipú", "Puente Alto", "Las Condes", "La Florida"]
        },
        {
            region: "O'Higgins",
            comunas: ["Rancagua", "Machalí", "San Fernando", "Rengo"]
        },
        {
            region: "Maule",
            comunas: ["Talca", "Curicó", "Linares", "Constitución"]
        },
        {
            region: "Ñuble",
            comunas: ["Chillán", "San Carlos", "Bulnes", "Yungay"]
        },
        {
            region: "Biobío",
            comunas: ["Concepción", "Talcahuano", "Los Ángeles", "Coronel"]
        },
        {
            region: "La Araucanía",
            comunas: ["Temuco", "Villarrica", "Angol", "Pucón"]
        },
        {
            region: "Los Ríos",
            comunas: ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"]
        },
        {
            region: "Los Lagos",
            comunas: ["Puerto Montt", "Osorno", "Castro", "Ancud"]
        },
        {
            region: "Aysén",
            comunas: ["Coyhaique", "Aysén", "Chile Chico", "Cochrane"]
        },
        {
            region: "Magallanes",
            comunas: ["Punta Arenas", "Puerto Natales", "Porvenir", "Cabo de Hornos"]
        }
    ];

    const form = document.getElementById("formRegistro");
    const selectRegion = document.getElementById("region");
    const selectComuna = document.getElementById("comuna");

    const run = document.getElementById("run");
    const nombre = document.getElementById("nombre");
    const apellidos = document.getElementById("apellidos");
    const correo = document.getElementById("correo");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const fechaNacimiento = document.getElementById("fechaNacimiento");
    const direccion = document.getElementById("direccion");

    // Cargar regiones desde el arreglo JavaScript.
    regionesComunas.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.region;
        selectRegion.appendChild(option);
    });

    // Cambiar comunas según la región seleccionada.
    selectRegion.addEventListener("change", event => {
        const index = event.target.value;

        selectComuna.innerHTML = '<option value="">Seleccione Comuna...</option>';

        if (index !== "") {
            selectComuna.disabled = false;

            regionesComunas[index].comunas.forEach(comuna => {
                const option = document.createElement("option");
                option.value = comuna;
                option.textContent = comuna;
                selectComuna.appendChild(option);
            });
        } else {
            selectComuna.disabled = true;
        }
    });

    function limpiarRun(valor) {
        return valor
            .trim()
            .replace(/[^0-9kK]/g, "")
            .toUpperCase();
    }

    function validarRun(valor) {
        const runNormalizado = limpiarRun(valor);

        if (!/^\d{7,8}[0-9K]$/.test(runNormalizado)) {
            return false;
        }

        const cuerpo = runNormalizado.slice(0, -1);
        const dv = runNormalizado.slice(-1);
        let suma = 0;
        let multiplicador = 2;

        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += Number(cuerpo[i]) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const resto = 11 - (suma % 11);
        const dvCalculado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

        return dv === dvCalculado;
    }

    function validarCorreo(valor) {
        const dominios = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        const correoNormalizado = valor.trim().toLowerCase();

        return correoNormalizado.length <= 100 &&
            dominios.some(dominio => correoNormalizado.endsWith(dominio));
    }

    function validarCampo(input, condicion) {
        if (condicion) {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
            return true;
        }

        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        return false;
    }

    function validarFormulario() {
        let esValido = true;

        esValido = validarCampo(run, validarRun(run.value)) && esValido;
        esValido = validarCampo(
            nombre,
            nombre.value.trim() !== "" && nombre.value.length <= 50
        ) && esValido;
        esValido = validarCampo(
            apellidos,
            apellidos.value.trim() !== "" && apellidos.value.length <= 100
        ) && esValido;
        esValido = validarCampo(correo, validarCorreo(correo.value)) && esValido;
        esValido = validarCampo(
            password,
            password.value.length >= 4 && password.value.length <= 10
        ) && esValido;
        esValido = validarCampo(
            confirmPassword,
            confirmPassword.value !== "" && confirmPassword.value === password.value
        ) && esValido;
        esValido = validarCampo(selectRegion, selectRegion.value !== "") && esValido;
        esValido = validarCampo(selectComuna, selectComuna.value !== "") && esValido;
        esValido = validarCampo(
            direccion,
            direccion.value.trim() !== "" && direccion.value.length <= 300
        ) && esValido;

        return esValido;
    }

    // Validación en tiempo real.
    [run, nombre, apellidos, correo, password, confirmPassword, selectRegion, selectComuna, direccion]
        .forEach(input => {
            input.addEventListener("input", validarFormulario);
            input.addEventListener("change", validarFormulario);
        });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const runNormalizado = limpiarRun(run.value);
        const correoNormalizado = correo.value.trim().toLowerCase();

        const existeCorreo = usuarios.some(
            usuario => usuario.correo?.toLowerCase() === correoNormalizado
        );

        if (existeCorreo) {
            correo.classList.add("is-invalid");
            correo.classList.remove("is-valid");
            alert("El correo electrónico ya se encuentra registrado.");
            return;
        }

        const existeRun = usuarios.some(
            usuario => limpiarRun(usuario.run) === runNormalizado
        );

        if (existeRun) {
            run.classList.add("is-invalid");
            run.classList.remove("is-valid");
            alert("El RUN ya se encuentra registrado.");
            return;
        }

        const regionSeleccionada = regionesComunas[selectRegion.value];

        const nuevoUsuario = {
            id: Date.now(),
            run: runNormalizado,
            nombre: nombre.value.trim(),
            apellidos: apellidos.value.trim(),
            correo: correoNormalizado,
            password: password.value.trim(),
            fechaNacimiento: fechaNacimiento.value,
            region: regionSeleccionada.region,
            comuna: selectComuna.value,
            direccion: direccion.value.trim(),
            rol: "Cliente",
            estado: "Activo",
            compras: []
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        alert("¡Registro completado con éxito!");
        window.location.href = "login.html";
    });
});
