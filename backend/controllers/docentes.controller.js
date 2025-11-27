import pool from '../src/db.js';
import bcrypt from 'bcryptjs';

// 1. OBTENER DOCENTES CON SUS MATERIAS (VERSIÓN SEGURA)
export const getDocentes = async (req, res) => {
    try {
        console.log("🔍 Buscando docentes...");

        const [rows] = await pool.query(`
            SELECT 
                u.id, u.nombre, u.email, u.horario_entrada, u.horario_salida,
                u.rol,
                COALESCE(
                    JSON_ARRAYAGG(
                        IF(m.id IS NOT NULL, JSON_OBJECT('id', m.id, 'nombre', m.nombre), NULL)
                    ), '[]'
                ) as materias_raw
            FROM Usuarios u
            LEFT JOIN DocenteMaterias dm ON u.id = dm.docente_id
            LEFT JOIN Materias m ON dm.materia_id = m.id
            WHERE u.rol = 'docente'
            GROUP BY u.id
        `);
        
        console.log(`✅ Se encontraron ${rows.length} docentes.`);

        // PROCESAMIENTO SEGURO DE DATOS
        const cleanRows = rows.map(row => {
            let materias = [];
            
            // Intento robusto de parsear el JSON
            try {
                if (typeof row.materias_raw === 'string') {
                    materias = JSON.parse(row.materias_raw);
                } else if (Array.isArray(row.materias_raw)) {
                    materias = row.materias_raw;
                }
            } catch (e) {
                console.error(`⚠️ Error parseando materias para usuario ${row.id}`, e);
                materias = [];
            }

            // Filtrar nulos (por el LEFT JOIN)
            const materiasLimpio = materias.filter(m => m !== null);

            return {
                id: row.id,
                nombre: row.nombre,
                email: row.email,
                horario_entrada: row.horario_entrada,
                horario_salida: row.horario_salida,
                materias_asignadas: materiasLimpio
            };
        });

        res.json(cleanRows);

    } catch (error) {
        console.error("❌ Error en getDocentes:", error);
        res.status(500).json({ message: error.message });
    }
};
// 2. CREAR O EDITAR DOCENTE (Upsert lógico)
export const saveDocente = async (req, res) => {
    const { id, nombre, email, password, horario_entrada, horario_salida, materias_ids } = req.body;
    if (horario_entrada && horario_salida) {
        if (horario_entrada >= horario_salida) {
            return res.status(400).json({ message: "La hora de salida debe ser posterior a la de entrada." });
        }
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Iniciar transacción para asegurar integridad

        let docenteId = id;

        // A. Si es nuevo (no trae ID), insertamos usuario
        if (!id) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            const [resUser] = await connection.query(
                'INSERT INTO Usuarios (nombre, email, password_hash, rol, horario_entrada, horario_salida) VALUES (?, ?, ?, "docente", ?, ?)',
                [nombre, email, hash, horario_entrada, horario_salida]
            );
            docenteId = resUser.insertId;
        } else {
            // B. Si es edición, actualizamos datos básicos
            await connection.query(
                'UPDATE Usuarios SET nombre=?, email=?, horario_entrada=?, horario_salida=? WHERE id=?',
                [nombre, email, horario_entrada, horario_salida, id]
            );
            // Si mandan password nueva, la actualizamos aparte
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                await connection.query('UPDATE Usuarios SET password_hash=? WHERE id=?', [hash, id]);
            }
        }

        // C. ACTUALIZAR MATERIAS (Borrar anteriores e insertar nuevas)
        // Solo si se envió el array de materias
        if (materias_ids && Array.isArray(materias_ids)) {
            // 1. Borrar relaciones viejas
            await connection.query('DELETE FROM DocenteMaterias WHERE docente_id = ?', [docenteId]);
            
            // 2. Insertar nuevas (si hay)
            if (materias_ids.length > 0) {
                const values = materias_ids.map(mId => [docenteId, mId]);
                await connection.query('INSERT INTO DocenteMaterias (docente_id, materia_id) VALUES ?', [values]);
            }
        }

        await connection.commit();
        res.json({ message: "Docente guardado correctamente" });

    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) connection.release();
    }
};