document.addEventListener("DOMContentLoaded", () => {
    const listaProductosBase = [
        {
            id: 1,
            nombre: "Grand Theft Auto VI (GTA 6)",
            categoria: "juegos",
            precio: 69990,
            imagen: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
            descripcion: "La entrega más esperada de Rockstar Games ambientada en Vice City."
        },
        {
            id: 2,
            nombre: "Consola PlayStation 5",
            categoria: "consolas",
            precio: 549990,
            imagen: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop",
            descripcion: "Experimenta tiempos de carga ultrarrápidos y gráficos de última generación."
        },
        {
            id: 3,
            nombre: "Mando Inalámbrico DualSense",
            categoria: "accesorios",
            precio: 64990,
            imagen: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?q=80&w=800&auto=format&fit=crop",
            descripcion: "Retroalimentación háptica y gatillos adaptativos para mayor inmersión."
        },
        {
            id: 4,
            nombre: "Audífonos Gamer Wireless 7.1",
            categoria: "accesorios",
            precio: 45990,
            imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
            descripcion: "Sonido envolvente surround 7.1 con micrófono con cancelación de ruido."
        },
        {
            id: 5,
            nombre: "Elden Ring: Shadow of the Erdtree",
            categoria: "juegos",
            precio: 39990,
            imagen: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
            descripcion: "Aclama la expansión del galardonado juego del año con nuevas tierras y jefes."
        },
        {
            id: 6,
            nombre: "Nintendo Switch OLED",
            categoria: "consolas",
            precio: 329990,
            imagen: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=800&auto=format&fit=crop",
            descripcion: "Pantalla OLED de 7 pulgadas con colores vibrantes para jugar donde quieras."
        }
    ];

    function obtenerProductos() {
        const guardados = localStorage.getItem("productosNubeplay");
        if (!guardados) {
            localStorage.setItem("productosNubeplay", JSON.stringify(listaProductosBase));
            return listaProductosBase;
        }
        return JSON.parse(guardados);
    }

    const listaProductos = obtenerProductos();
    const contenedor = document.getElementById("contenedorProductos");
    const inputBuscar = document.getElementById("inputBuscar");
    const selectCategoria = document.getElementById("selectCategoria");
    const contadorCarrito = document.getElementById("contadorCarrito");
    const alertaCarrito = document.getElementById("alertaCarrito");
    const mensajeAlerta = document.getElementById("mensajeAlerta");

    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(precio);
    }

    function actualizarContador() {
        const carrito = JSON.parse(localStorage.getItem("carritoNubeplay")) || [];
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        if (contadorCarrito) contadorCarrito.textContent = totalItems;
    }

    function renderizarProductos(productos) {
        if (!contenedor) return;
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
                                <button class="btn btn-primary btn-sm fw-bold btn-agregar" data-id="${producto.id}">
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
            boton.addEventListener("click", (e) => {
                const idProd = parseInt(e.currentTarget.getAttribute("data-id"));
                agregarAlCarrito(idProd);
            });
        });
    }

    function agregarAlCarrito(idProducto) {
        const productoEncontrado = listaProductos.find(p => p.id === idProducto);
        if (!productoEncontrado) return;

        let carrito = JSON.parse(localStorage.getItem("carritoNubeplay")) || [];
        const index = carrito.findIndex(item => item.id === idProducto);

        if (index !== -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({ ...productoEncontrado, cantidad: 1 });
        }

        localStorage.setItem("carritoNubeplay", JSON.stringify(carrito));
        actualizarContador();

        if (alertaCarrito && mensajeAlerta) {
            mensajeAlerta.textContent = `"${productoEncontrado.nombre}" añadido al carrito.`;
            alertaCarrito.classList.remove("d-none");
            setTimeout(() => {
                alertaCarrito.classList.add("d-none");
            }, 2500);
        }
    }

    function filtrarProductos() {
        const texto = inputBuscar.value.toLowerCase().trim();
        const categoria = selectCategoria.value;

        const productosFiltrados = listaProductos.filter(producto => {
            const coincideNombre = producto.nombre.toLowerCase().includes(texto);
            const coincideCategoria = categoria === "todas" || producto.categoria === categoria;
            return coincideNombre && coincideCategoria;
        });

        renderizarProductos(productosFiltrados);
    }

    if (inputBuscar) inputBuscar.addEventListener("input", filtrarProductos);
    if (selectCategoria) selectCategoria.addEventListener("change", filtrarProductos);

    renderizarProductos(listaProductos);
    actualizarContador();
});