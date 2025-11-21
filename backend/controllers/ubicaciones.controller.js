import pool from '../src/db.js';

export const getUbicaciones = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Ubicaciones ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};