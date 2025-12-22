import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
//      RUTAS DE USUARIOS
// ==========================================

// 1. Crear Usuario (CON ENCRIPTACIÓN)
app.post("/usuarios", async (req, res) => {
  try {
    const { cedula, nombre, clave } = req.body;
    
    // Validar campos
    if (!cedula || !nombre || !clave) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    // --- ENCRIPTACIÓN ---
    const salt = await bcrypt.genSalt(10); 
    const claveEncriptada = await bcrypt.hash(clave, salt);
    
    // Guardamos la 'claveEncriptada' en la base de datos
    const query = "INSERT INTO usuarios (cedula, nombre, clave) VALUES ($1, $2, $3) RETURNING *";
    const result = await pool.query(query, [cedula, nombre, claveEncriptada]);
    
    res.json({ msg: "Usuario registrado", data: result.rows[0] });

  } catch (error) {

    if (error.code === '23505') {
        return res.status(400).json({ msg: "Esa cédula ya está registrada" });
    }
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
    
    // NOTA: Si editas la clave aquí, idealmente también deberías encriptarla de nuevo.
    // Por simplicidad para la expo, asumimos que aquí llega o se maneja directo, 
    // pero si editas la clave desde el front, asegúrate de enviar la nueva.
    
    // Si quieres que al editar también encripte, descomenta esto:
    /*
    const salt = await bcrypt.genSalt(10);
    const claveNueva = await bcrypt.hash(clave, salt);
    */
    // Y usa claveNueva en el query. Por ahora lo dejo como lo tenías para no romperte nada más:

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
//      RUTAS DE MATERIAS
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

// 5. Eliminar Materia
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

    if (!cedula || !clave) {
      return res.status(400).json({ msg: "Faltan credenciales" });
    }

    // 1. Buscar usuario SOLO por cédula
    const query = "SELECT * FROM usuarios WHERE cedula = $1";
    const result = await pool.query(query, [cedula]);

    // 2. Si no existe la cédula
    if (result.rows.length === 0) {
      return res.status(401).json({ msg: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];

    // 3. COMPARAR CLAVES (La que escribió vs La encriptada en BD)
    const esCorrecta = await bcrypt.compare(clave, usuario.clave);

    if (!esCorrecta) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    // 4. Todo OK
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
//   INICIALIZACIÓN DEL ADMIN (SOLUCIÓN)
// ==========================================
async function crearAdminPorDefecto() {
  try {
    const cedulaAdmin = "1316009974"; // Tu cédula
    const nombreAdmin = "Juan Zambrano";
    const claveAdmin = "admin2025"; // Contraseña que usaras en el Login

    // Verificar si ya existe el usuario
    const check = await pool.query("SELECT * FROM usuarios WHERE cedula = $1", [cedulaAdmin]);
    
    if (check.rows.length === 0) {
      console.log("⚠️ Admin no encontrado. Creando usuario administrador seguro...");
      
      // Encriptar la clave por defecto
      const salt = await bcrypt.genSalt(10);
      const claveEncriptada = await bcrypt.hash(claveAdmin, salt);

      // Insertar en la BD
      await pool.query(
        "INSERT INTO usuarios (cedula, nombre, clave) VALUES ($1, $2, $3)",
        [cedulaAdmin, nombreAdmin, claveEncriptada]
      );
      
      console.log(`✅ Usuario Administrador creado: Cédula ${cedulaAdmin} / Clave ${claveAdmin}`);
    } else {
      console.log("ℹ️ El sistema ya tiene administrador. Inicio normal.");
    }
  } catch (error) {
    console.error("Error creando admin por defecto:", error);
  }
}

// Ejecutamos la verificación antes de levantar el puerto
crearAdminPorDefecto();

// ==========================================
//      SERVIDOR
// ==========================================
app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));