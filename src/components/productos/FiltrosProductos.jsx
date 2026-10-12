import { categorias } from "../../data/semillas";
function FiltrosProductos({ busqueda, categoria, onBusquedaChange, onCategoriaChange }) {
    return (
        <div className="row mb-4 g-3">
            <div className="col-md-8">
                <div className="input-group">
                    <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar producto por nombre..."
                        aria-label="Buscar producto"
                        value={busqueda}
                        onChange={evento => onBusquedaChange(evento.target.value)}
                    />
                </div>
            </div>
            <div className="col-md-4">
                <select
                    className="form-select"
                    aria-label="Filtrar por categoría"
                    value={categoria}
                    onChange={evento => onCategoriaChange(evento.target.value)}
                >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map(item => (
                        <option key={item.valor} value={item.valor}>{item.nombre}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
export default FiltrosProductos;