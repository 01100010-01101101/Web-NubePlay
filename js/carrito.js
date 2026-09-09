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

    function leerJSON(clave, valorPorDefecto) {
        try {
            return JSON.parse(localStorage.getItem(clave)) ?? valorPorDefecto;
        } catch (error) {
            console.warn(`No se pudo leer ${clave}.`, error);
            return valorPorDefecto;
        }
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

    function obtenerProductos() {
        const productos = leerJSON("productos", []);
        return Array.isArray(productos) ? productos : [];
    }

    function guardarCarrito(carrito) {
        localStorage.setItem("carritoNubeplay", JSON.stringify(carrito));
    }

    function actualizarContador(total) {
        if (contadorCarrito) contadorCarrito.textContent = total;
        if (typeof window.actualizarNavbarCarrito === "function") {
            window.actualizarNavbarCarrito();
        }
    }

    function normalizarCarritoPorStock(carrito) {
        const productos = obtenerProductos();
        let huboCambios = false;

        const normalizado = carrito.reduce((resultado, item) => {
            const producto = productos.find(p => Number(p.id) === Number(item.id));
            if (!producto) {
                huboCambios = true;
                return resultado;
            }

            const stock = Number(producto.stock) || 0;
            const cantidad = Math.min(Math.max(Number(item.cantidad) || 0, 0), stock);

            if (cantidad <= 0) {
                huboCambios = true;
                return resultado;
            }

            const itemNormalizado = {
                ...item,
                id: producto.id,
                nombre: producto.nombre,
                precio: Number(producto.precio) || 0,
                categoria: producto.categoria,
                imagen: producto.imagen,
                cantidad
            };

            if (JSON.stringify(itemNormalizado) !== JSON.stringify(item)) {
                huboCambios = true;
            }

            resultado.push(itemNormalizado);
            return resultado;
        }, []);

        if (huboCambios) guardarCarrito(normalizado);
        return normalizado;
    }

    function renderizarTabla() {
        if (!tablaCarrito) return;

        let carrito = normalizarCarritoPorStock(obtenerCarrito());
        tablaCarrito.innerHTML = "";

        if (carrito.length === 0) {
            carritoVacio?.classList.remove("d-none");
            tablaCarrito.parentElement?.parentElement?.classList.add("d-none");
            accionesCarrito?.classList.add("d-none");
            if (resumenSubtotal) resumenSubtotal.textContent = formatearPrecio(0);
            if (resumenTotal) resumenTotal.textContent = formatearPrecio(0);
            filaDescuento?.classList.add("d-none");
            actualizarContador(0);
            return;
        }

        carritoVacio?.classList.add("d-none");
        tablaCarrito.parentElement?.parentElement?.classList.remove("d-none");
        accionesCarrito?.classList.remove("d-none");

        let subtotalGeneral = 0;
        let totalUnidades = 0;

        carrito.forEach((prod) => {
            const subtotal = (Number(prod.precio) || 0) * (Number(prod.cantidad) || 0);
            const stock = obtenerStock(prod.id);
            subtotalGeneral += subtotal;
            totalUnidades += Number(prod.cantidad) || 0;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-4">
                    <div class="d-flex align-items-center">
                        <img src="${prod.imagen || "https://via.placeholder.com/50"}"
                             alt="${escaparHTML(prod.nombre)}"
                             class="rounded-3 me-3"
                             style="width: 50px; height: 50px; object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/50?text=NUBE'">
                        <div>
                            <h6 class="mb-0 fw-bold">${escaparHTML(prod.nombre)}</h6>
                            <small class="text-capitalize text-muted">${escaparHTML(prod.categoria || "")}</small>
                        </div>
                    </div>
                </td>
                <td class="fw-semibold">${formatearPrecio(prod.precio)}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary btn-restar" data-id="${prod.id}" ${prod.cantidad <= 1 ? "disabled" : ""}>-</button>
                        <span class="btn btn-light disabled px-3 fw-bold text-dark">${prod.cantidad}</span>
                        <button class="btn btn-outline-secondary btn-sumar" data-id="${prod.id}" ${prod.cantidad >= stock ? "disabled" : ""}>+</button>
                    </div>
                    <div class="small text-muted mt-1">Stock: ${stock}</div>
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
            if (resumenDescuento) resumenDescuento.textContent = `-${formatearPrecio(montoDescuento)}`;
            filaDescuento?.classList.remove("d-none");
        } else {
            filaDescuento?.classList.add("d-none");
        }

        if (resumenSubtotal) resumenSubtotal.textContent = formatearPrecio(subtotalGeneral);
        if (resumenTotal) resumenTotal.textContent = formatearPrecio(totalFinal);
        actualizarContador(totalUnidades);
        asignarEventosBotones();
    }

    function obtenerStock(id) {
        const producto = obtenerProductos().find(p => Number(p.id) === Number(id));
        return producto ? Number(producto.stock) || 0 : 0;
    }

    function asignarEventosBotones() {
        document.querySelectorAll(".btn-sumar").forEach(btn => {
            btn.addEventListener("click", () => cambiarCantidad(Number(btn.dataset.id), 1));
        });

        document.querySelectorAll(".btn-restar").forEach(btn => {
            btn.addEventListener("click", () => cambiarCantidad(Number(btn.dataset.id), -1));
        });

        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarProducto(Number(btn.dataset.id)));
        });
    }

    function cambiarCantidad(id, cambio) {
        const carrito = obtenerCarrito();
        const index = carrito.findIndex(item => Number(item.id) === id);
        if (index === -1) return;

        const stock = obtenerStock(id);
        const nuevaCantidad = (Number(carrito[index].cantidad) || 0) + cambio;

        if (nuevaCantidad < 1) return;
        if (nuevaCantidad > stock) {
            mostrarAlerta("No puedes superar el stock disponible.", "warning");
            return;
        }

        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito(carrito);
        renderizarTabla();
    }

    function eliminarProducto(id) {
        const carrito = obtenerCarrito().filter(item => Number(item.id) !== id);
        guardarCarrito(carrito);
        renderizarTabla();
    }

    function mostrarAlerta(mensaje, tipo = "success") {
        if (!alerta) return;
        alerta.className = `alert alert-${tipo}`;
        alerta.textContent = mensaje;
        alerta.classList.remove("d-none");
        clearTimeout(window.__nubeplayCarritoAlerta);
        window.__nubeplayCarritoAlerta = setTimeout(() => alerta.classList.add("d-none"), 3500);
    }

    if (btnAplicarCupon) {
        btnAplicarCupon.addEventListener("click", () => {
            const codigo = (inputCupon?.value || "").trim().toUpperCase();

            if (codigo === "NUBEPLAY123") {
                descuentoAplicado = true;
                if (mensajeCupon) {
                    mensajeCupon.className = "form-text small text-success fw-bold";
                    mensajeCupon.textContent = "¡Cupón del 10% aplicado con éxito!";
                }
                renderizarTabla();
            } else {
                descuentoAplicado = false;
                if (mensajeCupon) {
                    mensajeCupon.className = "form-text small text-danger";
                    mensajeCupon.textContent = "Código de descuento inválido.";
                }
                renderizarTabla();
            }
        });
    }

    if (btnVaciarCarrito) {
        btnVaciarCarrito.addEventListener("click", () => {
            if (!confirm("¿Estás seguro de que deseas vaciar tu carrito de compras?")) return;
            localStorage.removeItem("carritoNubeplay");
            descuentoAplicado = false;
            if (mensajeCupon) mensajeCupon.textContent = "";
            if (inputCupon) inputCupon.value = "";
            renderizarTabla();
        });
    }

    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener("click", () => {
            const usuarioSesion = leerJSON("usuario_nubeplay", null);
            const carrito = normalizarCarritoPorStock(obtenerCarrito());

            if (carrito.length === 0) {
                mostrarAlerta("El carrito está vacío.", "warning");
                return;
            }

            if (!usuarioSesion) {
                alert("Debes iniciar sesión para completar la compra.");
                window.location.href = "login.html";
                return;
            }

            const productosStorage = obtenerProductos();

            const hayStockInsuficiente = carrito.some(item => {
                const producto = productosStorage.find(p => Number(p.id) === Number(item.id));
                return !producto || Number(item.cantidad) > (Number(producto.stock) || 0);
            });

            if (hayStockInsuficiente) {
                mostrarAlerta("Uno o más productos ya no tienen stock suficiente. Revisa el carrito.", "danger");
                renderizarTabla();
                return;
            }

            const fechaActual = new Date().toISOString().split("T")[0];
            let subtotalG = 0;

            carrito.forEach(item => {
                subtotalG += (Number(item.precio) || 0) * (Number(item.cantidad) || 0);
            });

            const totalG = descuentoAplicado ? subtotalG * 0.90 : subtotalG;

            // Descontar stock.
            carrito.forEach(item => {
                const index = productosStorage.findIndex(p => Number(p.id) === Number(item.id));
                if (index !== -1) {
                    productosStorage[index].stock = Math.max(
                        0,
                        (Number(productosStorage[index].stock) || 0) - Number(item.cantidad)
                    );
                }
            });
            localStorage.setItem("productos", JSON.stringify(productosStorage));

            // Registrar venta.
            const ventas = leerJSON("ventas", []);
            const nuevasVentas = Array.isArray(ventas) ? ventas : [];
            nuevasVentas.push({
                id: Date.now(),
                usuarioId: usuarioSesion.id,
                cliente: usuarioSesion.nombre,
                correo: usuarioSesion.correo,
                fecha: fechaActual,
                items: carrito,
                total: totalG
            });
            localStorage.setItem("ventas", JSON.stringify(nuevasVentas));

            // Actualizar historial del usuario.
            const nuevasComprasUsuario = carrito.map(item => ({
                fecha: fechaActual,
                producto: item.nombre,
                cantidad: Number(item.cantidad),
                total: (Number(item.precio) || 0) * (Number(item.cantidad) || 0)
            }));

            const usuarios = leerJSON("usuarios", []);
            const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
            const usuariosActualizados = usuariosArray.map(usuario => {
                if (usuario.id === usuarioSesion.id || usuario.correo === usuarioSesion.correo) {
                    return {
                        ...usuario,
                        compras: [...(usuario.compras || []), ...nuevasComprasUsuario]
                    };
                }
                return usuario;
            });
            localStorage.setItem("usuarios", JSON.stringify(usuariosActualizados));

            const sesionActualizada = {
                ...usuarioSesion,
                compras: [...(usuarioSesion.compras || []), ...nuevasComprasUsuario]
            };
            localStorage.setItem("usuario_nubeplay", JSON.stringify(sesionActualizada));

            localStorage.removeItem("carritoNubeplay");
            descuentoAplicado = false;
            if (inputCupon) inputCupon.value = "";
            if (mensajeCupon) mensajeCupon.textContent = "";

            mostrarAlerta("¡Gracias por tu compra! Tu pedido ha sido registrado con éxito.", "success");
            renderizarTabla();
        });
    }

    function escaparHTML(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    renderizarTabla();
});
