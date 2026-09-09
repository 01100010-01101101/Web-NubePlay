document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // PROTECCIÓN DE RUTA (Guardia de Seguridad Admin)
    // ----------------------------------------------------
    const usuarioSesion = JSON.parse(localStorage.getItem("usuario_nubeplay"));

    if (!usuarioSesion || (usuarioSesion.rol !== "Admin" && usuarioSesion.rol !== "Administrador")) {
        alert("Acceso denegado. Debes iniciar sesión como Administrador.");
        window.location.href = "login.html";
        return;
    }

    // ----------------------------------------------------
    // DATOS INICIALES
    // ----------------------------------------------------
    const usuariosIniciales = [
        {
            id: 101,
            run: "19011022K",
            nombre: "admin Ti",
            correo: "admin@duoc.cl",
            password: "admin",
            telefono: "+56 9 8765 4321",
            direccion: "Av. Siempre Viva 742, Santiago",
            rol: "Admin",
            estado: "Activo",
            compras: [
                { fecha: "2026-03-01", producto: "PlayStation 5 Console", cantidad: 1, total: 549990 }
            ]
        }
    ];

    if (!localStorage.getItem("usuarios")) {
        localStorage.setItem("usuarios", JSON.stringify(usuariosIniciales));
    }

    const tablaProductos = document.getElementById("tablaProductosAdmin");
    const tablaUsuarios = document.getElementById("tablaUsuariosAdmin");
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

    function obtenerProductos() {
        return JSON.parse(localStorage.getItem("productos")) || [];
    }

    function obtenerUsuarios() {
        return JSON.parse(localStorage.getItem("usuarios")) || [];
    }

    function actualizarEstadisticas() {
        const productos = obtenerProductos();
        const usuarios = obtenerUsuarios();

        if (totalProductosCount) totalProductosCount.textContent = productos.length;
        if (totalUsuariosCount) totalUsuariosCount.textContent = usuarios.length;

        const conStockBajo = productos.filter(p => p.stock < 5).length;
        if (stockBajoCount) stockBajoCount.textContent = conStockBajo;
    }

    function renderProductos() {
        if (!tablaProductos) return;
        const productos = obtenerProductos();
        tablaProductos.innerHTML = "";

        productos.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-3 fw-bold">#${p.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${p.imagen}" alt="${p.nombre}" width="40" height="40" class="rounded me-2 object-fit-cover" onerror="this.src='https://via.placeholder.com/40'">
                        <div>
                            <span class="fw-semibold d-block">${p.nombre}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-secondary text-capitalize">${p.categoria}</span></td>
                <td>$${Number(p.precio).toLocaleString('es-CL')}</td>
                <td>
                    <span class="badge ${p.stock < 5 ? 'bg-danger' : 'bg-success'}">
                        ${p.stock} un.
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1 btn-editar-prod" data-id="${p.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-eliminar-prod" data-id="${p.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tablaProductos.appendChild(tr);
        });

        actualizarEstadisticas();
    }

    function renderUsuarios() {
        if (!tablaUsuarios) return;
        const usuarios = obtenerUsuarios();
        tablaUsuarios.innerHTML = "";

        usuarios.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-3 fw-bold">#${u.id}</td>
                <td>${u.nombre}</td>
                <td>${u.correo}</td>
                <td>
                    <span class="badge ${u.rol === 'Admin' || u.rol === 'Administrador' ? 'bg-danger' : 'bg-info'}">
                        ${u.rol}
                    </span>
                </td>
                <td>
                    <span class="badge ${u.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}">
                        ${u.estado}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary btn-editar-usr" data-id="${u.id}">
                        <i class="bi bi-eye"></i> Ver / Editar
                    </button>
                </td>
            `;
            tablaUsuarios.appendChild(tr);
        });

        actualizarEstadisticas();
    }

    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener("click", () => {
            formProducto.reset();
            document.getElementById("prodId").value = "";
            document.getElementById("modalProductoTitulo").textContent = "Agregar Producto";
        });
    }

    if (formProducto) {
        formProducto.addEventListener("submit", (e) => {
            e.preventDefault();

            const id = document.getElementById("prodId").value;
            const nombre = document.getElementById("prodNombre").value.trim();
            const categoria = document.getElementById("prodCategoria").value;
            const precio = Number(document.getElementById("prodPrecio").value);
            const stock = Number(document.getElementById("prodStock").value);
            const descripcion = document.getElementById("prodDescripcion").value.trim();
            const imagen = document.getElementById("prodImagen").value.trim();

            let productos = obtenerProductos();

            if (id) {
                productos = productos.map(p => p.id == id ? { id: Number(id), nombre, categoria, precio, stock, descripcion, imagen } : p);
            } else {
                const nuevoProd = {
                    id: Date.now(),
                    nombre,
                    categoria,
                    precio,
                    stock,
                    descripcion,
                    imagen
                };
                productos.push(nuevoProd);
            }

            localStorage.setItem("productos", JSON.stringify(productos));
            modalProducto.hide();
            renderProductos();
        });
    }

    if (tablaProductos) {
        tablaProductos.addEventListener("click", (e) => {
            const btnEdit = e.target.closest(".btn-editar-prod");
            const btnDelete = e.target.closest(".btn-eliminar-prod");

            if (btnEdit) {
                const id = btnEdit.dataset.id;
                const producto = obtenerProductos().find(p => p.id == id);

                if (producto) {
                    document.getElementById("prodId").value = producto.id;
                    document.getElementById("prodNombre").value = producto.nombre;
                    document.getElementById("prodCategoria").value = producto.categoria;
                    document.getElementById("prodPrecio").value = producto.precio;
                    document.getElementById("prodStock").value = producto.stock;
                    document.getElementById("prodDescripcion").value = producto.descripcion;
                    document.getElementById("prodImagen").value = producto.imagen;

                    document.getElementById("modalProductoTitulo").textContent = "Editar Producto";
                    modalProducto.show();
                }
            }

            if (btnDelete) {
                const id = btnDelete.dataset.id;
                if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                    let productos = obtenerProductos().filter(p => p.id != id);
                    localStorage.setItem("productos", JSON.stringify(productos));
                    renderProductos();
                }
            }
        });
    }

    if (btnGenerarPass) {
        btnGenerarPass.addEventListener("click", () => {
            const randomPass = Math.random().toString(36).slice(-6);
            document.getElementById("usrPassword").value = randomPass;
        });
    }

    if (tablaUsuarios) {
        tablaUsuarios.addEventListener("click", (e) => {
            const btnEdit = e.target.closest(".btn-editar-usr");
            if (btnEdit) {
                const id = btnEdit.dataset.id;
                const usuario = obtenerUsuarios().find(u => u.id == id);

                if (usuario) {
                    document.getElementById("usrId").value = usuario.id;
                    document.getElementById("usrNombre").value = usuario.nombre;
                    document.getElementById("usrRut").value = usuario.run || "";
                    document.getElementById("usrCorreo").value = usuario.correo;
                    document.getElementById("usrTelefono").value = usuario.telefono || "";
                    document.getElementById("usrDireccion").value = usuario.direccion || "";
                    document.getElementById("usrPassword").value = usuario.password;
                    document.getElementById("usrRol").value = usuario.rol;
                    document.getElementById("usrEstado").value = usuario.estado;

                    tablaComprasUsuario.innerHTML = "";
                    if (usuario.compras && usuario.compras.length > 0) {
                        usuario.compras.forEach(c => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
                                <td>${c.fecha}</td>
                                <td>${c.producto}</td>
                                <td class="text-center">${c.cantidad}</td>
                                <td>$${Number(c.total).toLocaleString('es-CL')}</td>
                            `;
                            tablaComprasUsuario.appendChild(tr);
                        });
                    } else {
                        tablaComprasUsuario.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No registra compras realizadas.</td></tr>`;
                    }

                    modalUsuario.show();
                }
            }
        });
    }

    if (formUsuario) {
        formUsuario.addEventListener("submit", (e) => {
            e.preventDefault();

            const id = document.getElementById("usrId").value;
            let usuarios = obtenerUsuarios();

            usuarios = usuarios.map(u => {
                if (u.id == id) {
                    return {
                        ...u,
                        nombre: document.getElementById("usrNombre").value.trim(),
                        run: document.getElementById("usrRut").value.trim(),
                        correo: document.getElementById("usrCorreo").value.trim(),
                        telefono: document.getElementById("usrTelefono").value.trim(),
                        direccion: document.getElementById("usrDireccion").value.trim(),
                        password: document.getElementById("usrPassword").value.trim(),
                        rol: document.getElementById("usrRol").value,
                        estado: document.getElementById("usrEstado").value
                    };
                }
                return u;
            });

            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            modalUsuario.hide();
            renderUsuarios();
        });
    }

    // Carga inicial
    renderProductos();
    renderUsuarios();
});
