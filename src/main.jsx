import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./style.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CatalogoProvider } from "./context/CatalogoContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <CatalogoProvider>
                <AuthProvider>
                    <CartProvider>
                        <App />
                    </CartProvider>
                </AuthProvider>
            </CatalogoProvider>
        </BrowserRouter>
    </React.StrictMode>
);
