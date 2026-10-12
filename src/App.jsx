import { Route, Routes } from "react-router-dom";
import LayoutTienda from "./components/layout/LayoutTienda";
import RutaProtegida from "./components/common/RutaProtegida";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Nosotros from "./pages/Nosotros";
import Blogs from "./pages/Blogs";
import DetalleBlog from "./pages/DetalleBlog";
import Contacto from "./pages/Contacto";
import Admin from "./pages/Admin";
import NoEncontrado from "./pages/NoEncontrado";

function App() {
    return (
        <Routes>
            <Route element={<LayoutTienda />}>
                <Route path="/" element={<Inicio />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/:id" element={<DetalleProducto />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<DetalleBlog />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="*" element={<NoEncontrado />} />
            </Route>

            <Route path="/admin" element={<RutaProtegida><Admin /></RutaProtegida>} />
        </Routes>
    );
}

export default App;
