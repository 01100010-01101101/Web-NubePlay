import { Route, Routes } from "react-router-dom";
import LayoutTienda from "./components/layout/LayoutTienda";
import RutaProtegida from "./components/common/RutaProtegida";
import ScrollAlInicio from "./components/common/ScrollAlInicio";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Categorias from "./pages/Categorias";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import CompraExitosa from "./pages/CompraExitosa";
import PagoError from "./pages/PagoError";
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
        <>
            <ScrollAlInicio />
            <Routes>
                <Route element={<LayoutTienda />}>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/productos/:id" element={<DetalleProducto />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/categorias/:categoria" element={<Categorias />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/compra-exitosa/:id" element={<CompraExitosa />} />
                    <Route path="/pago-error" element={<PagoError />} />
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
        </>
    );
}




export default App;

