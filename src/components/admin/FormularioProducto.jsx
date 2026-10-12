import { useState } from "react";
import CampoFormulario from "../common/CampoFormulario";
import { categorias } from "../../data/semillas";
import { validarProducto } from "../../utils/validaciones";

const PRODUCTO_VACIO = {
    codigo: "",
    nombre: "",
    categoria: "juegos",
    precio: "",
    stock: "",
    stockCritico: "",
    descripcion: "",
    imagen: ""
};

//crear o editar un producto
function FormularioProducto({ producto, onGuardar, onCancelar, validarCodigo }) {
    const [datos, setDatos] = useState(() => (producto ? { ...PRODUCTO_VACIO, ...producto } : PRODUCTO_VACIO));
    const [errores, setErrores] = useState({});

    function actualizarCampo(evento) {
        const { name, value } = evento.target;
        setDatos({ ...datos, [name]: value });
        if (errores[name]) setErrores({ ...errores, [name]: undefined });
    }

    function enviar(evento) {
        evento.preventDefault();

        const nuevosErrores = validarProducto(datos);
        const errorCodigo = !nuevosErrores.codigo && validarCodigo?.(datos.codigo.trim());
        if (errorCodigo) nuevosErrores.codigo = errorCodigo;

        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        onGuardar({
            codigo: datos.codigo.trim(),
            nombre: datos.nombre.trim(),
            categoria: datos.categoria,
            precio: Number(datos.precio),
            stock: Number(datos.stock),
            stockCritico: Number(datos.stockCritico || 0),
            descripcion: String(datos.descripcion || "").trim(),
            imagen: String(datos.imagen || "").trim()
        });
    }

    return (
        <form onSubmit={enviar} noValidate>
            <div className="row g-3">
                <CampoFormulario
                    id="prodCodigo" name="codigo" etiqueta="Código del Producto" className="col-md-5"
                    valor={datos.codigo} onChange={actualizarCampo} error={errores.codigo}
                    ayuda="Mínimo 3 caracteres."
                />
                <CampoFormulario
                    id="prodNombre" name="nombre" etiqueta="Nombre del Producto" className="col-md-7" maxLength={100}
                    valor={datos.nombre} onChange={actualizarCampo} error={errores.nombre}
                />

                <div className="col-md-6">
                    <label htmlFor="prodCategoria" className="form-label fw-semibold">Categoría</label>
                    <select id="prodCategoria" name="categoria" className="form-select" value={datos.categoria} onChange={actualizarCampo}>
                        {categorias.map(item => (
                            <option key={item.valor} value={item.valor}>{item.nombre}</option>
                        ))}
                    </select>
                </div>
                <CampoFormulario
                    id="prodPrecio" name="precio" etiqueta="Precio (CLP)" tipo="number" min="0" className="col-md-6"
                    valor={datos.precio} onChange={actualizarCampo} error={errores.precio}
                />

                <CampoFormulario
                    id="prodStock" name="stock" etiqueta="Cantidad en Stock" tipo="number" min="0" step="1" className="col-md-6"
                    valor={datos.stock} onChange={actualizarCampo} error={errores.stock}
                />
                <CampoFormulario
                    id="prodStockCritico" name="stockCritico" etiqueta="Stock Crítico" tipo="number" min="0" step="1" className="col-md-6"
                    valor={datos.stockCritico} onChange={actualizarCampo} error={errores.stockCritico}
                    ayuda="Alerta cuando el stock sea igual o inferior a este valor."
                />

                <CampoFormulario
                    id="prodDescripcion" name="descripcion" etiqueta="Descripción del Producto" multilinea rows="3" maxLength={500}
                    className="col-12" placeholder="Detalla las características del producto..."
                    valor={datos.descripcion} onChange={actualizarCampo} error={errores.descripcion}
                />
                <CampoFormulario
                    id="prodImagen" name="imagen" etiqueta="URL de la Imagen" tipo="url" className="col-12" placeholder="https://..."
                    valor={datos.imagen} onChange={actualizarCampo} error={errores.imagen}
                />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
                <button type="submit" className="btn btn-primary fw-bold">Guardar Producto</button>
            </div>
        </form>
    );
}

export default FormularioProducto;
