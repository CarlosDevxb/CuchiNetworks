import pool from '../src/db.js';

export const getMisNotificaciones = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;
        const [rows] = await pool.query(`
            SELECT * FROM Notificaciones 
            WHERE usuario_id = ? 
            ORDER BY fecha_creacion DESC 
            LIMIT 10
        `, [usuario_id]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

export const marcarLeida = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE Notificaciones SET leida = TRUE WHERE id = ?', [id]);
        res.json({ message: 'Notificación leída' });
    } catch (error) {
        next(error);
    }
};