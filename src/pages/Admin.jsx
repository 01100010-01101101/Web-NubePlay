import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TarjetaEstadistica from "../components/admin/TarjetaEstadistica";
import TablaProductosAdmin from "../components/admin/TablaProductosAdmin";
import FormularioProducto from "../components/admin/FormularioProducto";
import TablaUsuariosAdmin from "../components/admin/TablaUsuariosAdmin";
import FormularioUsuario from "../components/admin/FormularioUsuario";
import HistorialCompras from "../components/admin/HistorialCompras";
import TablaOrdenes from "../components/admin/TablaOrdenes";
import BoletaCompra from "../components/checkout/BoletaCompra";
import Modal from "../components/common/Modal";
import Alerta from "../components/common/Alerta";
import * as db from "../data/db";
import { limpiarRun } from "../utils/validaciones";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useAviso } from "../hooks/useAviso";


const PESTANAS = [
    { id: "productos", texto: "Gestión de Productos", icono: "bi-box-seam", soloAdmin: false },
    { id: "usuarios", texto: "Usuarios Registrados", icono: "bi-person-lines-fill", soloAdmin: true },
    { id: "ordenes", texto: "Órdenes", icono: "bi-receipt", soloAdmin: false }
];


function Admin() {
    const { usuario, esAdmin, cerrarSesion, refrescarSesion } = useAuth();
    const { sincronizar } = useCart();
    const navigate = useNavigate();
    const [parametros, setParametros] = useSearchParams();


    const [productos, setProductos] = useState(db.obtenerProductos);
    const [usuarios, setUsuarios] = useState(db.obtenerUsuarios);
    const [ordenes] = useState(db.obtenerOrdenes);


    const [productoEditando, setProductoEditando] = useState(null);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const { aviso, mostrar, ocultar } = useAviso(4000);


    const pestanasVisibles = PESTANAS.filter(pestana => esAdmin || !pestana.soloAdmin);
    const pestanaSolicitada = parametros.get("tab");
    const pestanaActiva = pestanasVisibles.some(p => p.id === pestanaSolicitada) ? pestanaSolicitada : "productos";
    const productosCriticos = productos.filter(p => p.stock <= p.stockCritico).length;


    function recargarProductos() {
        setProductos(db.obtenerProductos());
        sincronizar();
    }


    function validarCodigo(codigo) {
        const duplicado = productos.some(p =>
            p.codigo.toLowerCase() === codigo.toLowerCase() && String(p.id) !== String(productoEditando?.id)
        );
        return duplicado ? "Ya existe otro producto con ese código." : null;
    }


    function guardarProducto(datos) {
        if (productoEditando.id) {
            db.actualizarProducto(productoEditando.id, datos);
        } else {
            db.crearProducto(datos);
        }
        setProductoEditando(null);
        recargarProductos();


        if (datos.stock <= datos.stockCritico) {
            mostrar(`Advertencia: "${datos.nombre}" quedó en stock crítico.`, "warning");
        } else {
            mostrar("Producto guardado correctamente.");
        }
    }


    function eliminarProducto(producto) {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"?`)) return;
        db.eliminarProducto(producto.id);
        recargarProductos();
        mostrar("Producto eliminado.");
    }




    function validarDuplicados(datos) {
        const otros = usuarios.filter(u => String(u.id) !== String(usuarioEditando.id));
        if (otros.some(u => u.correo?.toLowerCase() === datos.correo)) {
            return { correo: "Ya existe un usuario con ese correo." };
        }
        if (otros.some(u => limpiarRun(u.run) === datos.run)) {
            return { run: "Ya existe un usuario con ese RUN." };
        }
        return {};
    }


    function guardarUsuario(datos) {
        db.actualizarUsuario(usuarioEditando.id, datos);
        setUsuarios(db.obtenerUsuarios());
        setUsuarioEditando(null);
        if (String(usuarioEditando.id) === String(usuario.id)) refrescarSesion();
        mostrar("Usuario actualizado correctamente.");
    }


    function salir() {
        cerrarSesion();
        navigate("/login");
    }


    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <nav className="navbar navbar-dark bg-dark shadow-sm">
                <div className="container flex-wrap gap-2">
                    <Link className="navbar-brand fw-bold text-primary" to="/">
                        <i className="bi bi-cloud-fill"></i> NUBEPLAY <span className="badge bg-danger ms-1 fs-6">Admin</span>
                    </Link>
                    <div className="d-flex align-items-center gap-3">
                        {esAdmin && (
                            <Link className="nav-link text-white" to="/"><i className="bi bi-house me-1"></i> Ver Tienda</Link>
                        )}
                        <button type="button" className="btn btn-link nav-link text-danger fw-bold p-0" onClick={salir}>
                            <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>


            <main className="container my-4 flex-grow-1">
                <Alerta mensaje={aviso?.mensaje} tipo={aviso?.tipo} onCerrar={ocultar} />


                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <TarjetaEstadistica titulo="Total Productos" valor={productos.length} icono="bi-controller" />
                    </div>
                    {esAdmin && (
                        <div className="col-md-4">
                            <TarjetaEstadistica titulo="Usuarios Registrados" valor={usuarios.length} icono="bi-people" color="bg-success text-white" />
                        </div>
                    )}
                    <div className="col-md-4">
                        <TarjetaEstadistica titulo="Stock Crítico" valor={productosCriticos} icono="bi-exclamation-triangle" color="bg-warning text-dark" />
                    </div>
                </div>


                <ul className="nav nav-pills mb-3 bg-white p-2 rounded-3 shadow-sm flex-column flex-sm-row" role="tablist">
                    {pestanasVisibles.map(pestana => (
                        <li className="nav-item" key={pestana.id} role="presentation">
                            <button
                                type="button"
                                role="tab"
                                className={`nav-link fw-bold ${pestanaActiva === pestana.id ? "active" : ""}`}
                                aria-selected={pestanaActiva === pestana.id}
                                onClick={() => setParametros({ tab: pestana.id })}
                            >
                                <i className={`bi ${pestana.icono} me-1`}></i> {pestana.texto}
                            </button>
                        </li>
                    ))}
                </ul>


                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {pestanaActiva === "productos" && (
                        <>
                            <div className="card-header bg-white p-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">Inventario de Productos</h5>
                                {esAdmin && (
                                    <button type="button" className="btn btn-primary fw-bold" onClick={() => setProductoEditando({})}>
                                        <i className="bi bi-plus-circle me-1"></i> Agregar Producto
                                    </button>
                                )}
                            </div>
                            <TablaProductosAdmin
                                productos={productos}
                                editable={esAdmin}
                                onEditar={setProductoEditando}
                                onEliminar={eliminarProducto}
                            />
                        </>
                    )}


                    {pestanaActiva === "usuarios" && (
                        <>
                            <div className="card-header bg-white p-3">
                                <h5 className="fw-bold mb-0">Usuarios Registrados en la Plataforma</h5>
                            </div>
                            <TablaUsuariosAdmin usuarios={usuarios} onVer={setUsuarioEditando} />
                        </>
                    )}


                    {pestanaActiva === "ordenes" && (
                        <>
                            <div className="card-header bg-white p-3">
                                <h5 className="fw-bold mb-0">Órdenes Registradas</h5>
                            </div>
                            <TablaOrdenes ordenes={ordenes} onVerDetalle={setOrdenSeleccionada} />
                        </>
                    )}
                </div>
            </main>


            <footer className="py-4 text-center mt-auto bg-dark text-white">
                <p className="mb-0 small">© 2026 NUBEPLAY. Módulo de Administración.</p>
            </footer>


            <Modal
                abierto={productoEditando !== null}
                titulo={productoEditando?.id ? "Editar Producto" : "Agregar Producto"}
                onCerrar={() => setProductoEditando(null)}
            >
                <FormularioProducto
                    key={productoEditando?.id || "nuevo"}
                    producto={productoEditando?.id ? productoEditando : null}
                    validarCodigo={validarCodigo}
                    onGuardar={guardarProducto}
                    onCancelar={() => setProductoEditando(null)}
                />
            </Modal>


            <Modal
                abierto={usuarioEditando !== null}
                titulo="Expediente Completo del Usuario"
                tamano="modal-lg"
                onCerrar={() => setUsuarioEditando(null)}
            >
                {usuarioEditando && (
                    <>
                        <FormularioUsuario
                            key={usuarioEditando.id}
                            usuario={usuarioEditando}
                            validarDuplicados={validarDuplicados}
                            onGuardar={guardarUsuario}
                        />
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                            <i className="bi bi-bag-check me-1"></i> Historial de Compras Realizadas
                        </h6>
                        <HistorialCompras compras={usuarioEditando.compras} />
                    </>
                )}
            </Modal>


            <Modal
                abierto={ordenSeleccionada !== null}
                titulo="Boleta de la orden"
                tamano="modal-lg"
                onCerrar={() => setOrdenSeleccionada(null)}
            >
                {ordenSeleccionada && <BoletaCompra orden={ordenSeleccionada} />}
            </Modal>
        </div>
    );
}


export default Admin;

