import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TarjetaEstadistica from "../components/admin/TarjetaEstadistica";
import PanelProductos from "../components/admin/PanelProductos";
import PanelCategorias from "../components/admin/PanelCategorias";
import PanelUsuarios from "../components/admin/PanelUsuarios";
import PanelOrdenes from "../components/admin/PanelOrdenes";
import PanelReportes from "../components/admin/PanelReportes";
import PanelPerfil from "../components/admin/PanelPerfil";
import Alerta from "../components/common/Alerta";
import { useAuth } from "../context/AuthContext";
import { useCatalogo } from "../context/CatalogoContext";
import { boletasApi, usuariosApi } from "../api/servicios";
import { useAviso } from "../hooks/useAviso";

// Permisos por pestaña (Anexo 1): el Vendedor solo ve Productos y Órdenes (en modo lectura);
// el resto de las pestañas ni siquiera se dibujan para él.
const PESTANAS = [
    { id: "productos", texto: "Productos", icono: "bi-box-seam", soloAdmin: false },
    { id: "categorias", texto: "Categorías", icono: "bi-tags", soloAdmin: true },
    { id: "usuarios", texto: "Usuarios", icono: "bi-person-lines-fill", soloAdmin: true },
    { id: "ordenes", texto: "Órdenes", icono: "bi-receipt", soloAdmin: false },
    { id: "reportes", texto: "Reportes", icono: "bi-bar-chart", soloAdmin: true },
    { id: "perfil", texto: "Mi Perfil", icono: "bi-person-circle", soloAdmin: true }
];

// Panel de administración: estadísticas, pestañas y el panel de la pestaña activa.
// Cada pestaña es un componente propio que maneja sus datos y modales.
function Admin() {
    const { usuario, esAdmin, cerrarSesion } = useAuth();
    const { productos } = useCatalogo();
    const navigate = useNavigate();
    const [parametros, setParametros] = useSearchParams();
    const { aviso, mostrar, ocultar } = useAviso(4000);
    // Se incrementa cuando un panel modifica datos, para recalcular las estadísticas.
    const [version, setVersion] = useState(0);
    const notificarCambio = () => setVersion(v => v + 1);
    const [conteos, setConteos] = useState({ usuarios: "…", ordenes: "…" });

    // Contadores de las tarjetas: GET /boletas (Admin y Vendedor) y GET /usuarios (solo Admin).
    useEffect(() => {
        let activo = true;
        boletasApi.listar()
            .then(lista => activo && setConteos(c => ({ ...c, ordenes: lista.length })))
            .catch(() => activo && setConteos(c => ({ ...c, ordenes: "—" })));
        if (esAdmin) {
            usuariosApi.listar()
                .then(lista => activo && setConteos(c => ({ ...c, usuarios: lista.length })))
                .catch(() => activo && setConteos(c => ({ ...c, usuarios: "—" })));
        }
        return () => { activo = false; };
    }, [esAdmin, version]);

    const pestanasVisibles = PESTANAS.filter(pestana => esAdmin || !pestana.soloAdmin);
    const pestanaSolicitada = parametros.get("tab");
    const pestanaActiva = pestanasVisibles.some(p => p.id === pestanaSolicitada) ? pestanaSolicitada : "productos";
    const soloCriticos = parametros.get("criticos") === "1";

    const productosCriticos = productos.filter(p => p.stock <= p.stockCritico).length;

    function irA(tab, extra = {}) {
        ocultar();
        setParametros({ tab, ...extra });
    }

    function salir() {
        cerrarSesion();
        navigate("/login");
    }

    const propsPanel = { mostrar, onCambio: notificarCambio };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <nav className="navbar navbar-dark bg-dark shadow-sm">
                <div className="container flex-wrap gap-2">
                    <Link className="navbar-brand fw-bold text-primary" to="/">
                        <i className="bi bi-cloud-fill"></i> NUBEPLAY{" "}
                        <span className={`badge ms-1 fs-6 ${esAdmin ? "bg-danger" : "bg-warning text-dark"}`}>{esAdmin ? "Admin" : "Vendedor"}</span>
                    </Link>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-white-50 small d-none d-md-inline">
                            <i className="bi bi-person-circle me-1"></i>{usuario?.nombre} ({usuario?.rol})
                        </span>
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
                    <div className="col-6 col-lg-3">
                        <TarjetaEstadistica titulo="Total Productos" valor={productos.length} icono="bi-controller"
                            onClick={() => irA("productos")} />
                    </div>
                    <div className="col-6 col-lg-3">
                        <TarjetaEstadistica titulo="Stock Crítico" valor={productosCriticos} icono="bi-exclamation-triangle"
                            color="bg-warning text-dark" detalle="Ver listado"
                            onClick={() => irA("productos", { criticos: "1" })} />
                    </div>
                    {esAdmin && (
                        <div className="col-6 col-lg-3">
                            <TarjetaEstadistica titulo="Usuarios Registrados" valor={conteos.usuarios} icono="bi-people"
                                color="bg-success text-white" onClick={() => irA("usuarios")} />
                        </div>
                    )}
                    <div className="col-6 col-lg-3">
                        <TarjetaEstadistica titulo="Órdenes" valor={conteos.ordenes} icono="bi-receipt"
                            color="bg-info text-dark" onClick={() => irA("ordenes")} />
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
                                onClick={() => irA(pestana.id)}
                            >
                                <i className={`bi ${pestana.icono} me-1`}></i> {pestana.texto}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden" role="tabpanel">
                    {pestanaActiva === "productos" && (
                        <PanelProductos
                            {...propsPanel}
                            esAdmin={esAdmin}
                            soloCriticos={soloCriticos}
                            onSoloCriticosChange={activo => setParametros(activo ? { tab: "productos", criticos: "1" } : { tab: "productos" })}
                        />
                    )}
                    {pestanaActiva === "categorias" && <PanelCategorias {...propsPanel} />}
                    {pestanaActiva === "usuarios" && <PanelUsuarios {...propsPanel} />}
                    {pestanaActiva === "ordenes" && <PanelOrdenes {...propsPanel} esAdmin={esAdmin} />}
                    {pestanaActiva === "reportes" && <PanelReportes />}
                    {pestanaActiva === "perfil" && <PanelPerfil {...propsPanel} />}
                </div>
            </main>

            <footer className="py-4 text-center mt-auto bg-dark text-white">
                <p className="mb-0 small">© 2026 NUBEPLAY. Módulo de Administración.</p>
            </footer>
        </div>
    );
}

export default Admin;
