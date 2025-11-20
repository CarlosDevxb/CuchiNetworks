import pool from '../src/db.js';


// 1. OBTENER TODOS LOS EQUIPOS (Para tarjetas: vista principal)
export const getEquipos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.id, 
                e.nombre_equipo, 
                e.tipo, 
                e.estado, 
                e.modelo, 
                e.imagen_url,       -- ¡NUEVO!
                e.serial_number,    -- ¡NUEVO!
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

// 2. OBTENER UN SOLO EQUIPO (Para detalle técnico)
export const getEquipoById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.*,                 -- Seleccionar todo de la tabla equipos
                u.nombre as ubicacion_nombre,
                u.descripcion as ubicacion_descripcion
            FROM Equipos e
            LEFT JOIN Ubicaciones u ON e.ubicacion_id = u.id
            WHERE e.id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// 3. CREAR NUEVO EQUIPO
export const createEquipo = async (req, res) => {
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id, serial_number } = req.body;
    
    try {
        // Validar ubicacion_id
        const ubicacionFinal = (ubicacion_id && ubicacion_id !== 'undefined') ? ubicacion_id : null;

        // Preparar URL de imagen
        let imagenUrl = null;
        if (req.file) {
            imagenUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        }

        const [result] = await pool.query(
            'INSERT INTO Equipos (nombre_equipo, tipo, modelo, estado, ubicacion_id, imagen_url, serial_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre_equipo, tipo, modelo, estado || 'operativo', ubicacionFinal, imagenUrl, serial_number]
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: "Equipo creado exitosamente",
            imagen_url: imagenUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
// 4. ACTUALIZAR EQUIPO
export const updateEquipo = async (req, res) => {
    const { id } = req.params;
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id, serial_number } = req.body;
    
    try {
        let query = 'UPDATE Equipos SET nombre_equipo=?, tipo=?, modelo=?, estado=?, ubicacion_id=?, serial_number=?';
        let params = [nombre_equipo, tipo, modelo, estado, ubicacion_id, serial_number];

        // SI LLEGÓ UNA IMAGEN NUEVA, actualizamos también la URL
        if (req.file) {
            // Construimos la URL completa para guardarla en la BD
            const imagenUrl = `http://localhost:3000/uploads/${req.file.filename}`;
            query += ', imagen_url=?';
            params.push(imagenUrl);
        }

        query += ' WHERE id=?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });

        // Devolvemos la nueva imagen para actualizar el frontend
        res.json({ 
            message: 'Equipo actualizado', 
            imagen_url: req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null 
        });
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