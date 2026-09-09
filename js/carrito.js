document.addEventListener("DOMContentLoaded", () => {
    const tablaCarrito = document.getElementById("tablaCarrito");
    const carritoVacio = document.getElementById("carritoVacio");
    const accionesCarrito = document.getElementById("accionesCarrito");
    const contadorCarrito = document.getElementById("contadorCarrito");
    const resumenSubtotal = document.getElementById("resumenSubtotal");
    const resumenDescuento = document.getElementById("resumenDescuento");
    const filaDescuento = document.getElementById("filaDescuento");
    const resumenTotal = document.getElementById("resumenTotal");
    const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
    const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
    const alerta = document.getElementById("alertaCarritoPage");

    const inputCupon = document.getElementById("inputCupon");
    const btnAplicarCupon = document.getElementById("btnAplicarCupon");
    const mensajeCupon = document.getElementById("mensajeCupon");

    let descuentoAplicado = false;

    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(precio);
    }

    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem("carritoNubeplay")) || [];
    }

    function guardarCarrito(carrito) {
        localStorage.setItem("carritoNubeplay", JSON.stringify(carrito));
    }

    function renderizarTabla() {
        const carrito = obtenerCarrito();
        tablaCarrito.innerHTML = "";

        if (carrito.length === 0) {
            carritoVacio.classList.remove("d-none");
            tablaCarrito.parentElement.parentElement.classList.add("d-none");
            accionesCarrito.classList.add("d-none");
            resumenSubtotal.textContent = formatearPrecio(0);
            resumenTotal.textContent = formatearPrecio(0);
            filaDescuento.classList.add("d-none");
            if (contadorCarrito) contadorCarrito.textContent = "0";
            return;
        }

        carritoVacio.classList.add("d-none");
        tablaCarrito.parentElement.parentElement.classList.remove("d-none");
        accionesCarrito.classList.remove("d-none");

        let subtotalGeneral = 0;
        let totalUnidades = 0;

        carrito.forEach((prod) => {
            const subtotal = prod.precio * prod.cantidad;
            subtotalGeneral += subtotal;
            totalUnidades += prod.cantidad;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-4">
                    <div class="d-flex align-items-center">
                        <img src="${prod.imagen}" alt="${prod.nombre}" class="rounded-3 me-3" style="width: 50px; height: 50px; object-fit: cover;">
                        <div>
                            <h6 class="mb-0 fw-bold">${prod.nombre}</h6>
                            <small class="text-capitalize text-muted">${prod.categoria}</small>
                        </div>
                    </div>
                </td>
                <td class="fw-semibold">${formatearPrecio(prod.precio)}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary btn-restar" data-id="${prod.id}" ${prod.cantidad <= 1 ? "disabled" : ""}>-</button>
                        <span class="btn btn-light disabled px-3 fw-bold text-dark">${prod.cantidad}</span>
                        <button class="btn btn-outline-secondary btn-sumar" data-id="${prod.id}">+</button>
                    </div>
                </td>
                <td class="fw-bold text-primary">${formatearPrecio(subtotal)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${prod.id}" title="Eliminar producto">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tablaCarrito.appendChild(tr);
        });

        let totalFinal = subtotalGeneral;
        if (descuentoAplicado) {
            const montoDescuento = subtotalGeneral * 0.10;
            totalFinal = subtotalGeneral - montoDescuento;
            resumenDescuento.textContent = `-${formatearPrecio(montoDescuento)}`;
            filaDescuento.classList.remove("d-none");
        } else {
            filaDescuento.classList.add("d-none");
        }

        resumenSubtotal.textContent = formatearPrecio(subtotalGeneral);
        resumenTotal.textContent = formatearPrecio(totalFinal);
        if (contadorCarrito) contadorCarrito.textContent = totalUnidades;

        asignarEventosBotones();
    }

    function asignarEventosBotones() {
        document.querySelectorAll(".btn-sumar").forEach(btn => {
            btn.addEventListener("click", (e) => cambiarCantidad(parseInt(e.currentTarget.dataset.id), 1));
        });

        document.querySelectorAll(".btn-restar").forEach(btn => {
            btn.addEventListener("click", (e) => cambiarCantidad(parseInt(e.currentTarget.dataset.id), -1));
        });

        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", (e) => eliminarProducto(parseInt(e.currentTarget.dataset.id)));
        });
    }

    function cambiarCantidad(id, cambio) {
        let carrito = obtenerCarrito();
        const index = carrito.findIndex(p => p.id === id);

        if (index !== -1) {
            const nuevaCantidad = carrito[index].cantidad + cambio;
            if (nuevaCantidad >= 1) {
                carrito[index].cantidad = nuevaCantidad;
                guardarCarrito(carrito);
                renderizarTabla();
            }
        }
    }

    function eliminarProducto(id) {
        let carrito = obtenerCarrito();
        carrito = carrito.filter(p => p.id !== id);
        guardarCarrito(carrito);
        renderizarTabla();
    }

    if (btnAplicarCupon) {
        btnAplicarCupon.addEventListener("click", () => {
            const codigo = inputCupon.value.trim().toUpperCase();

            if (codigo === "NUBEPLAY123") {
                descuentoAplicado = true;
                mensajeCupon.className = "form-text small text-success fw-bold";
                mensajeCupon.textContent = "¡Cupón del 10% aplicado con éxito!";
                renderizarTabla();
            } else {
                mensajeCupon.className = "form-text small text-danger";
                mensajeCupon.textContent = "Código de descuento inválido.";
            }
        });
    }

    if (btnVaciarCarrito) {
        btnVaciarCarrito.addEventListener("click", () => {
            if (confirm("¿Estás seguro de que deseas vaciar tu carrito de compras?")) {
                localStorage.removeItem("carritoNubeplay");
                descuentoAplicado = false;
                if (mensajeCupon) mensajeCupon.textContent = "";
                if (inputCupon) inputCupon.value = "";
                renderizarTabla();
            }
        });
    }

    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener("click", () => {
            const carrito = obtenerCarrito();
            if (carrito.length === 0) return;

            const usuarioSesion = JSON.parse(localStorage.getItem("usuario_nubeplay"));
            if (!usuarioSesion) {
                alert("Debes iniciar sesión para completar la compra.");
                window.location.href = "login.html";
                return;
            }

            // Actualizar stock de los productos
            let productosStorage = JSON.parse(localStorage.getItem("productos")) || [];
            carrito.forEach(item => {
                const index = productosStorage.findIndex(p => p.id === item.id);
                if (index !== -1) {
                    productosStorage[index].stock = Math.max(0, (productosStorage[index].stock || 0) - item.cantidad);
                }
            });
            localStorage.setItem("productos", JSON.stringify(productosStorage));

            // Guardar Venta
            let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
            const subtotalG = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            const totalG = descuentoAplicado ? subtotalG * 0.90 : subtotalG;

            const nuevaVenta = {
                id: Date.now(),
                cliente: usuarioSesion.nombre,
                correo: usuarioSesion.correo,
                fecha: new Date().toLocaleDateString("es-CL"),
                items: carrito,
                total: totalG
            };
            ventas.push(nuevaVenta);
            localStorage.setItem("ventas", JSON.stringify(ventas));

            // Limpiar carrito
            localStorage.removeItem("carritoNubeplay");
            descuentoAplicado = false;

            alerta.className = "alert alert-success";
            alerta.textContent = "¡Gracias por tu compra! Tu pedido ha sido registrado con éxito.";
            alerta.classList.remove("d-none");

            renderizarTabla();

            setTimeout(() => {
                alerta.classList.add("d-none");
            }, 4000);
        });
    }

    renderizarTabla();
});

