import pool from '../src/db.js';

// 1. OBTENER TODOS LOS EQUIPOS (Con nombre de ubicación)
export const getEquipos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.id, 
                e.nombre_equipo, 
                e.tipo, 
                e.estado, 
                e.modelo, 
                u.nombre as ubicacion 
            FROM Equipos e
            LEFT JOIN Ubicaciones u ON e.ubicacion_id = u.id
            ORDER BY e.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. OBTENER UN SOLO EQUIPO
export const getEquipoById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Equipos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. CREAR NUEVO EQUIPO
export const createEquipo = async (req, res) => {
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Equipos (nombre_equipo, tipo, modelo, estado, ubicacion_id) VALUES (?, ?, ?, ?, ?)',
            [nombre_equipo, tipo, modelo, estado || 'operativo', ubicacion_id]
        );
        res.json({ 
            id: result.insertId, 
            nombre_equipo, 
            tipo, 
            modelo, 
            estado, 
            ubicacion_id 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. ACTUALIZAR EQUIPO
export const updateEquipo = async (req, res) => {
    const { id } = req.params;
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Equipos SET nombre_equipo = ?, tipo = ?, modelo = ?, estado = ?, ubicacion_id = ? WHERE id = ?',
            [nombre_equipo, tipo, modelo, estado, ubicacion_id, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });

        res.json({ message: 'Equipo actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. ELIMINAR EQUIPO
export const deleteEquipo = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Equipos WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.sendStatus(204); // 204 = No Content (Borrado exitoso)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};