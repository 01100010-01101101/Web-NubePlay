document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formContacto");
    const nombre = document.getElementById("nombreContacto");
    const correo = document.getElementById("correoContacto");
    const comentario = document.getElementById("comentarioContacto");
    const contadorCaracteres = document.getElementById("contadorCaracteres");

    comentario.addEventListener("input", () => {
        contadorCaracteres.textContent = comentario.value.length;
    });

    function validarCorreo(email) {
        if (email.trim() === "") return true; 
        if (email.length > 100) return false;

        const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        return dominiosPermitidos.some(dominio => email.toLowerCase().endsWith(dominio));
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

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
        } else {
            correo.classList.remove("is-invalid");
            if (correo.value.trim() !== "") {
                correo.classList.add("is-valid");
            }
        }

        if (comentario.value.trim() === "" || comentario.value.length > 500) {
            comentario.classList.add("is-invalid");
            comentario.classList.remove("is-valid");
            esValido = false;
        } else {
            comentario.classList.remove("is-invalid");
            comentario.classList.add("is-valid");
        }

        if (esValido) {
            alert("¡Mensaje enviado con éxito! Gracias por contactarte con NUBEPLAY.");
            form.reset();
            contadorCaracteres.textContent = "0";
            
            nombre.classList.remove("is-valid");
            correo.classList.remove("is-valid");
            comentario.classList.remove("is-valid");
        }
    });
});

