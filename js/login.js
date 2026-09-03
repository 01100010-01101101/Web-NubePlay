document.addEventListener("DOMContentLoaded", () => {
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

    formLogin.addEventListener("submit", (e) => {
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

        mensajeLogin.className = "alert alert-success";
        mensajeLogin.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";
        mensajeLogin.classList.remove("d-none");

        setTimeout(() => {
            window.location.href = "productos.html";
        }, 1500);
    });
});