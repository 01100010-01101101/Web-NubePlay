function Modal({ abierto, titulo, onCerrar, children, footer, tamano = "", claseEncabezado = "" }) {
    if (!abierto) return null;

    return (
        <>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" onClick={onCerrar}>
                <div
                    className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${tamano}`}
                    onClick={evento => evento.stopPropagation()}
                >
                    <div className="modal-content rounded-4 border-0">
                        <div className={`modal-header ${claseEncabezado}`}>
                            <h5 className="modal-title fw-bold">{titulo}</h5>
                            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body p-4">{children}</div>
                        {footer && <div className="modal-footer">{footer}</div>}
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
}

export default Modal;