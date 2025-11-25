import pool from '../src/db.js';

export const getMaterias = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Materias ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createMateria = async (req, res) => {
    const { nombre, carrera, semestre } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Materias (nombre, carrera, semestre) VALUES (?, ?, ?)',
            [nombre, carrera, semestre]
        );
        res.status(201).json({ id: result.insertId, message: "Materia creada" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};