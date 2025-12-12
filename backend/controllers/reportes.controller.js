import pool from '../src/db.js';

// Crear un reporte
export const createReporte = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        // equipo_id y ubicacion_id son opcionales (puede reportar algo general)
        const { equipo_id, ubicacion_id, descripcion_problema } = req.body;

        const [result] = await pool.query(`
            INSERT INTO Reportes (usuario_id, equipo_id, ubicacion_id, descripcion_problema)
            VALUES (?, ?, ?, ?)
        `, [usuario_id, equipo_id || null, ubicacion_id || null, descripcion_problema]);

        // Opcional: Crear notificación para los Admins (futuro)
        
        res.status(201).json({ message: 'Reporte enviado', id: result.insertId });
    } catch (error) {
        next(error);
    }
};

// Obtener estadísticas y lista (para el Dashboard del Profe)
export const getMisReportesStats = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        
        const [rows] = await pool.query(`
            SELECT estado_reporte, COUNT(*) as total 
            FROM Reportes 
            WHERE usuario_id = ? 
            GROUP BY estado_reporte
        `, [usuario_id]);

        // Formateamos para fácil uso en frontend { nuevo: 2, resuelto: 5 }
        const stats = rows.reduce((acc, curr) => {
            acc[curr.estado_reporte] = curr.total;
            return acc;
        }, {});

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
// GET /api/reportes
export const getMisReportes = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        
        const [rows] = await pool.query(`
            SELECT 
                r.id, 
                r.descripcion_problema, 
                r.estado_reporte,
                
                -- 👇 AQUÍ ESTABAN LOS ERRORES, LOS CORREGIMOS CON ALIAS:
                r.fecha_creacion AS fecha_reporte, 
                r.notas_admin AS solucion_tecnica,
                
                e.nombre_equipo, 
                e.modelo
            FROM Reportes r
            LEFT JOIN Equipos e ON r.equipo_id = e.id
            WHERE r.usuario_id = ?
            ORDER BY r.fecha_creacion DESC
        `, [usuario_id]);

        res.json(rows);
    } catch (error) {
        next(error);
    }
};