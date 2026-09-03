const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// --- RUTAS DE PRODUCTOS ---

// Obtener todos los productos (con soporte de filtros)
app.get("/api/productos", async (req, res) => {
  try {
    const { buscar, categoria } = req.query;
    let query = "SELECT * FROM productos WHERE 1=1";
    const params = [];

    if (buscar) {
      params.push(`%${buscar}%`);
      query += ` AND LOWER(nombre) LIKE LOWER($${params.length})`;
    }

    if (categoria && categoria !== "todas") {
      params.push(categoria);
      query += ` AND categoria = $${params.length}`;
    }

    query += " ORDER BY id ASC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Obtener un solo producto por ID
app.get("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// --- RUTAS DEL CARRITO ---

// Obtener contenido del carrito por sessionId
app.get("/api/carrito/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    let carrito = await pool.query("SELECT id FROM carritos WHERE session_id = $1", [sessionId]);
    if (carrito.rows.length === 0) {
      carrito = await pool.query(
        "INSERT INTO carritos (session_id) VALUES ($1) RETURNING id",
        [sessionId]
      );
    }
    const carritoId = carrito.rows[0].id;

    const items = await pool.query(
      `SELECT d.id AS detalle_id, p.id, p.nombre, p.precio, p.imagen, p.categoria, d.cantidad 
       FROM detalle_carrito d
       JOIN productos p ON d.producto_id = p.id
       WHERE d.carrito_id = $1`,
      [carritoId]
    );

    res.json({ carritoId, items: items.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// Agregar o actualizar producto en el carrito
app.post("/api/carrito", async (req, res) => {
  try {
    const { sessionId, productoId, cantidad = 1 } = req.body;

    let carrito = await pool.query("SELECT id FROM carritos WHERE session_id = $1", [sessionId]);
    if (carrito.rows.length === 0) {
      carrito = await pool.query(
        "INSERT INTO carritos (session_id) VALUES ($1) RETURNING id",
        [sessionId]
      );
    }
    const carritoId = carrito.rows[0].id;

    await pool.query(
      `INSERT INTO detalle_carrito (carrito_id, producto_id, cantidad)
       VALUES ($1, $2, $3)
       ON CONFLICT (carrito_id, producto_id) 
       DO UPDATE SET cantidad = detalle_carrito.cantidad + EXCLUDED.cantidad`,
      [carritoId, productoId, cantidad]
    );

    res.json({ mensaje: "Producto añadido al carrito exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar al carrito" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor NubePlay escuchando en http://localhost:${PORT}`);
});