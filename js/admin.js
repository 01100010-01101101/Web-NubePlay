document.addEventListener("DOMContentLoaded", () => {

    // PROTECCIÓN DE RUTA
    const usuarioSesion = JSON.parse(localStorage.getItem("usuario_nubeplay"));
    const rolSesion = usuarioSesion ? String(usuarioSesion.rol || "").toLowerCase() : "";
    const esAdministrador = rolSesion === "admin" || rolSesion === "administrador";
    const esVendedor = rolSesion === "vendedor";

    if (!usuarioSesion || (!esAdministrador && !esVendedor)) {
        alert("Acceso denegado. Debes iniciar sesión con un perfil autorizado.");
        window.location.href = "login.html";
        return;
    }


    // DATOS INICIALES

    const usuariosIniciales = [
        {
            id: 101,
            run: "19011022K",
            nombre: "Administrador",
            apellidos: "NUBEPLAY",
            correo: "admin@duoc.cl",
            password: "admin",
            fechaNacimiento: "1990-01-01",
            region: "Metropolitana de Santiago",
            comuna: "Santiago",
            direccion: "Av. Siempre Viva 742, Santiago",
            rol: "Administrador",
            estado: "Activo",
            compras: []
        },

    ];

    if (!localStorage.getItem("usuarios")) {
        localStorage.setItem("usuarios", JSON.stringify(usuariosIniciales));
    }

    const tablaProductos = document.getElementById("tablaProductosAdmin");
    const tablaUsuarios = document.getElementById("tablaUsuariosAdmin");
    const tablaOrdenes = document.getElementById("tablaOrdenesAdmin");
    const totalProductosCount = document.getElementById("totalProductosCount");
    const totalUsuariosCount = document.getElementById("totalUsuariosCount");
    const stockBajoCount = document.getElementById("stockBajoCount");

    const modalProducto = new bootstrap.Modal(document.getElementById("modalProducto"));
    const formProducto = document.getElementById("formProducto");
    const btnNuevoProducto = document.getElementById("btnNuevoProducto");

    const modalUsuario = new bootstrap.Modal(document.getElementById("modalUsuario"));
    const formUsuario = document.getElementById("formUsuario");
    const btnGenerarPass = document.getElementById("btnGenerarPass");
    const tablaComprasUsuario = document.getElementById("tablaComprasUsuario");

    const tabUsuariosContainer = document.getElementById("tab-usuarios")?.parentElement;
    const tabOrdenesContainer = document.getElementById("tab-ordenes-container");
    const linkVerTiendaAdmin = document.getElementById("linkVerTiendaAdmin");

    // ----------------------------------------------------
    // REGIONES Y COMUNAS
    // ----------------------------------------------------
    const regiones = {
        "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
        "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"],
        "Antofagasta": ["Antofagasta", "Calama", "Tocopilla", "Mejillones"],
        "Atacama": ["Copiapó", "Caldera", "Vallenar", "Huasco"],
        "Coquimbo": ["La Serena", "Coquimbo", "Ovalle", "Illapel"],
        "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "San Antonio"],
        "Metropolitana de Santiago": ["Santiago", "Maipú", "Puente Alto", "Las Condes", "La Florida"],
        "O'Higgins": ["Rancagua", "Machalí", "San Fernando", "Rengo"],
        "Maule": ["Talca", "Curicó", "Linares", "Constitución"],
        "Ñuble": ["Chillán", "San Carlos", "Bulnes", "Yungay"],
        "Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "Coronel"],
        "La Araucanía": ["Temuco", "Villarrica", "Angol", "Pucón"],
        "Los Ríos": ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"],
        "Los Lagos": ["Puerto Montt", "Osorno", "Castro", "Ancud"],
        "Aysén": ["Coyhaique", "Aysén", "Chile Chico", "Cochrane"],
        "Magallanes": ["Punta Arenas", "Puerto Natales", "Porvenir", "Cabo de Hornos"]
    };

    const selectRegion = document.getElementById("usrRegion");
    const selectComuna = document.getElementById("usrComuna");

    // ----------------------------------------------------
    // FUNCIONES GENERALES
    // ----------------------------------------------------
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

    function obtenerProductos() {
        const productos = leerJSON("productos", []);

        return Array.isArray(productos)
            ? productos.map((producto, index) => ({
                ...producto,
                codigo: producto.codigo || `PROD-${producto.id || index + 1}`,
                stockCritico: Number.isInteger(Number(producto.stockCritico))
                    ? Number(producto.stockCritico)
                    : 0
            }))
            : [];
    }

    function obtenerUsuarios() {
        return leerJSON("usuarios", []);
    }

    function obtenerOrdenes() {
        return leerJSON("ventas", []);
    }

    function escaparHTML(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    function validarCorreo(correo) {
        const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        return correo.length <= 100 && dominiosPermitidos.some(dominio => correo.toLowerCase().endsWith(dominio));
    }

    function limpiarRun(run) {
        return String(run || "")
            .trim()
            .replace(/[^0-9kK]/g, "")
            .toUpperCase();
    }

    function validarRun(run) {
        const valor = limpiarRun(run);

        if (!/^\d{7,8}[0-9K]$/.test(valor)) {
            return false;
        }

        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1);
        let suma = 0;
        let multiplicador = 2;

        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += Number(cuerpo[i]) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const resto = 11 - (suma % 11);
        const dvCalculado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

        return dv === dvCalculado;
    }

    function actualizarEstadisticas() {
        const productos = obtenerProductos();
        const usuarios = obtenerUsuarios();

        if (totalProductosCount) {
            totalProductosCount.textContent = productos.length;
        }

        if (totalUsuariosCount) {
            totalUsuariosCount.textContent = usuarios.length;
        }

        const conStockBajo = productos.filter(producto => {
            const stock = Number(producto.stock) || 0;
            const stockCritico = Number(producto.stockCritico) || 0;
            return stock <= stockCritico;
        }).length;

        if (stockBajoCount) {
            stockBajoCount.textContent = conStockBajo;
        }
    }

    // ----------------------------------------------------
    // CARGA DE REGIONES
    // ----------------------------------------------------
    function cargarRegiones() {
        if (!selectRegion) return;

        selectRegion.innerHTML = '<option value="">Seleccione una región</option>';

        Object.keys(regiones).forEach(region => {
            const option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            selectRegion.appendChild(option);
        });
    }

    function cargarComunas(region, comunaSeleccionada = "") {
        if (!selectComuna) return;

        selectComuna.innerHTML = '<option value="">Seleccione una comuna</option>';
        selectComuna.disabled = !region;

        if (!region || !regiones[region]) return;

        regiones[region].forEach(comuna => {
            const option = document.createElement("option");
            option.value = comuna;
            option.textContent = comuna;
            option.selected = comuna === comunaSeleccionada;
            selectComuna.appendChild(option);
        });
    }

    if (selectRegion) {
        selectRegion.addEventListener("change", () => {
            cargarComunas(selectRegion.value);
        });
    }

    // ----------------------------------------------------
    // PRODUCTOS
    // ----------------------------------------------------
    function renderProductos() {
        if (!tablaProductos) return;

        const productos = obtenerProductos();
        tablaProductos.innerHTML = "";

        productos.forEach(producto => {
            const stock = Number(producto.stock) || 0;
            const stockCritico = Number(producto.stockCritico) || 0;
            const stockBajo = stock <= stockCritico;
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td class="ps-3 fw-bold">${escaparHTML(producto.codigo)}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img
                            src="${producto.imagen || "https://via.placeholder.com/40"}"
                            alt="${escaparHTML(producto.nombre)}"
                            width="40"
                            height="40"
                            class="rounded me-2 object-fit-cover"
                            onerror="this.src='https://via.placeholder.com/40'"
                        >
                        <div>
                            <span class="fw-semibold d-block">${escaparHTML(producto.nombre)}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-secondary text-capitalize">${escaparHTML(producto.categoria)}</span></td>
                <td>${formatearPrecio(producto.precio)}</td>
                <td>
                    <span class="badge ${stockBajo ? "bg-danger" : "bg-success"}">
                        ${stock} un.
                    </span>
                </td>
                <td>
                    <span class="badge ${stockBajo ? "bg-warning text-dark" : "bg-light text-dark"}">
                        ${stockCritico} un.
                    </span>
                </td>
                <td class="text-center">
                    ${esAdministrador ? `
                        <button class="btn btn-sm btn-outline-primary me-1 btn-editar-prod" data-id="${producto.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-eliminar-prod" data-id="${producto.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : `
                        <a
                            class="btn btn-sm btn-outline-primary"
                            href="productos.html"
                        >
                            <i class="bi bi-eye me-1"></i> Ver detalle
                        </a>
                    `}
                </td>
            `;

            tablaProductos.appendChild(tr);
        });

        actualizarEstadisticas();
    }

    function renderUsuarios() {
        if (!tablaUsuarios || !esAdministrador) return;

        const usuarios = obtenerUsuarios();
        tablaUsuarios.innerHTML = "";

        usuarios.forEach(usuario => {
            const tr = document.createElement("tr");
            const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim();
            const esAdmin = ["admin", "administrador"].includes(String(usuario.rol || "").toLowerCase());

            tr.innerHTML = `
                <td class="ps-3 fw-bold">#${usuario.id}</td>
                <td>${escaparHTML(nombreCompleto || usuario.nombre)}</td>
                <td>${escaparHTML(usuario.correo)}</td>
                <td>
                    <span class="badge ${esAdmin ? "bg-danger" : usuario.rol === "Vendedor" ? "bg-warning text-dark" : "bg-info"}">
                        ${escaparHTML(usuario.rol)}
                    </span>
                </td>
                <td>
                    <span class="badge ${usuario.estado === "Activo" ? "bg-success" : "bg-secondary"}">
                        ${escaparHTML(usuario.estado)}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary btn-editar-usr" data-id="${usuario.id}">
                        <i class="bi bi-eye"></i> Ver / Editar
                    </button>
                </td>
            `;

            tablaUsuarios.appendChild(tr);
        });

        actualizarEstadisticas();
    }

    function renderOrdenes() {
        if (!tablaOrdenes) return;

        const ordenes = obtenerOrdenes();
        tablaOrdenes.innerHTML = "";

        if (ordenes.length === 0) {
            tablaOrdenes.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        No existen órdenes registradas todavía.
                    </td>
                </tr>
            `;
            return;
        }

        ordenes.forEach(orden => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-3 fw-bold">#${orden.id}</td>
                <td>${escaparHTML(orden.fecha)}</td>
                <td>${escaparHTML(orden.cliente || "Cliente")}</td>
                <td>${formatearPrecio(orden.total)}</td>
                <td class="text-center">
                    <button
                        class="btn btn-sm btn-outline-primary btn-detalle-orden"
                        data-id="${orden.id}"
                    >
                        <i class="bi bi-eye me-1"></i> Ver detalle
                    </button>
                </td>
            `;
            tablaOrdenes.appendChild(tr);
        });
    }

    function abrirDetalleOrden(id) {
        const orden = obtenerOrdenes().find(item => String(item.id) === String(id));

        if (!orden) return;

        const detalle = (orden.items || [])
            .map(item => `${item.nombre} x${item.cantidad}`)
            .join("\n");

        alert(
            `ORDEN #${orden.id}\n\n` +
            `Cliente: ${orden.cliente || "Cliente"}\n` +
            `Correo: ${orden.correo || ""}\n` +
            `Fecha: ${orden.fecha || ""}\n\n` +
            `Productos:\n${detalle || "Sin productos"}\n\n` +
            `Total: ${formatearPrecio(orden.total)}`
        );
    }

    // ----------------------------------------------------
    // FORMULARIO PRODUCTO
    // ----------------------------------------------------
    if (btnNuevoProducto && esAdministrador) {
        btnNuevoProducto.addEventListener("click", () => {
            formProducto.reset();
            document.getElementById("prodId").value = "";
            document.getElementById("modalProductoTitulo").textContent = "Agregar Producto";
        });
    }

    if (formProducto && esAdministrador) {
        formProducto.addEventListener("submit", event => {
            event.preventDefault();

            const id = document.getElementById("prodId").value;
            const codigo = document.getElementById("prodCodigo").value.trim();
            const nombre = document.getElementById("prodNombre").value.trim();
            const categoria = document.getElementById("prodCategoria").value;
            const precio = Number(document.getElementById("prodPrecio").value);
            const stock = Number(document.getElementById("prodStock").value);
            const stockCritico = Number(document.getElementById("prodStockCritico").value || 0);
            const descripcion = document.getElementById("prodDescripcion").value.trim();
            const imagen = document.getElementById("prodImagen").value.trim();

            if (codigo.length < 3) {
                alert("El código del producto debe tener al menos 3 caracteres.");
                return;
            }

            if (nombre.length === 0 || nombre.length > 100) {
                alert("El nombre es obligatorio y debe tener máximo 100 caracteres.");
                return;
            }

            if (!Number.isInteger(stock) || stock < 0) {
                alert("El stock debe ser un número entero mayor o igual a 0.");
                return;
            }

            if (!Number.isInteger(stockCritico) || stockCritico < 0) {
                alert("El stock crítico debe ser un número entero mayor o igual a 0.");
                return;
            }

            if (descripcion.length > 500) {
                alert("La descripción debe tener máximo 500 caracteres.");
                return;
            }

            if (imagen && !/^https?:\/\//i.test(imagen)) {
                alert("La imagen debe ser una URL válida o dejarse vacía.");
                return;
            }

            let productos = obtenerProductos();

            const codigoDuplicado = productos.some(producto =>
                producto.codigo?.toLowerCase() === codigo.toLowerCase() && String(producto.id) !== String(id)
            );

            if (codigoDuplicado) {
                alert("Ya existe otro producto con ese código.");
                return;
            }

            if (id) {
                productos = productos.map(producto =>
                    String(producto.id) === String(id)
                        ? {
                            ...producto,
                            codigo,
                            nombre,
                            categoria,
                            precio,
                            stock,
                            stockCritico,
                            descripcion,
                            imagen
                        }
                        : producto
                );
            } else {
                productos.push({
                    id: Date.now(),
                    codigo,
                    nombre,
                    categoria,
                    precio,
                    stock,
                    stockCritico,
                    descripcion,
                    imagen
                });
            }

            localStorage.setItem("productos", JSON.stringify(productos));
            modalProducto.hide();
            renderProductos();

            if (stock <= stockCritico) {
                alert("Advertencia: el producto quedó en stock crítico.");
            }
        });
    }

    if (tablaProductos) {
        tablaProductos.addEventListener("click", event => {
            const btnEdit = event.target.closest(".btn-editar-prod");
            const btnDelete = event.target.closest(".btn-eliminar-prod");

            if (btnEdit) {
                const producto = obtenerProductos().find(item => String(item.id) === btnEdit.dataset.id);

                if (producto) {
                    document.getElementById("prodId").value = producto.id;
                    document.getElementById("prodCodigo").value = producto.codigo || `PROD-${producto.id}`;
                    document.getElementById("prodNombre").value = producto.nombre || "";
                    document.getElementById("prodCategoria").value = producto.categoria || "juegos";
                    document.getElementById("prodPrecio").value = producto.precio || 0;
                    document.getElementById("prodStock").value = producto.stock || 0;
                    document.getElementById("prodStockCritico").value = producto.stockCritico || 0;
                    document.getElementById("prodDescripcion").value = producto.descripcion || "";
                    document.getElementById("prodImagen").value = producto.imagen || "";
                    document.getElementById("modalProductoTitulo").textContent = "Editar Producto";
                    modalProducto.show();
                }
            }

            if (btnDelete && esAdministrador) {
                if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                    const productos = obtenerProductos().filter(producto => String(producto.id) !== btnDelete.dataset.id);
                    localStorage.setItem("productos", JSON.stringify(productos));
                    renderProductos();
                }
            }
        });
    }

    // ----------------------------------------------------
    // FORMULARIO USUARIO
    // ----------------------------------------------------
    if (btnGenerarPass && esAdministrador) {
        btnGenerarPass.addEventListener("click", () => {
            const randomPass = Math.random().toString(36).slice(-6);
            document.getElementById("usrPassword").value = randomPass;
        });
    }

    if (tablaUsuarios && esAdministrador) {
        tablaUsuarios.addEventListener("click", event => {
            const btnEdit = event.target.closest(".btn-editar-usr");

            if (!btnEdit) return;

            const usuario = obtenerUsuarios().find(item => String(item.id) === btnEdit.dataset.id);

            if (!usuario) return;

            document.getElementById("usrId").value = usuario.id;
            document.getElementById("usrNombre").value = usuario.nombre || "";
            document.getElementById("usrApellidos").value = usuario.apellidos || "";
            document.getElementById("usrRut").value = usuario.run || "";
            document.getElementById("usrCorreo").value = usuario.correo || "";
            document.getElementById("usrFechaNacimiento").value = usuario.fechaNacimiento || "";
            document.getElementById("usrDireccion").value = usuario.direccion || "";
            document.getElementById("usrPassword").value = usuario.password || "";
            document.getElementById("usrRol").value = usuario.rol || "Cliente";
            document.getElementById("usrEstado").value = usuario.estado || "Activo";

            cargarRegiones();
            selectRegion.value = usuario.region || "";
            cargarComunas(usuario.region || "", usuario.comuna || "");

            tablaComprasUsuario.innerHTML = "";

            if (usuario.compras && usuario.compras.length > 0) {
                usuario.compras.forEach(compra => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${escaparHTML(compra.fecha)}</td>
                        <td>${escaparHTML(compra.producto)}</td>
                        <td class="text-center">${compra.cantidad}</td>
                        <td>${formatearPrecio(compra.total)}</td>
                    `;
                    tablaComprasUsuario.appendChild(tr);
                });
            } else {
                tablaComprasUsuario.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-muted">
                            No registra compras realizadas.
                        </td>
                    </tr>
                `;
            }

            modalUsuario.show();
        });
    }

    if (formUsuario && esAdministrador) {
        formUsuario.addEventListener("submit", event => {
            event.preventDefault();

            const id = document.getElementById("usrId").value;
            const nombre = document.getElementById("usrNombre").value.trim();
            const apellidos = document.getElementById("usrApellidos").value.trim();
            const run = limpiarRun(document.getElementById("usrRut").value);
            const correo = document.getElementById("usrCorreo").value.trim();
            const fechaNacimiento = document.getElementById("usrFechaNacimiento").value;
            const region = document.getElementById("usrRegion").value;
            const comuna = document.getElementById("usrComuna").value;
            const direccion = document.getElementById("usrDireccion").value.trim();
            const password = document.getElementById("usrPassword").value;
            const rol = document.getElementById("usrRol").value;
            const estado = document.getElementById("usrEstado").value;

            if (nombre.length === 0 || nombre.length > 50) {
                alert("El nombre es obligatorio y debe tener máximo 50 caracteres.");
                return;
            }

            if (apellidos.length === 0 || apellidos.length > 100) {
                alert("Los apellidos son obligatorios y deben tener máximo 100 caracteres.");
                return;
            }

            if (!validarRun(run)) {
                alert("El RUN no es válido. Ingrésalo sin puntos ni guion, por ejemplo 19011022K.");
                return;
            }

            if (!validarCorreo(correo)) {
                alert("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com y tener máximo 100 caracteres.");
                return;
            }

            if (!region || !comuna) {
                alert("Debes seleccionar una región y una comuna.");
                return;
            }

            if (direccion.length === 0 || direccion.length > 300) {
                alert("La dirección es obligatoria y debe tener máximo 300 caracteres.");
                return;
            }

            if (!password || password.length < 4 || password.length > 10) {
                alert("La contraseña debe tener entre 4 y 10 caracteres.");
                return;
            }

            let usuarios = obtenerUsuarios();

            const correoDuplicado = usuarios.some(usuario =>
                usuario.correo?.toLowerCase() === correo.toLowerCase() && String(usuario.id) !== String(id)
            );

            if (correoDuplicado) {
                alert("Ya existe un usuario con ese correo.");
                return;
            }

            const runDuplicado = usuarios.some(usuario =>
                limpiarRun(usuario.run) === run && String(usuario.id) !== String(id)
            );

            if (runDuplicado) {
                alert("Ya existe un usuario con ese RUN.");
                return;
            }

            usuarios = usuarios.map(usuario =>
                String(usuario.id) === String(id)
                    ? {
                        ...usuario,
                        nombre,
                        apellidos,
                        run,
                        correo,
                        fechaNacimiento,
                        region,
                        comuna,
                        direccion,
                        password,
                        rol,
                        estado
                    }
                    : usuario
            );

            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            modalUsuario.hide();
            renderUsuarios();
        });
    }

    // ----------------------------------------------------
    // DETALLE DE ÓRDENES
    // ----------------------------------------------------
    if (tablaOrdenes) {
        tablaOrdenes.addEventListener("click", event => {
            const boton = event.target.closest(".btn-detalle-orden");

            if (boton) {
                abrirDetalleOrden(boton.dataset.id);
            }
        });
    }

    // ----------------------------------------------------
    // RESTRICCIONES DEL VENDEDOR
    // ----------------------------------------------------
    if (esVendedor) {
        tabUsuariosContainer?.classList.add("d-none");
        document.getElementById("panel-usuarios")?.classList.remove("show", "active");
        document.getElementById("tab-usuarios")?.setAttribute("disabled", "true");
        linkVerTiendaAdmin?.classList.add("d-none");
        document.getElementById("estadisticaUsuarios")?.classList.add("d-none");

        if (btnNuevoProducto) {
            btnNuevoProducto.classList.add("d-none");
        }

        const tabOrdenes = document.getElementById("tab-ordenes");
        const panelOrdenes = document.getElementById("panel-ordenes");
        const tabProductos = document.getElementById("tab-productos");
        const panelProductos = document.getElementById("panel-productos");

        if (tabOrdenes && panelOrdenes && tabProductos && panelProductos) {
            tabOrdenes.addEventListener("click", () => {
                tabProductos.classList.remove("active");
                panelProductos.classList.remove("show", "active");
            });
        }
    }

    // ----------------------------------------------------
    // CARGA INICIAL
    // ----------------------------------------------------
    cargarRegiones();
    renderProductos();
    renderUsuarios();
    renderOrdenes();
    actualizarEstadisticas();
});
