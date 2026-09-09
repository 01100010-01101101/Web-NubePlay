document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formContacto");
    const nombre = document.getElementById("nombreContacto");
    const correo = document.getElementById("correoContacto");
    const comentario = document.getElementById("comentarioContacto");
    const contadorCaracteres = document.getElementById("contadorCaracteres");

    function validarCorreo(email) {
        const valor = email.trim();

        if (valor === "") {
            return true;
        }

        if (valor.length > 100) {
            return false;
        }

        const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        return dominiosPermitidos.some(dominio => valor.toLowerCase().endsWith(dominio));
    }

    function actualizarValidacion() {
        let esValido = true;

        if (nombre.value.trim() === "" || nombre.value.length > 100) {
            nombre.classList.add("is-invalid");
            nombre.classList.remove("is-valid");
            esValido = false;
        } else {
            nombre.classList.remove("is-invalid");
            nombre.classList.add("is-valid");
        }

        if (!validarCorreo(correo.value)) {
            correo.classList.add("is-invalid");
            correo.classList.remove("is-valid");
            esValido = false;
        } else if (correo.value.trim() !== "") {
            correo.classList.remove("is-invalid");
            correo.classList.add("is-valid");
        } else {
            correo.classList.remove("is-invalid", "is-valid");
        }

        if (comentario.value.trim() === "" || comentario.value.length > 500) {
            comentario.classList.add("is-invalid");
            comentario.classList.remove("is-valid");
            esValido = false;
        } else {
            comentario.classList.remove("is-invalid");
            comentario.classList.add("is-valid");
        }

        return esValido;
    }

    comentario.addEventListener("input", () => {
        contadorCaracteres.textContent = comentario.value.length;
        actualizarValidacion();
    });

    [nombre, correo].forEach(input => {
        input.addEventListener("input", actualizarValidacion);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!actualizarValidacion()) {
            return;
        }

        alert("¡Mensaje enviado con éxito! Gracias por contactarte con NUBEPLAY.");
        form.reset();
        contadorCaracteres.textContent = "0";

        [nombre, correo, comentario].forEach(input => {
            input.classList.remove("is-valid", "is-invalid");
        });
    });
});
