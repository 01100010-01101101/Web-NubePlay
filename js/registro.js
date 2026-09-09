document.addEventListener("DOMContentLoaded", () => {
    const regionesComunas = [
        {
            region: "Región Metropolitana de Santiago",
            comunas: ["Santiago", "Puente Alto", "Maipú", "La Florida", "San Bernardo", "La Granja"]
        },
        {
            region: "Región de Valparaíso",
            comunas: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"]
        },
        {
            region: "Región del Biobío",
            comunas: ["Concepción", "Talcahuano", "Los Ángeles", "Chillán"]
        }
    ];

    const form = document.getElementById("formRegistro");
    const selectRegion = document.getElementById("region");
    const selectComuna = document.getElementById("comuna");

    // Cargar Regiones en el Select
    regionesComunas.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.region;
        selectRegion.appendChild(option);
    });

    // Evento al cambiar de región
    selectRegion.addEventListener("change", (e) => {
        const index = e.target.value;
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

    function validarRun(run) {
        const regRun = /^[0-9]{7,8}[0-9kK]{1}$/;
        return regRun.test(run);
    }

    function validarCorreo(correo) {
        const dominios = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        return dominios.some(d => correo.toLowerCase().endsWith(d));
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let esValido = true;

        const run = document.getElementById("run");
        const nombre = document.getElementById("nombre");
        const apellidos = document.getElementById("apellidos");
        const correo = document.getElementById("correo");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");
        const fechaNacimiento = document.getElementById("fechaNacimiento");
        const region = document.getElementById("region");
        const comuna = document.getElementById("comuna");
        const direccion = document.getElementById("direccion");

        // Validaciones
        if (!validarRun(run.value.trim())) {
            run.classList.add("is-invalid");
            run.classList.remove("is-valid");
            esValido = false;
        } else {
            run.classList.remove("is-invalid");
            run.classList.add("is-valid");
        }

        if (nombre.value.trim() === "" || nombre.value.length > 50) {
            nombre.classList.add("is-invalid");
            nombre.classList.remove("is-valid");
            esValido = false;
        } else {
            nombre.classList.remove("is-invalid");
            nombre.classList.add("is-valid");
        }

        if (apellidos.value.trim() === "" || apellidos.value.length > 100) {
            apellidos.classList.add("is-invalid");
            apellidos.classList.remove("is-valid");
            esValido = false;
        } else {
            apellidos.classList.remove("is-invalid");
            apellidos.classList.add("is-valid");
        }

        if (!validarCorreo(correo.value.trim())) {
            correo.classList.add("is-invalid");
            correo.classList.remove("is-valid");
            esValido = false;
        } else {
            correo.classList.remove("is-invalid");
            correo.classList.add("is-valid");
        }

        if (password.value.length < 4 || password.value.length > 10) {
            password.classList.add("is-invalid");
            password.classList.remove("is-valid");
            esValido = false;
        } else {
            password.classList.remove("is-invalid");
            password.classList.add("is-valid");
        }

        if (confirmPassword.value === "" || confirmPassword.value !== password.value) {
            confirmPassword.classList.add("is-invalid");
            confirmPassword.classList.remove("is-valid");
            esValido = false;
        } else {
            confirmPassword.classList.remove("is-invalid");
            confirmPassword.classList.add("is-valid");
        }

        if (region.value === "") {
            region.classList.add("is-invalid");
            region.classList.remove("is-valid");
            esValido = false;
        } else {
            region.classList.remove("is-invalid");
            region.classList.add("is-valid");
        }

        if (comuna.value === "") {
            comuna.classList.add("is-invalid");
            comuna.classList.remove("is-valid");
            esValido = false;
        } else {
            comuna.classList.remove("is-invalid");
            comuna.classList.add("is-valid");
        }

        if (direccion.value.trim() === "" || direccion.value.length > 300) {
            direccion.classList.add("is-invalid");
            direccion.classList.remove("is-valid");
            esValido = false;
        } else {
            direccion.classList.remove("is-invalid");
            direccion.classList.add("is-valid");
        }

        if (!esValido) return;

        // Recuperar usuarios existentes en localStorage
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        // Validar si el correo o RUN ya existen
        const existeCorreo = usuarios.some(u => u.correo === correo.value.trim());
        if (existeCorreo) {
            alert("El correo electrónico ya se encuentra registrado.");
            correo.classList.add("is-invalid");
            return;
        }

        // Crear objeto de nuevo usuario
        const nuevoUsuario = {
            id: Date.now(),
            run: run.value.trim(),
            nombre: `${nombre.value.trim()} ${apellidos.value.trim()}`,
            correo: correo.value.trim(),
            password: password.value.trim(),
            fechaNacimiento: fechaNacimiento.value,
            region: regionesComunas[region.value].region,
            comuna: comuna.value,
            direccion: `${direccion.value.trim()}, ${comuna.value}, ${regionesComunas[region.value].region}`,
            telefono: "+56 9 1234 5678", // Teléfono por defecto para mockup
            rol: "Cliente",
            estado: "Activo",
            compras: []
        };

        // Guardar en localStorage
        usuarios.push(nuevoUsuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        alert("¡Registro completado con éxito!");
        window.location.href = "login.html";
    });
});

