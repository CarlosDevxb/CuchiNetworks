import pool from '../src/db.js';
import bcrypt from 'bcryptjs';

// 1. OBTENER DOCENTES (JOIN Usuarios + Docentes + Clases)
export const getDocentes = async (req, res) => {
    try {
        // Query Actualizado: JOIN con tabla Docentes
        const [rows] = await pool.query(`
            SELECT 
                u.id, 
                d.nombre_completo as nombre, -- Alias para compatibilidad con frontend
                u.email, 
                d.numero_empleado,
                d.titulo_academico,
                -- Subquery para traer clases (JSON)
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', c.id,
                            'materia_id', m.id,
                            'materia_nombre', m.nombre,
                            'grupo', c.grupo,
                            'dia', c.dia_semana,
                            'inicio', c.hora_inicio,
                            'fin', c.hora_fin
                        )
                    )
                    FROM Clases c
                    JOIN Materias m ON c.materia_id = m.id
                    WHERE c.docente_id = u.id
                ) as clases_asignadas
            FROM Usuarios u
            JOIN Docentes d ON u.id = d.usuario_id
            WHERE u.rol = 'docente'
        `);
        
        // Limpieza de JSON
        const cleanRows = rows.map(row => ({
            ...row,
            clases_asignadas: row.clases_asignadas || [] // Asegurar array vacío si es null
        }));

        res.json(cleanRows);
    } catch (error) {
        console.error("Error getDocentes:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. GUARDAR DOCENTE (INSERTAR EN 2 TABLAS)
export const saveDocente = async (req, res) => {
    // Nota: 'nombre' viene del frontend, lo mapearemos a 'nombre_completo'
    const { id, nombre, email, password } = req.body;
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let docenteId = id;

        // A. CREAR NUEVO
        if (!id) {
            // 1. Insertar en Usuarios (Padre)
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            
            const [resUser] = await connection.query(
                'INSERT INTO Usuarios (email, password_hash, rol) VALUES (?, ?, "docente")',
                [email, hash]
            );
            docenteId = resUser.insertId;

            // 2. Insertar en Docentes (Hija)
            await connection.query(
                'INSERT INTO Docentes (usuario_id, nombre_completo) VALUES (?, ?)',
                [docenteId, nombre]
            );

        } else {
            // B. ACTUALIZAR EXISTENTE
            // 1. Actualizar email en Padre
            await connection.query('UPDATE Usuarios SET email=? WHERE id=?', [email, id]);
            
            // 2. Actualizar password si viene
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                await connection.query('UPDATE Usuarios SET password_hash=? WHERE id=?', [hash, id]);
            }

            // 3. Actualizar nombre en Hija
            await connection.query('UPDATE Docentes SET nombre_completo=? WHERE usuario_id=?', [nombre, id]);
        }

        // NOTA: La asignación de CLASES se maneja en clases.controller.js ahora, 
        // así que quitamos la lógica vieja de DocenteMaterias aquí para simplificar.

        await connection.commit();
        res.json({ message: "Docente guardado correctamente", id: docenteId });

    } catch (error) {
        if (connection) await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "El correo ya está registrado." });
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) connection.release();
    }
};