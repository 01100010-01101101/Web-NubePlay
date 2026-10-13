import { formatearPrecio, IMAGEN_POR_DEFECTO, usarImagenPorDefecto } from "../../utils/formato";


function TablaResumenCompra({ items }) {
    return (
        <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th className="text-center">Cantidad</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>
                                <img
                                    src={item.imagen || IMAGEN_POR_DEFECTO}
                                    alt={item.nombre}
                                    width="40"
                                    height="40"
                                    className="rounded object-fit-cover"
                                    onError={usarImagenPorDefecto}
                                />
                            </td>
                            <td>{item.nombre}</td>
                            <td>{formatearPrecio(item.precio)}</td>
                            <td className="text-center">{item.cantidad}</td>
                            <td>{formatearPrecio(item.precio * item.cantidad)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default TablaResumenCompra;

