import pool from "../src/db.js";
import bcrypt from "bcryptjs";

// 1. OBTENER TODOS LOS USUARIOS (Tabla Unificada)
export const getAllUsuarios = async (req, res) => {
  try {
    // Hacemos LEFT JOIN con todas las tablas hijas para traer el nombre, sea cual sea el rol
    // En usuarios.controller.js -> getAllUsuarios
    const [rows] = await pool.query(`
    SELECT 
        u.id, u.email, u.rol, u.estatus, u.fecha_registro,
        -- Traemos los datos específicos de cada tabla para poder editarlos
        COALESCE(a.nombre_completo, d.nombre_completo, al.nombre_completo) as nombre,
        d.numero_empleado, d.titulo_academico,
        al.matricula, al.carrera, al.semestre,
        a.cargo
    FROM Usuarios u
    LEFT JOIN Administradores a ON u.id = a.usuario_id
    LEFT JOIN Docentes d ON u.id = d.usuario_id
    LEFT JOIN Alumnos al ON u.id = al.usuario_id
    ORDER BY u.fecha_registro DESC
`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. CREAR USUARIO (Cualquier Rol)
export const createUsuario = async (req, res) => {
  const { nombre, email, password, rol, extra } = req.body;
  // 'extra' es un objeto con datos específicos (matricula, cargo, numero_empleado, etc.)

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // A. Insertar en Padre
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [resUser] = await connection.query(
      'INSERT INTO Usuarios (email, password_hash, rol, estatus) VALUES (?, ?, ?, "activo")',
      [email, hash, rol]
    );
    const userId = resUser.insertId;

    // B. Insertar en Hija según Rol
    if (rol === "admin") {
      await connection.query(
        "INSERT INTO Administradores (usuario_id, nombre_completo, cargo) VALUES (?, ?, ?)",
        [userId, nombre, extra?.cargo || "Administrador"]
      );
    } else if (rol === "docente") {
      await connection.query(
        "INSERT INTO Docentes (usuario_id, nombre_completo, numero_empleado, titulo_academico) VALUES (?, ?, ?, ?)",
        [userId, nombre, extra?.numero_empleado, extra?.titulo_academico]
      );
    } else if (rol === "alumno") {
      await connection.query(
        "INSERT INTO Alumnos (usuario_id, nombre_completo, matricula, carrera, semestre) VALUES (?, ?, ?, ?, ?)",
        [userId, nombre, extra?.matricula, extra?.carrera, extra?.semestre]
      );
    }

    await connection.commit();
    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", id: userId });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ message: "El correo o matrícula ya existe." });
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// 3. ACTUALIZAR ESTATUS (Activar/Desactivar)
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body; // 'activo' o 'inactivo'

  try {
    await pool.query("UPDATE Usuarios SET estatus = ? WHERE id = ?", [
      estatus,
      id,
    ]);
    res.json({
      message: `Usuario ${
        estatus === "activo" ? "activado" : "desactivado"
      } correctamente.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. ACTUALIZAR INFO USUARIO
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol, extra } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Actualizar Padre
    await connection.query("UPDATE Usuarios SET email=? WHERE id=?", [
      email,
      id,
    ]);

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await connection.query("UPDATE Usuarios SET password_hash=? WHERE id=?", [
        hash,
        id,
      ]);
    }

    // 2. Actualizar Hija
    if (rol === "admin") {
      await connection.query(
        "UPDATE Administradores SET nombre_completo=?, cargo=? WHERE usuario_id=?",
        [nombre, extra?.cargo, id]
      );
    } else if (rol === "docente") {
      await connection.query(
        "UPDATE Docentes SET nombre_completo=?, numero_empleado=?, titulo_academico=? WHERE usuario_id=?",
        [nombre, extra?.numero_empleado, extra?.titulo_academico, id]
      );
    } else if (rol === "alumno") {
      await connection.query(
        "UPDATE Alumnos SET nombre_completo=?, matricula=?, carrera=?, semestre=? WHERE usuario_id=?",
        [nombre, extra?.matricula, extra?.carrera, extra?.semestre, id]
      );
    }

    await connection.commit();
    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};
