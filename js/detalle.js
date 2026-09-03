document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener lista de productos desde localStorage o fallback
    function obtenerProductos() {
        const guardados = localStorage.getItem("productosNubeplay");
        if (guardados) return JSON.parse(guardados);
        
        return [
            { id: 1, nombre: "Grand Theft Auto VI (GTA 6)", categoria: "juegos", precio: 69990, imagen: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop", descripcion: "La entrega más esperada de Rockstar Games ambientada en Vice City." },
            { id: 2, nombre: "Consola PlayStation 5", categoria: "consolas", precio: 549990, imagen: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop", descripcion: "Experimenta tiempos de carga ultrarrápidos y gráficos de última generación." },
            { id: 3, nombre: "Mando Inalámbrico DualSense", categoria: "accesorios", precio: 64990, imagen: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?q=80&w=800&auto=format&fit=crop", descripcion: "Retroalimentación háptica y gatillos adaptativos para mayor inmersión." },
            { id: 4, nombre: "Audífonos Gamer Wireless 7.1", categoria: "accesorios", precio: 45990, imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop", descripcion: "Sonido envolvente surround 7.1 con micrófono con cancelación de ruido." },
            { id: 5, nombre: "Elden Ring: Shadow of the Erdtree", categoria: "juegos", precio: 39990, imagen: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop", descripcion: "Aclama la expansión del galardonado juego del año con nuevas tierras y jefes." },
            { id: 6, nombre: "Nintendo Switch OLED", categoria: "consolas", precio: 329990, imagen: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=800&auto=format&fit=crop", descripcion: "Pantalla OLED de 7 pulgadas con colores vibrantes para jugar donde quieras." }
        ];
    }

    // 2. Leer ID desde la URL (?id=X)
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = parseInt(urlParams.get("id"));

    const listaProductos = obtenerProductos();
    const producto = listaProductos.find(p => p.id === productoId);

    // Formateador de moneda
    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(precio);
    }

    // Actualizar badge del carrito
    function actualizarContador() {
        const carrito = JSON.parse(localStorage.getItem("carritoNubeplay")) || [];
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        const contadorCarrito = document.getElementById("contadorCarrito");
        if (contadorCarrito) contadorCarrito.textContent = totalItems;
    }

    // Si el producto no existe o la URL no tiene ID válido
    if (!producto) {
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
        actualizarContador();
        return;
    }

    // 3. Renderizar los datos del producto en los elementos HTML
    document.getElementById("breadcrumbNombre").textContent = producto.nombre;
    document.getElementById("nombreProducto").textContent = producto.nombre;
    document.getElementById("categoriaBadge").textContent = producto.categoria;
    document.getElementById("precioProducto").textContent = formatearPrecio(producto.precio);
    document.getElementById("descripcionProducto").textContent = producto.descripcion;
    
    const imgPrincipal = document.getElementById("imagenPrincipal");
    imgPrincipal.src = producto.imagen;
    imgPrincipal.alt = producto.nombre;

    // 4. Control de selector de cantidad
    const inputCantidad = document.getElementById("inputCantidad");
    const btnRestar = document.getElementById("btnRestarCant");
    const btnSumar = document.getElementById("btnSumarCant");

    btnRestar.addEventListener("click", () => {
        let cantidad = parseInt(inputCantidad.value) || 1;
        if (cantidad > 1) inputCantidad.value = cantidad - 1;
    });

    btnSumar.addEventListener("click", () => {
        let cantidad = parseInt(inputCantidad.value) || 1;
        inputCantidad.value = cantidad + 1;
    });

    // 5. Agregar al carrito desde el detalle
    const btnAgregar = document.getElementById("btnAgregarCarrito");
    const alertaDetalle = document.getElementById("alertaDetalle");
    const mensajeAlerta = document.getElementById("mensajeAlerta");

    btnAgregar.addEventListener("click", () => {
        const cantidadAAgregar = parseInt(inputCantidad.value) || 1;
        let carrito = JSON.parse(localStorage.getItem("carritoNubeplay")) || [];
        const index = carrito.findIndex(item => item.id === producto.id);

        if (index !== -1) {
            carrito[index].cantidad += cantidadAAgregar;
        } else {
            carrito.push({ ...producto, cantidad: cantidadAAgregar });
        }

        localStorage.setItem("carritoNubeplay", JSON.stringify(carrito));
        actualizarContador();

        if (alertaDetalle && mensajeAlerta) {
            mensajeAlerta.textContent = `Se agregaron ${cantidadAAgregar} unidad(es) de "${producto.nombre}" al carrito.`;
            alertaDetalle.classList.remove("d-none");
            setTimeout(() => {
                alertaDetalle.classList.add("d-none");
            }, 3000);
        }
    });

    // 6. Funcionalidad del formulario de reseñas dinámicas
    const formResena = document.getElementById("formResena");
    const listaResenas = document.getElementById("listaResenas");

    if (formResena && listaResenas) {
        formResena.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById("nombreResena").value.trim();
            const puntuacion = document.getElementById("puntuacionResena").value;
            const comentario = document.getElementById("comentarioResena").value.trim();

            if (!nombre || !comentario) return;

            let estrellasHTML = "";
            for (let i = 1; i <= 5; i++) {
                if (i <= parseInt(puntuacion)) {
                    estrellasHTML += '<i class="bi bi-star-fill"></i>';
                } else {
                    estrellasHTML += '<i class="bi bi-star"></i>';
                }
            }

            const nuevaResena = document.createElement("div");
            nuevaResena.className = "border-bottom pb-3 mb-3";
            nuevaResena.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-dark">${nombre}</strong>
                    <small class="text-muted">Hace un momento</small>
                </div>
                <div class="text-warning small mb-1">
                    ${estrellasHTML}
                </div>
                <p class="text-secondary mb-0 small">${comentario}</p>
            `;

            listaResenas.prepend(nuevaResena);
            formResena.reset();
        });
    }

    actualizarContador();
});