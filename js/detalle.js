document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = Number(urlParams.get("id"));

    const breadcrumbNombre = document.getElementById("breadcrumbNombre");
    const nombreProducto = document.getElementById("nombreProducto");
    const categoriaBadge = document.getElementById("categoriaBadge");
    const precioProducto = document.getElementById("precioProducto");
    const descripcionProducto = document.getElementById("descripcionProducto");
    const imagenPrincipal = document.getElementById("imagenPrincipal");
    const stockEstado = document.getElementById("stockEstado");
    const inputCantidad = document.getElementById("inputCantidad");
    const btnRestar = document.getElementById("btnRestarCant");
    const btnSumar = document.getElementById("btnSumarCant");
    const btnAgregar = document.getElementById("btnAgregarCarrito");
    const alertaDetalle = document.getElementById("alertaDetalle");
    const mensajeAlerta = document.getElementById("mensajeAlerta");

    function leerJSON(clave, valorPorDefecto) {
        try {
            return JSON.parse(localStorage.getItem(clave)) ?? valorPorDefecto;
        } catch (error) {
            console.warn(`No se pudo leer ${clave}.`, error);
            return valorPorDefecto;
        }
    }

    function obtenerProductos() {
        const productos = leerJSON("productos", []);
        return Array.isArray(productos) ? productos : [];
    }

    function obtenerCarrito() {
        const carrito = leerJSON("carritoNubeplay", []);
        return Array.isArray(carrito) ? carrito : [];
    }

    function guardarCarrito(carrito) {
        localStorage.setItem("carritoNubeplay", JSON.stringify(carrito));
    }

    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP"
        }).format(Number(precio) || 0);
    }

    function actualizarContador() {
        const contador = document.getElementById("contadorCarrito");
        const carrito = obtenerCarrito();
        const total = carrito.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);

        if (contador) contador.textContent = total;

        if (typeof window.actualizarNavbarCarrito === "function") {
            window.actualizarNavbarCarrito();
        }
    }

    function mostrarAlerta(mensaje, tipo = "success") {
        if (!alertaDetalle || !mensajeAlerta) return;

        alertaDetalle.className = `alert alert-${tipo} alert-dismissible fade show`;
        mensajeAlerta.textContent = mensaje;
        alertaDetalle.classList.remove("d-none");
    }

    function mostrarError() {
        const contenedor = document.getElementById("contenedorDetalle");
        if (!contenedor) return;

        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                <h2 class="mt-3">Producto no encontrado</h2>
                <p class="text-muted">El producto seleccionado no existe o fue removido.</p>
                <a href="productos.html" class="btn btn-primary mt-2">
                    <i class="bi bi-arrow-left me-1"></i> Volver al Catálogo
                </a>
            </div>
        `;
    }

    function escaparHTML(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    function obtenerResenas() {
        const resenas = leerJSON("resenasNubeplay", []);
        return Array.isArray(resenas) ? resenas : [];
    }

    function guardarResenas(resenas) {
        localStorage.setItem("resenasNubeplay", JSON.stringify(resenas));
    }

    function generarEstrellas(puntuacion) {
        let html = "";

        for (let i = 1; i <= 5; i += 1) {
            html += i <= Number(puntuacion)
                ? '<i class="bi bi-star-fill"></i>'
                : '<i class="bi bi-star"></i>';
        }

        return html;
    }

    function renderizarResenas(idProducto) {
        const listaResenas = document.getElementById("listaResenas");
        if (!listaResenas) return;

        const resenas = obtenerResenas().filter(
            resena => Number(resena.productoId) === Number(idProducto)
        );

        if (resenas.length === 0) {
            listaResenas.innerHTML = `
                <div class="text-center py-3 text-muted">
                    <i class="bi bi-chat-square-text fs-3 d-block mb-2"></i>
                    <p class="mb-0">Este producto aún no tiene reseñas.</p>
                    <small>Sé el primero en compartir tu opinión.</small>
                </div>
            `;
            return;
        }

        listaResenas.innerHTML = resenas
            .slice()
            .reverse()
            .map(resena => `
                <div class="border-bottom py-3">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <h6 class="fw-bold mb-1">${escaparHTML(resena.nombre)}</h6>
                            <div class="text-warning small mb-2">${generarEstrellas(resena.puntuacion)}</div>
                        </div>
                        <small class="text-muted">${escaparHTML(resena.fecha)}</small>
                    </div>
                    <p class="mb-0 text-secondary">${escaparHTML(resena.comentario)}</p>
                </div>
            `)
            .join("");
    }

    const productos = obtenerProductos();
    const producto = productos.find(item => Number(item.id) === productoId);

    if (!producto) {
        mostrarError();
        actualizarContador();
        return;
    }

    const stock = Number(producto.stock) || 0;

    if (breadcrumbNombre) breadcrumbNombre.textContent = producto.nombre;
    if (nombreProducto) nombreProducto.textContent = producto.nombre;
    if (categoriaBadge) categoriaBadge.textContent = producto.categoria || "Sin categoría";
    if (precioProducto) precioProducto.textContent = formatearPrecio(producto.precio);
    if (descripcionProducto) {
        descripcionProducto.textContent = producto.descripcion || "Sin descripción disponible.";
    }

    if (imagenPrincipal) {
        imagenPrincipal.src = producto.imagen || "https://via.placeholder.com/600x400?text=NUBEPLAY";
        imagenPrincipal.alt = producto.nombre;

        imagenPrincipal.onerror = () => {
            imagenPrincipal.src = "https://via.placeholder.com/600x400?text=NUBEPLAY";
        };
    }

    if (stockEstado) {
        stockEstado.textContent = stock > 0 ? `En stock: ${stock}` : "Agotado";
        stockEstado.className = stock > 0 ? "badge bg-success" : "badge bg-danger";
    }

    if (inputCantidad) {
        inputCantidad.min = "1";
        inputCantidad.max = String(Math.max(stock, 1));
        inputCantidad.value = stock > 0 ? "1" : "0";
    }

    if (btnRestar) {
        btnRestar.addEventListener("click", () => {
            const actual = Number(inputCantidad.value) || 1;
            inputCantidad.value = String(Math.max(1, actual - 1));
        });
    }

    if (btnSumar) {
        btnSumar.addEventListener("click", () => {
            const actual = Number(inputCantidad.value) || 1;

            if (actual < stock) {
                inputCantidad.value = String(actual + 1);
            } else {
                mostrarAlerta("No puedes superar el stock disponible.", "warning");
            }
        });
    }

    if (btnAgregar) {
        btnAgregar.disabled = stock <= 0;
        btnAgregar.innerHTML = stock > 0
            ? '<i class="bi bi-cart-plus me-2"></i> Añadir al Carrito'
            : '<i class="bi bi-x-circle me-2"></i> Producto agotado';

        btnAgregar.addEventListener("click", () => {
            const cantidad = Number(inputCantidad.value) || 1;

            if (stock <= 0) {
                mostrarAlerta("Este producto está agotado.", "danger");
                return;
            }

            if (cantidad < 1 || cantidad > stock) {
                mostrarAlerta("La cantidad seleccionada supera el stock disponible.", "danger");
                return;
            }

            const carrito = obtenerCarrito();
            const item = carrito.find(itemCarrito => Number(itemCarrito.id) === producto.id);
            const cantidadActual = item ? Number(item.cantidad) || 0 : 0;

            if (cantidadActual + cantidad > stock) {
                mostrarAlerta(`Solo hay ${stock - cantidadActual} unidad(es) disponibles para agregar.`, "danger");
                return;
            }

            if (item) {
                item.cantidad = cantidadActual + cantidad;
            } else {
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: Number(producto.precio) || 0,
                    categoria: producto.categoria,
                    imagen: producto.imagen,
                    cantidad
                });
            }

            guardarCarrito(carrito);
            actualizarContador();
            mostrarAlerta(`Se agregaron ${cantidad} unidad(es) de "${producto.nombre}" al carrito.`, "success");
        });
    }

    const formResena = document.getElementById("formResena");

    if (formResena) {
        formResena.addEventListener("submit", event => {
            event.preventDefault();

            const nombre = document.getElementById("nombreResena")?.value.trim();
            const puntuacion = Number(document.getElementById("puntuacionResena")?.value || 0);
            const comentario = document.getElementById("comentarioResena")?.value.trim();

            if (!nombre || !comentario || puntuacion < 1 || puntuacion > 5) {
                mostrarAlerta("Completa todos los campos de la reseña.", "warning");
                return;
            }

            const resenas = obtenerResenas();

            resenas.push({
                id: Date.now(),
                productoId: producto.id,
                nombre,
                puntuacion,
                comentario,
                fecha: new Date().toLocaleDateString("es-CL")
            });

            guardarResenas(resenas);
            renderizarResenas(producto.id);
            formResena.reset();
            mostrarAlerta("Tu reseña fue publicada correctamente.", "success");
        });
    }

    renderizarResenas(producto.id);
    actualizarContador();
});
