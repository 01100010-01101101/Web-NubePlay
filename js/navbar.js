document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".navbar");
    const menu = nav ? nav.querySelector(".navbar-nav") : null;

    if (!nav || !menu) return;

    const estaEnPages = window.location.pathname.includes("/pages/");
    const base = estaEnPages ? "" : "pages/";
    const inicio = estaEnPages ? "../index.html" : "index.html";
    const paginaActual = window.location.pathname.split("/").pop() || "index.html";

    function leerJSON(clave, valorPorDefecto) {
        try {
            return JSON.parse(localStorage.getItem(clave)) ?? valorPorDefecto;
        } catch (error) {
            console.warn(`No se pudo leer ${clave} desde localStorage.`, error);
            return valorPorDefecto;
        }
    }

    function obtenerUsuario() {
        return leerJSON("usuario_nubeplay", null);
    }

    function obtenerTotalCarrito() {
        const carrito = leerJSON("carritoNubeplay", []);
        return carrito.reduce((total, item) => total + (Number(item.cantidad) || 0), 0);
    }

    function enlaceActivo(pagina) {
        return paginaActual === pagina ? "active" : "";
    }

    function esPaginaAdmin() {
        return paginaActual === "admin.html";
    }

    function renderizarNavbar() {
        const usuario = obtenerUsuario();

        if (esPaginaAdmin()) {
            const botonCerrarAdmin = menu.querySelector("a[href*=\"login.html\"]");
            if (botonCerrarAdmin) {
                botonCerrarAdmin.addEventListener("click", (event) => {
                    event.preventDefault();
                    cerrarSesion();
                });
            }
            return;
        }
        const rolUsuario = usuario ? String(usuario.rol || "").toLowerCase() : "";
        const esAdmin = rolUsuario === "admin" || rolUsuario === "administrador";
        const esVendedor = rolUsuario === "vendedor";

        if (esVendedor) {
            menu.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link ${enlaceActivo("productos.html")}" href="${base}productos.html">
                        <i class="bi bi-controller me-1"></i> Productos
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${enlaceActivo("detalle-producto.html")}" href="${base}productos.html">
                        <i class="bi bi-eye me-1"></i> Detalle de productos
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${enlaceActivo("admin.html")}" href="${base}admin.html#panel-ordenes">
                        <i class="bi bi-receipt me-1"></i> Órdenes
                    </a>
                </li>

                <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <div class="d-flex align-items-center gap-2">
                        <span class="navbar-text text-white small">
                            <i class="bi bi-person-circle me-1"></i>${escapeHTML(usuario.nombre || "Vendedor")}
                        </span>
                        <button id="btnCerrarSesion" type="button" class="btn btn-outline-light btn-sm">
                            <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
                        </button>
                    </div>
                </li>
            `;
        } else {
            menu.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link ${!estaEnPages && paginaActual === "index.html" ? "active" : ""}" href="${inicio}">
                        <i class="bi bi-house me-1"></i> Inicio
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${enlaceActivo("productos.html")}" href="${base}productos.html">
                        <i class="bi bi-controller me-1"></i> Productos
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${enlaceActivo("blogs.html")}" href="${base}blogs.html">
                        <i class="bi bi-newspaper me-1"></i> Noticias
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${enlaceActivo("nosotros.html")}" href="${base}nosotros.html">
                        <i class="bi bi-people me-1"></i> Nosotros
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${enlaceActivo("contacto.html")}" href="${base}contacto.html">
                        <i class="bi bi-envelope me-1"></i> Contacto
                    </a>
                </li>

                <li class="nav-item ms-lg-2">
                    <a class="nav-link carrito-nav ${enlaceActivo("carrito.html")}" href="${base}carrito.html">
                        <i class="bi bi-cart3 me-1"></i> Carrito
                        <span id="contadorCarrito" class="badge bg-primary ms-1">${obtenerTotalCarrito()}</span>
                    </a>
                </li>

                ${esAdmin ? `
                    <li class="nav-item ms-lg-2">
                        <a class="nav-link ${enlaceActivo("admin.html")}" href="${base}admin.html">
                            <i class="bi bi-speedometer2 me-1"></i> Panel Admin
                        </a>
                    </li>
                ` : ""}

                <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
                    ${usuario ? `
                        <div class="d-flex align-items-center gap-2">
                            <span class="navbar-text text-white small">
                                <i class="bi bi-person-circle me-1"></i>${escapeHTML(usuario.nombre || "Usuario")}
                            </span>
                            <button id="btnCerrarSesion" type="button" class="btn btn-outline-light btn-sm">
                                <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
                            </button>
                        </div>
                    ` : `
                        <a id="botonUsuario" class="btn btn-outline-light btn-sm" href="${base}login.html">
                            <i class="bi bi-person me-1"></i> Iniciar sesión
                        </a>
                    `}
                </li>
            `;
        }

        const btnCerrarSesion = document.getElementById("btnCerrarSesion");
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener("click", cerrarSesion);
        }
    }

    function cerrarSesion() {
        localStorage.removeItem("usuario_nubeplay");
        localStorage.removeItem("nubeplay_session_id");
        window.location.href = `${base}login.html`;
    }

    function escapeHTML(texto) {
        const div = document.createElement("div");
        div.textContent = texto;
        return div.innerHTML;
    }

    renderizarNavbar();

    window.addEventListener("storage", renderizarNavbar);
    window.actualizarNavbarCarrito = () => {
        const contador = document.getElementById("contadorCarrito");
        if (contador) contador.textContent = obtenerTotalCarrito();
    };
});
