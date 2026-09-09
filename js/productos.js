document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorProductos");
    const destacados = document.getElementById("productosDestacados");
    const inputBuscar = document.getElementById("inputBuscar");
    const selectCategoria = document.getElementById("selectCategoria");
    const contadorCarrito = document.getElementById("contadorCarrito");
    const alertaCarrito = document.getElementById("alertaCarrito");
    const mensajeAlerta = document.getElementById("mensajeAlerta");


    const productosSemilla = [
        {
            id: 1,
            nombre: "PlayStation 5",
            categoria: "consolas",
            precio: 549990,
            stock: 10,
            descripcion: "Consola de última generación con SSD de alta velocidad y soporte 4K.",
            imagen: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 2,
            nombre: "Xbox Series X",
            categoria: "consolas",
            precio: 529990,
            stock: 8,
            descripcion: "La consola Xbox más rápida y potente de la historia.",
            imagen: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 3,
            nombre: "The Legend of Zelda: Tears of the Kingdom",
            categoria: "juegos",
            precio: 59990,
            stock: 25,
            descripcion: "Aventura épica a través de las tierras y los cielos de Hyrule.",
            imagen: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 4,
            nombre: "Mando Inalámbrico DualSense PS5",
            categoria: "accesorios",
            precio: 69990,
            stock: 15,
            descripcion: "Retroalimentación háptica y gatillos adaptativos dinámicos.",
            imagen: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=600&q=80"
        }
    ];


    function leerJSON(clave, valorPorDefecto) {
        try {
            return JSON.parse(localStorage.getItem(clave)) ?? valorPorDefecto;
        } catch (error) {
            console.warn(`No se pudo leer ${clave}.`, error);
            return valorPorDefecto;
        }
    }


    function obtenerProductos() {
        let productos = leerJSON("productos", []);
        if (!Array.isArray(productos) || productos.length === 0) {
            productos = productosSemilla;
            localStorage.setItem("productos", JSON.stringify(productos));
        }
        return productos;
    }


    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP"
        }).format(Number(precio) || 0);
    }


    function obtenerCarrito() {
        const carrito = leerJSON("carritoNubeplay", []);
        return Array.isArray(carrito) ? carrito : [];
    }


    function guardarCarrito(carrito) {
        localStorage.setItem("carritoNubeplay", JSON.stringify(carrito));
    }


    function actualizarContador() {
        const carrito = obtenerCarrito();
        const totalItems = carrito.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
        if (contadorCarrito) contadorCarrito.textContent = totalItems;
        if (typeof window.actualizarNavbarCarrito === "function") {
            window.actualizarNavbarCarrito();
        }
    }


    function cargarCatalogo() {
        if (!contenedor) return;


        const productos = obtenerProductos();
        const buscar = inputBuscar ? inputBuscar.value.trim().toLowerCase() : "";
        const categoria = selectCategoria ? selectCategoria.value : "todas";


        const filtrados = productos.filter(producto => {
            const nombre = String(producto.nombre || "").toLowerCase();
            const categoriaProducto = String(producto.categoria || "").toLowerCase();
            const coincideNombre = nombre.includes(buscar);
            const coincideCategoria = categoria === "todas" || categoriaProducto === categoria.toLowerCase();
            return coincideNombre && coincideCategoria;
        });


        renderizarProductos(contenedor, filtrados);
    }


    function cargarDestacados() {
        if (!destacados) return;
        const productos = obtenerProductos().filter(producto => Number(producto.stock) > 0).slice(0, 4);
        renderizarProductos(destacados, productos, true);
    }


    function crearTarjeta(producto, destacado = false) {
        const col = document.createElement("div");
        col.className = destacado ? "col-md-6 col-lg-3" : "col-md-6 col-lg-4";


        const stock = Number(producto.stock) || 0;
        const agotado = stock <= 0;


        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <img src="${producto.imagen || "https://via.placeholder.com/600x400?text=NUBEPLAY"}"
                     class="card-img-top"
                     alt="${escaparHTML(producto.nombre)}"
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/600x400?text=NUBEPLAY'">
                <div class="card-body p-4 d-flex flex-column">
                    <div class="mb-2 d-flex justify-content-between align-items-center gap-2">
                        <span class="badge bg-secondary text-capitalize">${escaparHTML(producto.categoria)}</span>
                        ${agotado ? '<span class="badge bg-danger">Agotado</span>' : `<span class="badge bg-success">Stock: ${stock}</span>`}
                    </div>
                    <h5 class="card-title fw-bold text-dark">${escaparHTML(producto.nombre)}</h5>
                    <p class="card-text text-secondary small flex-grow-1">${escaparHTML(producto.descripcion || "Sin descripción disponible.")}</p>
                    <div class="mt-3 pt-3 border-top">
                        <span class="fs-5 fw-bold text-primary d-block mb-3">${formatearPrecio(producto.precio)}</span>
                        <div class="d-grid gap-2">
                            <a href="detalle-producto.html?id=${encodeURIComponent(producto.id)}" class="btn btn-outline-primary btn-sm fw-bold">
                                <i class="bi bi-eye me-1"></i> Ver detalle
                            </a>
                            <button class="btn btn-primary btn-sm fw-bold btn-agregar" data-id="${producto.id}" ${agotado ? "disabled" : ""}>
                                <i class="bi bi-cart-plus me-1"></i> ${agotado ? "Agotado" : "Agregar al Carrito"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;


        return col;
    }


    function renderizarProductos(contenedorDestino, productos, destacado = false) {
        contenedorDestino.innerHTML = "";


        if (productos.length === 0) {
            contenedorDestino.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-emoji-frown display-3 text-muted"></i>
                    <h4 class="mt-3 text-muted">No se encontraron productos</h4>
                </div>
            `;
            return;
        }


        productos.forEach(producto => {
            contenedorDestino.appendChild(crearTarjeta(producto, destacado));
        });


        contenedorDestino.querySelectorAll(".btn-agregar").forEach(boton => {
            boton.addEventListener("click", () => {
                agregarAlCarrito(Number(boton.dataset.id));
            });
        });
    }


    function agregarAlCarrito(productoId) {
        const productos = obtenerProductos();
        const producto = productos.find(item => Number(item.id) === productoId);
        if (!producto) return;


        const stock = Number(producto.stock) || 0;
        if (stock <= 0) {
            mostrarAlerta("El producto está agotado.", "danger");
            return;
        }


        const carrito = obtenerCarrito();
        const item = carrito.find(itemCarrito => Number(itemCarrito.id) === productoId);


        if (item) {
            if (Number(item.cantidad) >= stock) {
                mostrarAlerta("No hay stock suficiente para agregar otra unidad.", "danger");
                return;
            }
            item.cantidad += 1;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: Number(producto.precio) || 0,
                categoria: producto.categoria,
                imagen: producto.imagen,
                cantidad: 1
            });
        }


        guardarCarrito(carrito);
        actualizarContador();
        mostrarAlerta(`"${producto.nombre}" añadido al carrito.`, "success");
    }


    function mostrarAlerta(mensaje, tipo = "success") {
        if (!alertaCarrito || !mensajeAlerta) return;
        alertaCarrito.className = `alert alert-${tipo} alert-dismissible fade show position-fixed bottom-0 end-0 m-4 shadow-lg`;
        alertaCarrito.style.zIndex = "1050";
        mensajeAlerta.textContent = mensaje;
        alertaCarrito.classList.remove("d-none");
        clearTimeout(window.__nubeplayAlertaTimeout);
        window.__nubeplayAlertaTimeout = setTimeout(() => alertaCarrito.classList.add("d-none"), 2500);
    }


    function escaparHTML(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }


    if (inputBuscar) inputBuscar.addEventListener("input", cargarCatalogo);
    if (selectCategoria) selectCategoria.addEventListener("change", cargarCatalogo);


    cargarCatalogo();
    cargarDestacados();
    actualizarContador();
});



