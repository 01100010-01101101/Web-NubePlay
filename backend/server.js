const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de CORS permisiva para consumo local y desde cualquier origen
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- USUARIOS (REGISTRO Y LOGIN) ---

// Registro de usuario
app.post("/api/auth/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Verificar si el correo ya existe
    const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado" });
    }

    // Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email",
      [nombre, email, passwordHash]
    );

    console.log("Usuario insertado con éxito:", result.rows[0]);
    res.status(201).json({ mensaje: "Usuario creado con éxito", usuario: result.rows[0] });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login de usuario
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];
    const esCorrecta = await bcrypt.compare(password, usuario.password);

    if (!esCorrecta) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login OK",
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ver todos los usuarios (Útil para pruebas de la universidad)
app.get("/api/usuarios", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, nombre, email, creado_en FROM usuarios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE PRODUCTOS ---

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
  console.log(`Servidor NubePlay escuchando en puerto ${PORT}`);
});