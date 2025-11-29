import pool from '../src/db.js';

// 1. LISTAR MATERIAS
export const getMaterias = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Materias ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. CREAR MATERIA
export const createMateria = async (req, res) => {
    const { nombre, carrera, semestre } = req.body;
    
    // Validación básica
    if (!nombre || !carrera) {
        return res.status(400).json({ message: "Nombre y Carrera son obligatorios" });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Materias (nombre, carrera, semestre) VALUES (?, ?, ?)',
            [nombre, carrera, semestre]
        );
        res.status(201).json({ id: result.insertId, message: "Materia creada correctamente" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Ya existe una materia con ese nombre." });
        }
        res.status(500).json({ message: error.message });
    }
};

// 3. ACTUALIZAR MATERIA
export const updateMateria = async (req, res) => {
    const { id } = req.params;
    const { nombre, carrera, semestre } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Materias SET nombre=?, carrera=?, semestre=? WHERE id=?',
            [nombre, carrera, semestre, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Materia no encontrada" });
        res.json({ message: "Materia actualizada" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Ya existe otra materia con ese nombre" });
        res.status(500).json({ message: error.message });
    }
};

// 4. ELIMINAR MATERIA (Validación actualizada para esquema v4.0)
export const deleteMateria = async (req, res) => {
    const { id } = req.params;
    try {
        // A. VERIFICAR SI ESTÁ EN HORARIO DE CLASES (Tabla Clases)
        // Antes revisábamos DocenteMaterias, ahora revisamos Clases
        const [clases] = await pool.query(
            'SELECT COUNT(*) as total FROM Clases WHERE materia_id = ?', 
            [id]
        );
        
        if (clases[0].total > 0) {
            return res.status(409).json({ 
                message: `No se puede eliminar: Hay ${clases[0].total} clase(s) programada(s) con esta materia.` 
            });
        }

        // B. VERIFICAR SI HAY BITÁCORAS (Historial)
        const [bitacoras] = await pool.query(
            'SELECT COUNT(*) as total FROM BitacoraUso WHERE materia_id = ?', 
            [id]
        );

        if (bitacoras[0].total > 0) {
            return res.status(409).json({ 
                message: `No se puede eliminar: Existen ${bitacoras[0].total} registros de clases pasadas con esta materia en el historial.` 
            });
        }

        // C. SI PASA LAS VALIDACIONES, BORRAMOS
        const [result] = await pool.query('DELETE FROM Materias WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: "Materia no encontrada" });
        
        res.json({ message: "Materia eliminada correctamente" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};