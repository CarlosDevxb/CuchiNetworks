import pool from '../src/db.js';
import bcrypt from 'bcryptjs';

// 1. OBTENER DOCENTES (JOIN Usuarios + Docentes + Clases)
export const getDocentes = async (req, res) => {
    try {
        // Query con JOIN a la tabla hija 'Docentes' y subquery para clases
        const [rows] = await pool.query(`
            SELECT 
                u.id, 
                d.nombre_completo as nombre, -- Mapeamos al nombre que espera el frontend
                u.email, 
                d.numero_empleado,
                d.titulo_academico,
                
                -- Agregamos las clases asignadas en formato JSON
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
            GROUP BY u.id, d.nombre_completo, u.email, d.numero_empleado, d.titulo_academico
        `);
        
        // PROCESAMIENTO ROBUSTO DE JSON
        const cleanRows = rows.map(row => {
            let clases = [];
            try {
                // A veces MySQL devuelve string, a veces objeto. Esto lo normaliza.
                if (typeof row.clases_asignadas === 'string') {
                    clases = JSON.parse(row.clases_asignadas);
                } else if (Array.isArray(row.clases_asignadas)) {
                    clases = row.clases_asignadas;
                }
            } catch (e) {
                console.error(`Error parseando clases para docente ${row.id}`, e);
            }

            return {
                ...row,
                clases_asignadas: clases || [] // Aseguramos que nunca sea null
            };
        });

        res.json(cleanRows);

    } catch (error) {
        console.error("Error getDocentes:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. GUARDAR DOCENTE (Transacción en 2 tablas)
export const saveDocente = async (req, res) => {
    // Recibimos 'nombre', que guardaremos como 'nombre_completo' en la tabla hija
    const { id, nombre, email, password } = req.body;
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let docenteId = id;

        // A. CREAR NUEVO
        if (!id) {
            // 1. Insertar credenciales en tabla PADRE (Usuarios)
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            
            const [resUser] = await connection.query(
                'INSERT INTO Usuarios (email, password_hash, rol) VALUES (?, ?, "docente")',
                [email, hash]
            );
            docenteId = resUser.insertId;

            // 2. Insertar perfil en tabla HIJA (Docentes)
            // Aquí puedes agregar numero_empleado si lo envías desde el front en el futuro
            await connection.query(
                'INSERT INTO Docentes (usuario_id, nombre_completo) VALUES (?, ?)',
                [docenteId, nombre]
            );

        } else {
            // B. ACTUALIZAR EXISTENTE
            // 1. Actualizar email en Padre
            await connection.query('UPDATE Usuarios SET email=? WHERE id=?', [email, id]);
            
            // 2. Actualizar password solo si se envió
            if (password && password.trim() !== '') {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                await connection.query('UPDATE Usuarios SET password_hash=? WHERE id=?', [hash, id]);
            }

            // 3. Actualizar nombre en Hija
            await connection.query('UPDATE Docentes SET nombre_completo=? WHERE usuario_id=?', [nombre, id]);
        }

        // Confirmar transacción
        await connection.commit();
        res.json({ message: "Docente guardado correctamente", id: docenteId });

    } catch (error) {
        // Si algo falla, revertimos TODO (nada se guarda a medias)
        if (connection) await connection.rollback();
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "El correo electrónico ya está registrado." });
        }
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) connection.release();
    }
};