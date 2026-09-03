document.addEventListener("DOMContentLoaded", () => {
    // Lista base expandida con todos los atributos de perfil
    const usuariosBase = [
        {
            id: 1,
            nombre: "Admin Nubeplay",
            rut: "11.111.111-1",
            correo: "admin@duoc.cl",
            telefono: "+56 9 8765 4321",
            direccion: "Av. Central 456, Santiago",
            password: "adminPassword123",
            rol: "Administrador",
            estado: "Activo",
            compras: [
                { fecha: "2026-02-15", producto: "Consola PlayStation 5", cantidad: 1, total: 549990 }
            ]
        },
        {
            id: 2,
            nombre: "Juan Pérez",
            rut: "18.654.321-K",
            correo: "juan.perez@gmail.com",
            telefono: "+56 9 1234 5678",
            direccion: "Pasaje Los Olivos 789, Maipú",
            password: "perezClave2026",
            rol: "Cliente",
            estado: "Activo",
            compras: [
                { fecha: "2026-03-01", producto: "Grand Theft Auto VI", cantidad: 1, total: 69990 },
                { fecha: "2026-03-01", producto: "Mando Inalámbrico DualSense", cantidad: 1, total: 64990 }
            ]
        },
        {
            id: 3,
            nombre: "María González",
            rut: "19.876.543-2",
            correo: "m.gonzalez@duoc.cl",
            telefono: "+56 9 4321 8765",
            direccion: "Calle Las Lilas 321, Providencia",
            password: "mariaSecure99",
            rol: "Cliente",
            estado: "Activo",
            compras: []
        }
    ];

    const tablaUsuariosAdmin = document.getElementById("tablaUsuariosAdmin");
    const formUsuario = document.getElementById("formUsuario");
    const modalUsuarioBs = new bootstrap.Modal(document.getElementById("modalUsuario"));
    const btnGenerarPass = document.getElementById("btnGenerarPass");

    function formatearPrecio(precio) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(precio);
    }

    function obtenerUsuarios() {
        const usrs = localStorage.getItem("usuariosNubeplay");
        if (!usrs) {
            localStorage.setItem("usuariosNubeplay", JSON.stringify(usuariosBase));
            return usuariosBase;
        }
        return JSON.parse(usrs);
    }

    function guardarUsuarios(usrs) {
        localStorage.setItem("usuariosNubeplay", JSON.stringify(usrs));
    }

    function renderizarUsuariosAdmin() {
        const usuarios = obtenerUsuarios();
        tablaUsuariosAdmin.innerHTML = "";

        usuarios.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-3 fw-bold">#${u.id}</td>
                <td>
                    <span class="fw-semibold d-block">${u.nombre}</span>
                    <small class="text-muted">${u.rut || 'Sin RUT'}</small>
                </td>
                <td>${u.correo}</td>
                <td><span class="badge ${u.rol === 'Administrador' ? 'bg-primary' : 'bg-secondary'}">${u.rol}</span></td>
                <td><span class="badge ${u.estado === 'Activo' ? 'bg-success' : 'bg-danger'}">${u.estado}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info btn-ver-usr" data-id="${u.id}">
                        <i class="bi bi-pencil-square me-1"></i> Expediente
                    </button>
                </td>
            `;
            tablaUsuariosAdmin.appendChild(tr);
        });

        document.querySelectorAll(".btn-ver-usr").forEach(btn => {
            btn.addEventListener("click", (e) => abrirModalUsuario(parseInt(e.currentTarget.dataset.id)));
        });
    }

    // Abrir Modal de Expediente Completo
    function abrirModalUsuario(id) {
        const usuarios = obtenerUsuarios();
        const usr = usuarios.find(u => u.id === id);
        if (!usr) return;

        document.getElementById("usrId").value = usr.id;
        document.getElementById("usrNombre").value = usr.nombre || "";
        document.getElementById("usrRut").value = usr.rut || "";
        document.getElementById("usrCorreo").value = usr.correo || "";
        document.getElementById("usrTelefono").value = usr.telefono || "";
        document.getElementById("usrDireccion").value = usr.direccion || "";
        document.getElementById("usrPassword").value = usr.password || "";
        document.getElementById("usrRol").value = usr.rol || "Cliente";
        document.getElementById("usrEstado").value = usr.estado || "Activo";

        // Cargar Historial de Compras
        const tablaCompras = document.getElementById("tablaComprasUsuario");
        tablaCompras.innerHTML = "";

        if (usr.compras && usr.compras.length > 0) {
            usr.compras.forEach(c => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${c.fecha}</td>
                    <td class="fw-semibold">${c.producto}</td>
                    <td class="text-center">${c.cantidad}</td>
                    <td class="fw-bold text-primary">${formatearPrecio(c.total)}</td>
                `;
                tablaCompras.appendChild(tr);
            });
        } else {
            tablaCompras.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-3">Este usuario no registra historial de compras.</td>
                </tr>
            `;
        }

        modalUsuarioBs.show();
    }

    // Generador opcional de contraseñas aleatorias
    if (btnGenerarPass) {
        btnGenerarPass.addEventListener("click", () => {
            const passAleatoria = Math.random().toString(36).slice(-8) + "Np!";
            document.getElementById("usrPassword").value = passAleatoria;
        });
    }

    // Guardar cambios de usuario
    formUsuario.addEventListener("submit", (e) => {
        e.preventDefault();

        const idVal = parseInt(document.getElementById("usrId").value);
        let usuarios = obtenerUsuarios();
        const index = usuarios.findIndex(u => u.id === idVal);

        if (index !== -1) {
            usuarios[index].nombre = document.getElementById("usrNombre").value.trim();
            usuarios[index].rut = document.getElementById("usrRut").value.trim();
            usuarios[index].correo = document.getElementById("usrCorreo").value.trim();
            usuarios[index].telefono = document.getElementById("usrTelefono").value.trim();
            usuarios[index].direccion = document.getElementById("usrDireccion").value.trim();
            usuarios[index].password = document.getElementById("usrPassword").value.trim();
            usuarios[index].rol = document.getElementById("usrRol").value;
            usuarios[index].estado = document.getElementById("usrEstado").value;

            guardarUsuarios(usuarios);
            modalUsuarioBs.hide();
            renderizarUsuariosAdmin();
        }
    });

    renderizarUsuariosAdmin();
});

