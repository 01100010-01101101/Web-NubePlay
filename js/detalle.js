document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:8080/api";
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = parseInt(urlParams.get("id"));

    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(precio);
    }

    function obtenerSessionId() {
        let sessionId = localStorage.getItem("nubeplay_session_id");
        if (!sessionId) {
            sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("nubeplay_session_id", sessionId);
        }
        return sessionId;
    }

    async function actualizarContador() {
        const contadorCarrito = document.getElementById("contadorCarrito");
        if (!contadorCarrito) return;
        try {
            const res = await fetch(`${API_URL}/carrito/${obtenerSessionId()}`);
            if (res.ok) {
                const data = await res.json();
                const totalItems = data.items.reduce((acc, item) => acc + item.cantidad, 0);
                contadorCarrito.textContent = totalItems;
            }
        } catch (err) {
            console.error("Error al consultar contador:", err);
        }
    }

    if (!productoId) {
        mostrarError();
        return;
    }

    let producto = null;

    try {
        const res = await fetch(`${API_URL}/productos/${productoId}`);
        if (!res.ok) throw new Error("Producto no encontrado");
        producto = await res.json();
    } catch (err) {
        mostrarError();
        return;
    }

    // Renderizar datos del producto
    document.getElementById("breadcrumbNombre").textContent = producto.nombre;
    document.getElementById("nombreProducto").textContent = producto.nombre;
    document.getElementById("categoriaBadge").textContent = producto.categoria;
    document.getElementById("precioProducto").textContent = formatearPrecio(producto.precio);
    document.getElementById("descripcionProducto").textContent = producto.descripcion;
    
    const imgPrincipal = document.getElementById("imagenPrincipal");
    imgPrincipal.src = producto.imagen;
    imgPrincipal.alt = producto.nombre;

    // Selector de cantidad
    const inputCantidad = document.getElementById("inputCantidad");
    const btnRestar = document.getElementById("btnRestarCant");
    const btnSumar = document.getElementById("btnSumarCant");

    if (btnRestar && btnSumar && inputCantidad) {
        btnRestar.addEventListener("click", () => {
            let cant = parseInt(inputCantidad.value) || 1;
            if (cant > 1) inputCantidad.value = cant - 1;
        });

        btnSumar.addEventListener("click", () => {
            let cant = parseInt(inputCantidad.value) || 1;
            inputCantidad.value = cant + 1;
        });
    }

    // Agregar al carrito
    const btnAgregar = document.getElementById("btnAgregarCarrito");
    const alertaDetalle = document.getElementById("alertaDetalle");
    const mensajeAlerta = document.getElementById("mensajeAlerta");

    if (btnAgregar) {
        btnAgregar.addEventListener("click", async () => {
            const cantidad = parseInt(inputCantidad.value) || 1;
            try {
                const res = await fetch(`${API_URL}/carrito`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: obtenerSessionId(),
                        productoId: producto.id,
                        cantidad: cantidad
                    })
                });

                if (res.ok) {
                    actualizarContador();
                    if (alertaDetalle && mensajeAlerta) {
                        mensajeAlerta.textContent = `Se agregaron ${cantidad} unidad(es) de "${producto.nombre}" al carrito.`;
                        alertaDetalle.classList.remove("d-none");
                        setTimeout(() => alertaDetalle.classList.add("d-none"), 3000);
                    }
                }
            } catch (err) {
                console.error("Error al agregar al carrito:", err);
            }
        });
    }

    function mostrarError() {
        const contenedor = document.getElementById("contenedorDetalle");
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                    <h2 class="mt-3">Producto no encontrado</h2>
                    <p class="text-muted">El producto seleccionado no existe o fue removido.</p>
                    <a href="productos.html" class="btn btn-primary mt-2">Volver al Catálogo</a>
                </div>
            `;
        }
    }

    actualizarContador();
});