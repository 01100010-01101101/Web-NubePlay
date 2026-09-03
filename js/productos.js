document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api";
    const contenedor = document.getElementById("contenedorProductos");
    const inputBuscar = document.getElementById("inputBuscar");
    const selectCategoria = document.getElementById("selectCategoria");
    const contadorCarrito = document.getElementById("contadorCarrito");
    const alertaCarrito = document.getElementById("alertaCarrito");
    const mensajeAlerta = document.getElementById("mensajeAlerta");

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
        if (!contadorCarrito) return;
        try {
            const res = await fetch(`${API_URL}/carrito/${obtenerSessionId()}`);
            if (res.ok) {
                const data = await res.json();
                const totalItems = data.items.reduce((acc, item) => acc + item.cantidad, 0);
                contadorCarrito.textContent = totalItems;
            }
        } catch (err) {
            console.error("Error al obtener estado del carrito:", err);
        }
    }

    async function cargarProductos() {
        if (!contenedor) return;

        const buscar = inputBuscar ? inputBuscar.value.trim() : "";
        const categoria = selectCategoria ? selectCategoria.value : "todas";

        try {
            const url = new URL(`${API_URL}/productos`);
            if (buscar) url.searchParams.append("buscar", buscar);
            if (categoria) url.searchParams.append("categoria", categoria);

            const res = await fetch(url);
            const productos = await res.json();

            renderizarProductos(productos);
        } catch (err) {
            console.error("Error al cargar productos desde la API:", err);
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle display-3 text-danger"></i>
                    <h4 class="mt-3 text-muted">Error al conectar con la base de datos</h4>
                </div>
            `;
        }
    }

    function renderizarProductos(productos) {
        contenedor.innerHTML = "";

        if (productos.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-emoji-frown display-3 text-muted"></i>
                    <h4 class="mt-3 text-muted">No se encontraron productos</h4>
                </div>
            `;
            return;
        }

        productos.forEach(producto => {
            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4";
            col.innerHTML = `
                <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 200px; object-fit: cover;">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="mb-2">
                            <span class="badge bg-secondary text-capitalize">${producto.categoria}</span>
                        </div>
                        <h5 class="card-title fw-bold text-dark">${producto.nombre}</h5>
                        <p class="card-text text-secondary small flex-grow-1">${producto.descripcion}</p>
                        <div class="mt-3 pt-3 border-top">
                            <span class="fs-5 fw-bold text-primary d-block mb-3">${formatearPrecio(producto.precio)}</span>
                            <div class="d-grid gap-2">
                                <a href="detalle-producto.html?id=${producto.id}" class="btn btn-outline-primary btn-sm fw-bold">
                                    <i class="bi bi-eye me-1"></i> Ver Detalle
                                </a>
                                <button class="btn btn-primary btn-sm fw-bold btn-agregar" data-id="${producto.id}" data-nombre="${producto.nombre}">
                                    <i class="bi bi-cart-plus me-1"></i> Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contenedor.appendChild(col);
        });

        document.querySelectorAll(".btn-agregar").forEach(boton => {
            boton.addEventListener("click", async (e) => {
                const idProd = parseInt(e.currentTarget.getAttribute("data-id"));
                const nombreProd = e.currentTarget.getAttribute("data-nombre");
                await agregarAlCarrito(idProd, nombreProd);
            });
        });
    }

    async function agregarAlCarrito(productoId, nombreProducto) {
        try {
            const res = await fetch(`${API_URL}/carrito`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: obtenerSessionId(),
                    productoId: productoId,
                    cantidad: 1
                })
            });

            if (res.ok) {
                actualizarContador();
                if (alertaCarrito && mensajeAlerta) {
                    mensajeAlerta.textContent = `"${nombreProducto}" añadido al carrito.`;
                    alertaCarrito.classList.remove("d-none");
                    setTimeout(() => alertaCarrito.classList.add("d-none"), 2500);
                }
            }
        } catch (err) {
            console.error("Error al agregar al carrito:", err);
        }
    }

    if (inputBuscar) inputBuscar.addEventListener("input", cargarProductos);
    if (selectCategoria) selectCategoria.addEventListener("change", cargarProductos);

    cargarProductos();
    actualizarContador();
});