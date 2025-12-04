import pool from '../src/db.js';

// 1. OBTENER CLASES
export const getClases = async (req, res) => {
    const { docente_id, materia_id } = req.query; 
    
    try {
        let query = `
            SELECT 
                c.id, 
                c.grupo, 
                c.dia_semana, 
                c.hora_inicio, 
                c.hora_fin,
                m.nombre as materia_nombre, 
                m.carrera, 
                -- CORRECCIÓN: Obtenemos el nombre desde la tabla Docentes
                d.nombre_completo as docente_nombre,
                d.numero_empleado
            FROM Clases c
            JOIN Materias m ON c.materia_id = m.id
            -- JOIN CORRECTO: Unimos con Docentes, no solo con Usuarios
            JOIN Docentes d ON c.docente_id = d.usuario_id
        `;
        
        const params = [];
        const conditions = [];

        if (docente_id) {
            conditions.push('c.docente_id = ?');
            params.push(docente_id);
        }
        
        if (materia_id) {
            conditions.push('c.materia_id = ?');
            params.push(materia_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY FIELD(c.dia_semana, "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"), c.hora_inicio';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error getClases:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. CREAR CLASE (Con Validaciones de Choque)
export const createClase = async (req, res) => {
    const { docente_id, materia_id, grupo, dia_semana, hora_inicio, hora_fin } = req.body;

    if (hora_inicio >= hora_fin) {
        return res.status(400).json({ message: "La hora de fin debe ser posterior al inicio." });
    }

    try {
        // A. VALIDAR DISPONIBILIDAD DEL DOCENTE
        const [empalmeDocente] = await pool.query(`
            SELECT m.nombre as materia_cruzada 
            FROM Clases c
            JOIN Materias m ON c.materia_id = m.id
            WHERE c.docente_id = ? 
            AND c.dia_semana = ?
            AND (
                (c.hora_inicio < ? AND c.hora_fin > ?)
            )
        `, [docente_id, dia_semana, hora_fin, hora_inicio]);

        if (empalmeDocente.length > 0) {
            return res.status(409).json({ 
                message: `El docente ya imparte '${empalmeDocente[0].materia_cruzada}' en ese horario.` 
            });
        }

        // B. VALIDAR DISPONIBILIDAD DEL LABORATORIO (LS5)
        // AQUÍ ESTABA EL ERROR: Buscaba u.nombre, ahora busca d.nombre_completo
        const [empalmeLab] = await pool.query(`
            SELECT d.nombre_completo as docente_ocupando, m.nombre as materia_ocupando
            FROM Clases c
            JOIN Docentes d ON c.docente_id = d.usuario_id
            JOIN Materias m ON c.materia_id = m.id
            WHERE c.dia_semana = ?
            AND (
                (c.hora_inicio < ? AND c.hora_fin > ?)
            )
        `, [dia_semana, hora_fin, hora_inicio]);

        if (empalmeLab.length > 0) {
            return res.status(409).json({ 
                message: `El laboratorio está ocupado en ese horario por: ${empalmeLab[0].docente_ocupando} (${empalmeLab[0].materia_ocupando}).` 
            });
        }

        // C. INSERTAR
        const [result] = await pool.query(
            'INSERT INTO Clases (docente_id, materia_id, grupo, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?, ?)',
            [docente_id, materia_id, grupo, dia_semana, hora_inicio, hora_fin]
        );

        res.status(201).json({ message: "Clase programada exitosamente", id: result.insertId });

    } catch (error) {
        console.error("Error createClase:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. ELIMINAR CLASE
export const deleteClase = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Clases WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: "Clase no encontrada" });
        
        res.json({ message: "Horario liberado correctamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};