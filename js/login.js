document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://web-nubeplay.onrender.com/api";
    const formLogin = document.getElementById("formLogin");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const mensajeLogin = document.getElementById("mensajeLogin");

    function validarCorreo(correo) {
        if (!correo || correo.length > 100) return false;
        const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        return dominiosPermitidos.some(dominio => correo.toLowerCase().endsWith(dominio));
    }

    function validarPassword(pass) {
        return pass && pass.length >= 4 && pass.length <= 10;
    }

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        const correoVal = emailInput.value.trim();
        const passVal = passwordInput.value.trim();

        let esValido = true;

        if (!validarCorreo(correoVal)) {
            emailInput.classList.add("is-invalid");
            emailInput.classList.remove("is-valid");
            esValido = false;
        } else {
            emailInput.classList.remove("is-invalid");
            emailInput.classList.add("is-valid");
        }

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

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: correoVal,
                    password: passVal
                })
            });

            const data = await res.json();

            if (!res.ok) {
                mensajeLogin.className = "alert alert-danger";
                mensajeLogin.textContent = data.error || "Credenciales incorrectas.";
                mensajeLogin.classList.remove("d-none");
                return;
            }

            // Guardar usuario en localStorage
            localStorage.setItem("usuario_nubeplay", JSON.stringify(data.usuario));

            mensajeLogin.className = "alert alert-success";
            mensajeLogin.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";
            mensajeLogin.classList.remove("d-none");

            setTimeout(() => {
                window.location.href = "productos.html";
            }, 1500);

        } catch (error) {
            console.error("Error en login:", error);
            mensajeLogin.className = "alert alert-danger";
            mensajeLogin.textContent = "Error al conectar con el servidor.";
            mensajeLogin.classList.remove("d-none");
        }
    });
});