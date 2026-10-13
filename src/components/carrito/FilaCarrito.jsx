import SelectorCantidad from "../detalle/SelectorCantidad";
import { formatearPrecio, IMAGEN_POR_DEFECTO, usarImagenPorDefecto } from "../../utils/formato";
import { obtenerNombreCategoria } from "../../data/db";
function FilaCarrito({ item, onCambiarCantidad, onEliminar }) {
    return (
        <tr>
            <td className="ps-4">
                <div className="d-flex align-items-center">
                    <img
                        src={item.imagen || IMAGEN_POR_DEFECTO}
                        alt={item.nombre}
                        className="rounded-3 me-3"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        onError={usarImagenPorDefecto}
                    />
                    <div>
                        <h6 className="mb-0 fw-bold">{item.nombre}</h6>
                        <small className="text-muted">{obtenerNombreCategoria(item.categoria)}</small>
                    </div>
                </div>
            </td>
            <td className="fw-semibold">{formatearPrecio(item.precio)}</td>
            <td className="text-center">
                <div className="d-flex justify-content-center">
                    <SelectorCantidad
                        cantidad={item.cantidad}
                        maximo={item.stock}
                        tamano="input-group-sm"
                        onChange={nueva => onCambiarCantidad(item.id, nueva)}
                    />
                </div>
                <div className="small text-muted mt-1">Stock: {item.stock}</div>
            </td>
            <td className="fw-bold text-primary">{formatearPrecio(item.precio * item.cantidad)}</td>
            <td className="text-center">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title="Eliminar producto"
                    aria-label={`Eliminar ${item.nombre}`}
                    onClick={() => onEliminar(item.id)}
                >
                    <i className="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    );
}
export default FilaCarrito;