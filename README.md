# NUBEPLAY – Frontend (React + Vite)


Tienda online de videojuegos, consolas y accesorios (DSY1104 – Desarrollo Fullstack II).
Desde la Evaluación 3 el frontend consume la **API REST del backend Spring Boot**
(`nubeplay-backend`) con autenticación **JWT** por roles.


## Requisitos


- Node.js 20 o superior
- Backend `nubeplay-backend` en ejecución (`http://localhost:8080`)


## Ejecutar


```bash
npm install
npm run dev        # http://localhost:5173/Web-NubePlay/
npm test           # pruebas Jasmine + Karma (Chrome Headless)
```


La URL de la API se configura con `VITE_API_URL` (ver `.env.example`).
Por defecto: `http://localhost:8080/api/v1`.


## Integración con el backend


| Archivo | Función |
|---|---|
| `src/api/cliente.js` | `fetch` con JSON, header `Authorization: Bearer`, renovación automática del token (`/auth/refresh`) y errores `ApiError` |
| `src/api/servicios.js` | Un servicio por recurso: auth, productos, categorías, usuarios y boletas |
| `src/api/sesion.js` | Guarda los tokens en `localStorage` (la sesión sobrevive a una recarga) |
| `src/context/CatalogoContext.jsx` | Carga productos y categorías al iniciar y mantiene la caché |
| `src/context/AuthContext.jsx` | Login, logout y restauración de la sesión con `GET /auth/me` |
| `src/components/common/RutaProtegida.jsx` | Rutas permitidas por rol |
| `src/components/common/SinVendedor.jsx` | El vendedor no accede al carrito ni al pago |


## Roles


| Rol | Acceso |
|---|---|
| Administrador | Total: productos, categorías, usuarios, órdenes, reportes y perfil |
| Vendedor | Solo ve productos y órdenes (lectura) |
| Cliente | Solo la tienda (comprar y ver su boleta) |


Cuentas de prueba (creadas por el backend): `admin@duoc.cl / admin`, `vendedor@duoc.cl / vendedor`, `cliente@gmail.com / cliente`.


## Pruebas


Las pruebas usan un servidor API simulado (`src/tests/servidorFalso.js`) que reemplaza `fetch`
con las mismas rutas, códigos HTTP y reglas de roles del backend.



