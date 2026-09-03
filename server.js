const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Endpoint para listar todos los productos
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

// Endpoint para obtener un producto por ID
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

app.listen(PORT, () => {
  console.log(`Servidor NubePlay escuchando en http://localhost:${PORT}`);
});