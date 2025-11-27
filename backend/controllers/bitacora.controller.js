import pool from '../src/db.js';

// 1. REGISTRAR CLASE (Docente)
export const createRegistro = async (req, res) => {
    const { materia_id, tipo_clase, hora_entrada, hora_salida, tema_visto, observaciones, equipos_ids } = req.body;
    
    // El ID viene del token (middleware verifyToken)
    const usuario_id = req.user.id; 

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // A. Insertar el registro principal en BitacoraUso
        const [resBitacora] = await connection.query(
            `INSERT INTO BitacoraUso (usuario_id, materia_id, tipo_clase, hora_entrada, hora_salida, tema_visto, observaciones) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, materia_id, tipo_clase, hora_entrada, hora_salida, tema_visto, observaciones]
        );

        const bitacoraId = resBitacora.insertId;

        // B. Si es práctica y seleccionaron equipos, insertar la relación en BitacoraDispositivos
        if (tipo_clase === 'practica' && equipos_ids && Array.isArray(equipos_ids) && equipos_ids.length > 0) {
            const values = equipos_ids.map(eqId => [bitacoraId, eqId]);
            await connection.query(
                'INSERT INTO BitacoraDispositivos (bitacora_id, equipo_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Clase registrada exitosamente", id: bitacoraId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error al crear bitácora:", error);
        res.status(500).json({ message: "Error al guardar el registro." });
    } finally {
        if (connection) connection.release();
    }
};

// 2. LISTADO GENERAL (ADMIN)
export const getBitacora = async (req, res) => {
    try {
        // CAMBIO CLAVE: Hacemos JOIN con 'Docentes' para sacar el nombre real
        // Si quisieras soportar que Admin también registre bitácora, usaríamos LEFT JOIN con ambas tablas
        const [rows] = await pool.query(`
            SELECT 
                b.id, 
                b.fecha, 
                b.hora_entrada, 
                b.hora_salida, 
                b.tipo_clase, 
                b.tema_visto, 
                b.observaciones,
                
                -- Datos del Docente (Desde la tabla hija)
                d.nombre_completo as nombre_docente, 
                u.email as email_docente,
                
                -- Datos de la Materia
                m.nombre as nombre_materia, 
                m.carrera,
                
                -- Conteo de equipos usados
                (SELECT COUNT(*) FROM BitacoraDispositivos bd WHERE bd.bitacora_id = b.id) as total_equipos

            FROM BitacoraUso b
            JOIN Usuarios u ON b.usuario_id = u.id
            JOIN Docentes d ON u.id = d.usuario_id  -- <--- AQUÍ ESTÁ EL CAMBIO IMPORTANTE
            JOIN Materias m ON b.materia_id = m.id
            ORDER BY b.fecha DESC, b.hora_entrada DESC
        `);
        
        res.json(rows);
    } catch (error) {
        console.error("Error getBitacora:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. DETALLE DE UN REGISTRO ESPECÍFICO (ADMIN)
export const getBitacoraById = async (req, res) => {
    const { id } = req.params;
    try {
        // A. Datos Generales (Header)
        const [general] = await pool.query(`
            SELECT 
                b.*, 
                d.nombre_completo as nombre_docente, -- <--- CAMBIO AQUÍ TAMBIÉN
                u.email as email_docente,
                m.nombre as nombre_materia
            FROM BitacoraUso b
            JOIN Usuarios u ON b.usuario_id = u.id
            JOIN Docentes d ON u.id = d.usuario_id -- JOIN con tabla hija
            JOIN Materias m ON b.materia_id = m.id
            WHERE b.id = ?
        `, [id]);

        if (general.length === 0) {
            return res.status(404).json({ message: "Registro de bitácora no encontrado" });
        }

        // B. Equipos Usados (Detalle)
        // Esto no cambia mucho, ya que la relación es con Equipos directos
        const [equipos] = await pool.query(`
            SELECT 
                e.id, 
                e.nombre_equipo, 
                e.tipo, 
                e.modelo, 
                e.estado, 
                e.imagen_url, 
                e.posicion_fisica, 
                ub.nombre as ubicacion
            FROM BitacoraDispositivos bd
            JOIN Equipos e ON bd.equipo_id = e.id
            LEFT JOIN Ubicaciones ub ON e.ubicacion_id = ub.id
            WHERE bd.bitacora_id = ?
        `, [id]);

        // Retornamos el objeto combinado
        res.json({
            ...general[0],
            equipos_usados: equipos
        });

    } catch (error) {
        console.error("Error getBitacoraById:", error);
        res.status(500).json({ message: error.message });
    }
};