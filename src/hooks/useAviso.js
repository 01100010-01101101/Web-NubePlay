import { useEffect, useRef, useState } from "react";
export function useAviso(duracion = 3000) {
    const [aviso, setAviso] = useState(null);
    const temporizador = useRef(null);

    function mostrar(mensaje, tipo = "success") {
        clearTimeout(temporizador.current);
        setAviso({ mensaje, tipo });
        if (duracion) {
            temporizador.current = setTimeout(() => setAviso(null), duracion);
        }
    }

    function ocultar() {
        clearTimeout(temporizador.current);
        setAviso(null);
    }

    useEffect(() => () => clearTimeout(temporizador.current), []);

    return { aviso, mostrar, ocultar };
}
