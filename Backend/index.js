import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
//      RUTAS DE USUARIOS
// ==========================================

// Crear usuario
app.post("/usuarios", async (req, res) => {
  try {
    const { cedula, nombre, clave } = req.body;

    if (!cedula || !nombre || !clave) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const salt = await bcrypt.genSalt(10);
    const claveEncriptada = await bcrypt.hash(clave, salt);

    const result = await pool.query(
      "INSERT INTO usuarios (cedula, nombre, clave) VALUES ($1,$2,$3) RETURNING *",
      [cedula, nombre, claveEncriptada]
    );

    res.json({ msg: "Usuario registrado", data: result.rows[0] });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ msg: "Cédula ya registrada" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Ver todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Editar usuario
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { cedula, nombre, clave } = req.body;

    const result = await pool.query(
      "UPDATE usuarios SET cedula=$1, nombre=$2, clave=$3 WHERE id=$4 RETURNING *",
      [cedula, nombre, clave, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json({ msg: "Usuario actualizado", data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar usuario
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json({ msg: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//      MATERIAS
// ==========================================

app.post("/materias", async (req, res) => {
  try {
    const { codigo, nombre } = req.body;
    if (!codigo || !nombre)
      return res.status(400).json({ msg: "Datos incompletos" });

    const result = await pool.query(
      "INSERT INTO materias (codigo,nombre) VALUES ($1,$2) RETURNING *",
      [codigo, nombre]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/materias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materias ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/materias/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE materias SET codigo=$1, nombre=$2 WHERE id=$3 RETURNING *",
      [req.body.codigo, req.body.nombre, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Materia no encontrada" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/materias/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM materias WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Materia no encontrada" });

    res.json({ msg: "Materia eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//      ESTUDIANTES
// ==========================================

app.get("/estudiantes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM estudiantes ORDER BY nombre");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/estudiantes", async (req, res) => {
  try {
    const { cedula, nombre } = req.body;
    const result = await pool.query(
      "INSERT INTO estudiantes (cedula,nombre) VALUES ($1,$2) RETURNING *",
      [cedula, nombre]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/estudiantes/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM estudiantes WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Estudiante no encontrado" });

    res.json({ msg: "Estudiante eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//      NOTAS (CORREGIDO)
// ==========================================

app.get("/notas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, e.nombre estudiante, m.nombre materia, n.valor
      FROM notas n
      JOIN estudiantes e ON n.estudiante_id = e.id
      JOIN materias m ON n.materia_id = m.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/notas", async (req, res) => {
  try {
    const { estudiante_id, materia_id, valor } = req.body;

    const check = await pool.query(
      "SELECT * FROM notas WHERE estudiante_id=$1 AND materia_id=$2",
      [estudiante_id, materia_id]
    );

    if (check.rows.length > 0) {
      await pool.query(
        "UPDATE notas SET valor=$1 WHERE estudiante_id=$2 AND materia_id=$3",
        [valor, estudiante_id, materia_id]
      );
      res.json({ msg: "Nota actualizada" });
    } else {
      await pool.query(
        "INSERT INTO notas (estudiante_id,materia_id,valor) VALUES ($1,$2,$3)",
        [estudiante_id, materia_id, valor]
      );
      res.json({ msg: "Nota registrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/notas/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM notas WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Nota no encontrada" });

    res.json({ msg: "Nota eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//      LOGIN
// ==========================================

app.post("/login", async (req, res) => {
  try {
    const { cedula, clave } = req.body;

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE cedula=$1",
      [cedula]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ msg: "Usuario no encontrado" });

    const valido = await bcrypt.compare(clave, result.rows[0].clave);

    if (!valido)
      return res.status(401).json({ msg: "Contraseña incorrecta" });

    res.json({ msg: "Login exitoso", usuario: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//      ADMIN POR DEFECTO
// ==========================================

async function crearAdminPorDefecto() {
  try {
    const cedula = "1314571769";
    const nombre = "Angel Cedeño";
    const clave = "cedeno2003";

    const check = await pool.query(
      "SELECT * FROM usuarios WHERE cedula=$1",
      [cedula]
    );

    if (check.rows.length === 0) {
      const hash = await bcrypt.hash(clave, 10);
      await pool.query(
        "INSERT INTO usuarios (cedula,nombre,clave) VALUES ($1,$2,$3)",
        [cedula, nombre, hash]
      );
      console.log("✅ Admin creado");
    }
  } catch (error) {
    console.error("Error creando admin:", error);
  }
}

crearAdminPorDefecto();

// ==========================================
app.listen(3000, () =>
  console.log("🚀 Servidor corriendo en http://localhost:3000")
);
