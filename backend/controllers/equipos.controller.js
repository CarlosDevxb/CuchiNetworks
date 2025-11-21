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
    // Agregamos 'detalles' a la desestructuración
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id, serial_number, detalles } = req.body;
    
    try {
        const ubicacionFinal = (ubicacion_id && ubicacion_id !== 'undefined') ? ubicacion_id : null;
        let imagenUrl = null;
        if (req.file) {
            imagenUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        }

        // NOTA: Si 'detalles' viene como string desde el FormData, hay que parsearlo, 
        // pero MySQL lo espera como string JSON o objeto válido.
        // Al usar FormData en el front, los objetos complejos viajan como strings, así que haremos esto:
        let detallesFinal = detalles;
        try {
             // Si viene como string JSON, verificamos que sea válido
            if (typeof detalles === 'string') {
                JSON.parse(detalles); // Solo para validar, si falla va al catch
            } else {
                // Si es objeto JS, lo pasamos a string para MySQL
                detallesFinal = JSON.stringify(detalles);
            }
        } catch (e) {
            detallesFinal = null; // Si no es válido, guardamos null
        }

        const [result] = await pool.query(
            'INSERT INTO Equipos (nombre_equipo, tipo, modelo, estado, ubicacion_id, imagen_url, serial_number, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre_equipo, tipo, modelo, estado || 'operativo', ubicacionFinal, imagenUrl, serial_number, detallesFinal]
        );

        res.status(201).json({ message: "Equipo creado exitosamente", id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};export const updateEquipo = async (req, res) => {
    const { id } = req.params;
    // Agregamos 'detalles' a la lista de cosas que recibimos
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id, serial_number, detalles } = req.body;
    
    try {
        // 1. Validar Ubicación
        const ubicacionFinal = (ubicacion_id && ubicacion_id !== 'undefined' && ubicacion_id !== 'null') ? ubicacion_id : null;

        // 2. Procesar el JSON de Detalles
        // Al venir por FormData, 'detalles' llega como string. Hay que asegurarnos de enviarlo bien a MySQL.
        let detallesFinal = detalles;
        try {
             if (typeof detalles === 'string') {
                 // Validamos que sea un JSON real
                 JSON.parse(detalles); 
             } else {
                 // Si ya es objeto, lo volvemos string
                 detallesFinal = JSON.stringify(detalles);
             }
        } catch (e) {
             // Si falla o viene vacío, guardamos lo que había antes o null
             // Nota: Idealmente deberíamos consultar el anterior, pero por ahora si es inválido lo dejamos pasar como null o string raw
             if (!detalles) detallesFinal = null;
        }

        let query = 'UPDATE Equipos SET nombre_equipo=?, tipo=?, modelo=?, estado=?, ubicacion_id=?, serial_number=?, detalles=?';
        let params = [nombre_equipo, tipo, modelo, estado, ubicacionFinal, serial_number, detallesFinal];

        // 3. Manejar Imagen Nueva
        if (req.file) {
            const imagenUrl = `http://localhost:3000/uploads/${req.file.filename}`;
            query += ', imagen_url=?';
            params.push(imagenUrl);
        }

        query += ' WHERE id=?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });

        res.json({ 
            message: 'Equipo actualizado correctamente', 
            imagen_url: req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null 
        });

    } catch (error) {
        console.error("❌ Error updateEquipo:", error);
        res.status(500).json({ message: "Error al actualizar: " + error.message });
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