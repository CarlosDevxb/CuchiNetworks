import pool from '../src/db.js';

// OBTENER HISTORIAL COMPLETO (Para Admin)
export const getBitacora = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                b.id,
                b.fecha,
                b.hora_entrada,
                b.hora_salida,
                b.tema_visto,
                b.observaciones,
                u.nombre as nombre_docente,
                u.email as email_docente,
                m.nombre as nombre_materia,
                m.carrera
            FROM BitacoraUso b
            JOIN Usuarios u ON b.usuario_id = u.id
            JOIN Materias m ON b.materia_id = m.id
            ORDER BY b.fecha DESC, b.hora_entrada DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// (Opcional) Endpoint para registrar uso MANUALMENTE desde admin (si fuera necesario)
// Por ahora nos enfocamos en leer.