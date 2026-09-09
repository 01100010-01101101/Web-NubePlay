document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorProductos");
    const inputBuscar = document.getElementById("inputBuscar");
    const selectCategoria = document.getElementById("selectCategoria");
    const contadorCarrito = document.getElementById("contadorCarrito");
    const alertaCarrito = document.getElementById("alertaCarrito");
    const mensajeAlerta = document.getElementById("mensajeAlerta");

    // Catálogo 
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

    function obtenerProductos() {
        let prods = JSON.parse(localStorage.getItem("productos"));
        if (!prods || prods.length === 0) {
            prods = productosSemilla;
            localStorage.setItem("productos", JSON.stringify(prods));
        }
        return prods;
    }

    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(precio);
    }

    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem("carritoNubeplay")) || [];
    }

    function guardarCarrito(carrito) {
        localStorage.setItem("carritoNubeplay", JSON.stringify(carrito));
    }

    function actualizarContador() {
        if (!contadorCarrito) return;
        const carrito = obtenerCarrito();
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        contadorCarrito.textContent = totalItems;
    }

    function cargarProductos() {
        if (!contenedor) return;

        const productos = obtenerProductos();
        const buscar = inputBuscar ? inputBuscar.value.trim().toLowerCase() : "";
        const categoria = selectCategoria ? selectCategoria.value : "todas";

        const filtrados = productos.filter(p => {
            const coincideNombre = p.nombre.toLowerCase().includes(buscar);
            const coincideCategoria = categoria === "todas" || p.categoria.toLowerCase() === categoria.toLowerCase();
            return coincideNombre && coincideCategoria;
        });

        renderizarProductos(filtrados);
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
                                <button class="btn btn-primary btn-sm fw-bold btn-agregar" data-id="${producto.id}">
                                    <i class="bi bi-cart-plus me-1"></i> Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contenedor.appendChild(col);
        });

        document.querySelectorAll(".btn-agregar").forEach(boton => {
            boton.addEventListener("click", (e) => {
                const idProd = parseInt(e.currentTarget.getAttribute("data-id"));
                agregarAlCarrito(idProd);
            });
        });
    }

    function agregarAlCarrito(productoId) {
        const productos = obtenerProductos();
        const productoTarget = productos.find(p => p.id === productoId);
        if (!productoTarget) return;

        let carrito = obtenerCarrito();
        const itemEnCarrito = carrito.find(item => item.id === productoId);

        if (itemEnCarrito) {
            itemEnCarrito.cantidad += 1;
        } else {
            carrito.push({
                id: productoTarget.id,
                nombre: productoTarget.nombre,
                precio: productoTarget.precio,
                categoria: productoTarget.categoria,
                imagen: productoTarget.imagen,
                cantidad: 1
            });
        }

        guardarCarrito(carrito);
        actualizarContador();

        if (alertaCarrito && mensajeAlerta) {
            mensajeAlerta.textContent = `"${productoTarget.nombre}" añadido al carrito.`;
            alertaCarrito.classList.remove("d-none");
            setTimeout(() => alertaCarrito.classList.add("d-none"), 2500);
        }
    }

    if (inputBuscar) inputBuscar.addEventListener("input", cargarProductos);
    if (selectCategoria) selectCategoria.addEventListener("change", cargarProductos);

    cargarProductos();
    actualizarContador();
});

