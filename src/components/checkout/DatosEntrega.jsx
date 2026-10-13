import CampoFormulario from "../common/CampoFormulario";
import SelectorRegionComuna from "../common/SelectorRegionComuna";


function DatosEntrega({ datos, errores = {}, onChange, soloLectura = false }) {
    function actualizarCampo(evento) {
        onChange({ [evento.target.name]: evento.target.value });
    }


    const comunes = { onChange: actualizarCampo, disabled: soloLectura };


    return (
        <>
            <h5 className="fw-bold mt-4 mb-1">Información del cliente</h5>
            {!soloLectura && <p className="text-muted small">Completa la siguiente información</p>}


            <div className="row">
                <CampoFormulario id="nombre" etiqueta="Nombre *" className="col-md-4 mb-3" maxLength={50}
                    valor={datos.nombre} error={errores.nombre} {...comunes} />
                <CampoFormulario id="apellidos" etiqueta="Apellidos *" className="col-md-4 mb-3" maxLength={100}
                    valor={datos.apellidos} error={errores.apellidos} {...comunes} />
                <CampoFormulario id="correo" etiqueta="Correo *" tipo="email" className="col-md-4 mb-3" maxLength={100}
                    valor={datos.correo} error={errores.correo} {...comunes} />
            </div>


            <h5 className="fw-bold mt-2 mb-1">Dirección de entrega de los productos</h5>
            {!soloLectura && <p className="text-muted small">Ingrese dirección de forma detallada</p>}


            <div className="row">
                <CampoFormulario id="calle" etiqueta="Calle *" className="col-md-8 mb-3" maxLength={300}
                    placeholder="Ej: Los Crisantemos 123, Edificio Norte"
                    valor={datos.calle} error={errores.calle} {...comunes} />
                <CampoFormulario id="departamento" etiqueta="Departamento (opcional)" className="col-md-4 mb-3" maxLength={50}
                    placeholder="Ej: 603"
                    valor={datos.departamento} error={errores.departamento} {...comunes} />
            </div>


            <SelectorRegionComuna
                prefijoId="entrega-"
                region={datos.region}
                comuna={datos.comuna}
                errores={errores}
                deshabilitado={soloLectura}
                onChange={onChange}
            />


            <CampoFormulario id="indicaciones" etiqueta="Indicaciones para la entrega (opcional)" multilinea rows="2" maxLength={300}
                placeholder="Ej: Entre calles, color del edificio, no tiene timbre."
                valor={datos.indicaciones} error={errores.indicaciones} {...comunes} />
        </>
    );
}


export default DatosEntrega;

