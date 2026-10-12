import FilaCarrito from "./FilaCarrito";

function TablaCarrito({ items, onCambiarCantidad, onEliminar }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="ps-4">Producto</th>
                        <th scope="col">Precio</th>
                        <th scope="col" className="text-center">Cantidad</th>
                        <th scope="col">Subtotal</th>
                        <th scope="col" className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <FilaCarrito
                            key={item.id}
                            item={item}
                            onCambiarCantidad={onCambiarCantidad}
                            onEliminar={onEliminar}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TablaCarrito;