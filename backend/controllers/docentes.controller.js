import pool from '../src/db.js';
import bcrypt from 'bcryptjs';


export const registrarUso = async (req, res, next) => {
    const connection = await pool.getConnection(); // Usamos una conexión dedicada para transacción
    try {
        const usuario_id = req.user.id;
        const { materia_id, tema_visto, observaciones, equipos_ids, hora_inicio, hora_fin } = req.body;

        await connection.beginTransaction(); // Iniciar Transacción

        // 1. Insertar en BitacoraUso (Cabecera)
        const [result] = await connection.query(`
            INSERT INTO BitacoraUso 
            (usuario_id, materia_id, tema_visto, observaciones, hora_entrada, hora_salida, fecha)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [usuario_id, materia_id, tema_visto, observaciones || '', hora_inicio, hora_fin]);

        const bitacora_id = result.insertId;

        // 2. Insertar los equipos usados (si seleccionó alguno)
        if (equipos_ids && equipos_ids.length > 0) {
            // Preparamos los valores para una inserción masiva
            const valores = equipos_ids.map(eqId => [bitacora_id, eqId]);
            
            await connection.query(`
                INSERT INTO BitacoraDispositivos (bitacora_id, equipo_id)
                VALUES ?
            `, [valores]);
        }

        await connection.commit(); // Confirmar cambios

        res.json({ message: 'Clase registrada exitosamente', id: bitacora_id });

    } catch (error) {
        await connection.rollback(); // Si falla, deshacer todo
        next(error);
    } finally {
        connection.release(); // Liberar conexión
    }
};
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
export const getMisClases = async (req, res, next) => {
    try {
        // El ID del usuario viene del token (req.user.id)
        // Pero necesitamos el ID de la tabla 'Docentes', no 'Usuarios'
        // Hacemos un subquery o join para buscarlo
        const usuario_id = req.user.id;

        const [clases] = await pool.query(`
            SELECT 
                c.id, c.materia_id, c.grupo, c.dia_semana, c.hora_inicio, c.hora_fin,
                m.nombre as materia,
                m.carrera,
                m.semestre
            FROM Clases c
            INNER JOIN Docentes d ON c.docente_id = d.id
            INNER JOIN Materias m ON c.materia_id = m.id
            WHERE d.usuario_id = ? 
            ORDER BY FIELD(c.dia_semana, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'), c.hora_inicio
        `, [usuario_id]);

        res.json(clases);
    } catch (error) {
        next(error);
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
// GET /api/docentes/historial
export const getHistorial = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;

        const [rows] = await pool.query(`
            SELECT 
                b.id, b.fecha, b.tema_visto, b.observaciones, 
                b.hora_entrada, b.hora_salida,
                m.nombre as materia
                -- ❌ ELIMINAMOS 'm.grupo' PORQUE NO EXISTE EN LA TABLA MATERIAS
            FROM BitacoraUso b
            JOIN Materias m ON b.materia_id = m.id
            WHERE b.usuario_id = ?
            ORDER BY b.fecha DESC, b.hora_entrada DESC
        `, [usuario_id]);

        res.json(rows);
    } catch (error) {
        next(error);
    }
};