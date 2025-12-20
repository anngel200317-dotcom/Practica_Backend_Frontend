import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
//      RUTAS DE USUARIOS
// ==========================================

// 1. Crear Usuario
app.post("/usuarios", async (req, res) => {
  try {
    const { cedula, nombre, clave } = req.body;
    if (!cedula || !nombre || !clave) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }
    const query = "INSERT INTO usuarios (cedula, nombre, clave) VALUES ($1, $2, $3) RETURNING *";
    const result = await pool.query(query, [cedula, nombre, clave]);
    res.json({ msg: "Usuario registrado", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Ver usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Ver todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Editar Usuario
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, nombre, clave } = req.body;
    const result = await pool.query(
      "UPDATE usuarios SET cedula = $1, nombre = $2, clave = $3 WHERE id = $4 RETURNING *",
      [cedula, nombre, clave, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: "Usuario actualizado", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Eliminar Usuario
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//      RUTAS DE MATERIAS (NUEVO)
// ==========================================

// 1. Crear Materia
app.post("/materias", async (req, res) => {
  try {
    const { codigo, nombre } = req.body;
    const result = await pool.query(
      "INSERT INTO materias (codigo, nombre) VALUES ($1, $2) RETURNING *",
      [codigo, nombre]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Ver todas las materias
app.get("/materias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materias");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Ver UNA materia por ID 
app.get("/materias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM materias WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Materia no encontrada" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Editar Materia
app.put("/materias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre } = req.body;
    
    const result = await pool.query(
      "UPDATE materias SET codigo = $1, nombre = $2 WHERE id = $3 RETURNING *",
      [codigo, nombre, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Materia no encontrada" });
    }
    
    res.json({ msg: "Materia actualizada", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Eliminar Materia
app.delete("/materias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM materias WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Materia no encontrada" });
    res.json({ msg: "Materia eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//      RUTA DE LOGIN (AUTENTICACIÓN)
// ==========================================
app.post("/login", async (req, res) => {
  try {
    const { cedula, clave } = req.body;

    // 1. Validar que enviaron datos
    if (!cedula || !clave) {
      return res.status(400).json({ msg: "Faltan credenciales (cédula o clave)" });
    }

    // 2. Buscar usuario que coincida en Cédula Y Clave
    const query = "SELECT * FROM usuarios WHERE cedula = $1 AND clave = $2";
    const result = await pool.query(query, [cedula, clave]);

    // 3. Verificar si encontró algo
    if (result.rows.length === 0) {
      return res.status(401).json({ msg: "Credenciales incorrectas" });
    }

    // 4. Login exitoso
    const usuario = result.rows[0];
    res.json({ 
      msg: "Login exitoso", 
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        cedula: usuario.cedula
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ==========================================
//      SERVIDOR
// ==========================================
app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));