import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { categoriasApi, productosApi } from "../api/servicios";
import { establecerCatalogo } from "../data/db";

const CatalogoContext = createContext(null);

// Carga el catálogo desde el backend (GET /productos y GET /categorias) al iniciar la app.
// Mientras carga muestra un indicador; si el backend no responde, muestra el error
// con un botón para reintentar. Las pantallas de administración llaman a `recargar()`
// después de crear, editar o eliminar para mantener la caché sincronizada.
// `inicial` (opcional) permite partir con datos ya cargados; lo usan las pruebas unitarias.
export function CatalogoProvider({ children, inicial = null }) {
    const [estado, setEstado] = useState(() => inicial
        ? { cargando: false, error: null, productos: inicial.productos, categorias: inicial.categorias }
        : { cargando: true, error: null, productos: [], categorias: [] });

    const recargar = useCallback(async () => {
        try {
            const [productos, categorias] = await Promise.all([productosApi.listar(), categoriasApi.listar()]);
            establecerCatalogo({ productos, categorias });
            setEstado({ cargando: false, error: null, productos, categorias });
            return true;
        } catch (error) {
            setEstado(actual => ({ ...actual, cargando: false, error: error.message }));
            return false;
        }
    }, []);

    useEffect(() => {
        if (!inicial) recargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recargar]);

    if (estado.cargando) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3" data-testid="cargando-catalogo">
                <div className="spinner-border text-primary" role="status"></div>
                <span className="text-muted">Conectando con NUBEPLAY...</span>
            </div>
        );
    }

    if (estado.error && estado.productos.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 text-center" style={{ maxWidth: "460px" }} data-testid="error-catalogo">
                    <i className="bi bi-cloud-slash display-4 text-danger"></i>
                    <h1 className="h5 fw-bold mt-2">No pudimos cargar la tienda</h1>
                    <p className="text-muted mb-3">{estado.error}</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => { setEstado(actual => ({ ...actual, cargando: true })); recargar(); }}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const valor = {
        productos: estado.productos,
        categorias: estado.categorias,
        recargar
    };

    return <CatalogoContext.Provider value={valor}>{children}</CatalogoContext.Provider>;
}

export function useCatalogo() {
    const contexto = useContext(CatalogoContext);
    if (!contexto) throw new Error("useCatalogo debe usarse dentro de <CatalogoProvider>.");
    return contexto;
}
