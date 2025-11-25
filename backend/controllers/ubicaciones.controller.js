import pool from '../src/db.js';

// 1. LISTAR TODAS (Ya lo tenías, lo dejamos igual o mejoramos)
export const getUbicaciones = async (req, res) => {
    try {
        // Query mejorado: Cuenta cuántos equipos hay en cada ubicación
        const [rows] = await pool.query(`
            SELECT u.*, COUNT(e.id) as total_equipos 
            FROM Ubicaciones u
            LEFT JOIN Equipos e ON u.id = e.ubicacion_id
            GROUP BY u.id
            ORDER BY u.nombre ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. OBTENER UNA UBICACIÓN CON SUS EQUIPOS (El "Drill-down")
export const getUbicacionById = async (req, res) => {
    const { id } = req.params;
    try {
        // A. Datos de la ubicación
        const [ubicacionRows] = await pool.query('SELECT * FROM Ubicaciones WHERE id = ?', [id]);
        
        if (ubicacionRows.length === 0) {
            return res.status(404).json({ message: 'Ubicación no encontrada' });
        }

        // B. Equipos en esa ubicación (Reutilizamos campos clave para las tarjetas)
        const [equiposRows] = await pool.query(`
            SELECT id, nombre_equipo, modelo, tipo, estado, imagen_url, serial_number, posicion_fisica
            FROM Equipos 
            WHERE ubicacion_id = ?
            ORDER BY nombre_equipo ASC
        `, [id]);

        // Respondemos con un objeto combinado
        res.json({
            ...ubicacionRows[0], // Datos de la isla
            equipos: equiposRows // Array de dispositivos
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. CREAR UBICACIÓN
export const createUbicacion = async (req, res) => {
    const { nombre, descripcion, tipo_zona } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Ubicaciones (nombre, descripcion, tipo_zona) VALUES (?, ?, ?)',
            [nombre, descripcion, tipo_zona]
        );
        res.status(201).json({ 
            id: result.insertId, 
            message: "Ubicación creada correctamente" 
        });
    } catch (error) {
        // Manejo de error si el nombre ya existe (UNIQUE en BD)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Ya existe una ubicación con ese nombre" });
        }
        res.status(500).json({ message: error.message });
    }
};