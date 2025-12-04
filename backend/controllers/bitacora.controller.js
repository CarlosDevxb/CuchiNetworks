import pool from '../src/db.js'; // Ruta ajustada a tu estructura

// 1. REGISTRAR CLASE (Docente)
export const createRegistro = async (req, res) => {
    const { materia_id, tipo_clase, hora_entrada, hora_salida, tema_visto, observaciones, equipos_ids } = req.body;
    
    // Obtenemos el ID del usuario desde el token decodificado
    const usuario_id = req.user.id; 

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // A. Insertar en BitacoraUso
        // Nota: La FK usuario_id apunta a Usuarios.id, lo cual es correcto.
        const [resBitacora] = await connection.query(
            `INSERT INTO BitacoraUso (usuario_id, materia_id, tipo_clase, hora_entrada, hora_salida, tema_visto, observaciones) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, materia_id, tipo_clase, hora_entrada, hora_salida, tema_visto, observaciones]
        );

        const bitacoraId = resBitacora.insertId;

        // B. Insertar relación con Equipos (si es práctica)
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
        const [rows] = await pool.query(`
            SELECT 
                b.id, 
                b.fecha, 
                b.hora_entrada, 
                b.hora_salida, 
                b.tipo_clase, 
                b.tema_visto, 
                b.observaciones,
                
                -- Datos del Docente (Obtenidos de la tabla hija Docentes)
                d.nombre_completo as nombre_docente, 
                u.email as email_docente,
                
                -- Datos de la Materia
                m.nombre as nombre_materia, 
                m.carrera,
                
                -- Conteo rápido de equipos
                (SELECT COUNT(*) FROM BitacoraDispositivos bd WHERE bd.bitacora_id = b.id) as total_equipos

            FROM BitacoraUso b
            JOIN Usuarios u ON b.usuario_id = u.id
            JOIN Docentes d ON u.id = d.usuario_id  -- JOIN CRÍTICO: Une ID de usuario con ID de docente
            JOIN Materias m ON b.materia_id = m.id
            ORDER BY b.fecha DESC, b.hora_entrada DESC
        `);
        
        res.json(rows);
    } catch (error) {
        console.error("Error getBitacora:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. DETALLE DE UN REGISTRO ESPECÍFICO (ADMIN - Drill Down)
export const getBitacoraById = async (req, res) => {
    const { id } = req.params;
    try {
        // A. Datos Generales
        const [general] = await pool.query(`
            SELECT 
                b.*, 
                d.nombre_completo as nombre_docente, 
                u.email as email_docente,
                m.nombre as nombre_materia
            FROM BitacoraUso b
            JOIN Usuarios u ON b.usuario_id = u.id
            JOIN Docentes d ON u.id = d.usuario_id
            JOIN Materias m ON b.materia_id = m.id
            WHERE b.id = ?
        `, [id]);

        if (general.length === 0) {
            return res.status(404).json({ message: "Registro de bitácora no encontrado" });
        }

        // B. Equipos Usados (Detalle de hardware)
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

        // Respuesta combinada
        res.json({
            ...general[0],
            equipos_usados: equipos
        });

    } catch (error) {
        console.error("Error getBitacoraById:", error);
        res.status(500).json({ message: error.message });
    }
};