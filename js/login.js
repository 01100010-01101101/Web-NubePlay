document.addEventListener("DOMContentLoaded", () => {

    const adminDefault = {
        id: 999,
        run: "111111111",
        nombre: "Administrador Nubeplay",
        correo: "admin@duoc.cl",
        password: "admin",
        rol: "Admin",
        estado: "Activo",
        compras: []
    };

    // Asegurar que exista la lista de usuarios en localStorage
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Si el usuario admin no está en la lista, lo registramos por defecto
    const existeAdmin = usuarios.some(u => u.correo.toLowerCase() === adminDefault.correo.toLowerCase());
    if (!existeAdmin) {
        usuarios.push(adminDefault);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    // ----------------------------------------------------
    // REFERENCIAS AL DOM
    // ----------------------------------------------------
    const formLogin = document.getElementById("formLogin");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const recordarmeCheck = document.getElementById("recordarme");
    const mensajeLogin = document.getElementById("mensajeLogin");

    if (!formLogin) return;

    // Rellenar correo si fue recordado anteriormente
    const correoGuardado = localStorage.getItem("recordar_correo");
    if (correoGuardado && emailInput) {
        emailInput.value = correoGuardado;
        recordarmeCheck.checked = true;
    }

    // Limpiar alertas al escribir
    [emailInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                input.classList.remove("is-invalid");
                mensajeLogin.classList.add("d-none");
            });
        }
    });

    // ----------------------------------------------------
    // VALIDACIONES
    // ----------------------------------------------------
    function validarCorreo(correo) {
        if (!correo || correo.length > 100) return false;
        const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        return dominiosPermitidos.some(dominio => correo.toLowerCase().endsWith(dominio));
    }

    function validarPassword(pass) {
        return pass && pass.length >= 4 && pass.length <= 10;
    }

    // ----------------------------------------------------
    // MANEJO DE INICIO DE SESIÓN
    // ----------------------------------------------------
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();

        const correoVal = emailInput.value.trim();
        const passVal = passwordInput.value.trim();

        let esValido = true;

        // Validar formato de Correo
        if (!validarCorreo(correoVal)) {
            emailInput.classList.add("is-invalid");
            emailInput.classList.remove("is-valid");
            esValido = false;
        } else {
            emailInput.classList.remove("is-invalid");
            emailInput.classList.add("is-valid");
        }

        // Validar formato de Contraseña
        if (!validarPassword(passVal)) {
            passwordInput.classList.add("is-invalid");
            passwordInput.classList.remove("is-valid");
            esValido = false;
        } else {
            passwordInput.classList.remove("is-invalid");
            passwordInput.classList.add("is-valid");
        }

        if (!esValido) {
            mensajeLogin.className = "alert alert-danger";
            mensajeLogin.textContent = "Por favor, corrige los errores en los campos antes de continuar.";
            mensajeLogin.classList.remove("d-none");
            return;
        }

        // Obtener lista actualizada de usuarios registrados en localStorage
        const listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        // Buscar coincidencia de correo y contraseña
        const usuarioEncontrado = listaUsuarios.find(
            u => u.correo.toLowerCase() === correoVal.toLowerCase() && u.password === passVal
        );

        if (!usuarioEncontrado) {
            mensajeLogin.className = "alert alert-danger";
            mensajeLogin.textContent = "Correo o contraseña incorrectos.";
            mensajeLogin.classList.remove("d-none");
            return;
        }

        // Verificar si la cuenta está activa
        if (usuarioEncontrado.estado === "Inactivo") {
            mensajeLogin.className = "alert alert-warning";
            mensajeLogin.textContent = "Tu cuenta se encuentra inactiva. Contacta al soporte.";
            mensajeLogin.classList.remove("d-none");
            return;
        }

        // Manejar preferencia "Recordarme"
        if (recordarmeCheck.checked) {
            localStorage.setItem("recordar_correo", correoVal);
        } else {
            localStorage.removeItem("recordar_correo");
        }

        // Guardar la sesión activa del usuario
        localStorage.setItem("usuario_nubeplay", JSON.stringify(usuarioEncontrado));

        // Mensaje de éxito y redirección basada en el rol
        mensajeLogin.className = "alert alert-success";
        mensajeLogin.textContent = `¡Bienvenido/a ${usuarioEncontrado.nombre}! Redirigiendo...`;
        mensajeLogin.classList.remove("d-none");

        // Normalizar comparación del rol
        const rolNormalizado = usuarioEncontrado.rol ? usuarioEncontrado.rol.toLowerCase() : "";
        const esAdmin = rolNormalizado === "admin" || rolNormalizado === "administrador";

        setTimeout(() => {
            if (esAdmin) {
                // Redirección saliendo de la carpeta 'pages/' hacia la raíz donde está admin.html
                window.location.href = "admin.html";
            } else {
                window.location.href = "productos.html";
            }
        }, 1200);
    });
});