import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Ruta base del sitio:
//  - GitHub Pages / local: "/Web-NubePlay/" (valor por defecto)
//  - Render (Static Site):  definir la variable de entorno VITE_BASE="/"
export default defineConfig({
    plugins: [react()],
    base: process.env.VITE_BASE || "/Web-NubePlay/"
});
