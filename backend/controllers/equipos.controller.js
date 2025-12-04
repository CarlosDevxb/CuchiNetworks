import pool from '../src/db.js';

// 1. OBTENER TODOS LOS EQUIPOS (Vista principal)
export const getEquipos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.id, 
                e.nombre_equipo, 
                e.tipo, 
                e.estado, 
                e.modelo, 
                e.imagen_url,
                e.serial_number,
                e.posicion_fisica, -- Agregado
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

// 2. OBTENER UN SOLO EQUIPO (Detalle)
export const getEquipoById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.*,
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
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id, serial_number, posicion_fisica, detalles } = req.body;
    
    try {
        // Validar ubicación (puede venir como string 'undefined' del formData)
        const ubicacionFinal = (ubicacion_id && ubicacion_id !== 'undefined' && ubicacion_id !== 'null') ? ubicacion_id : null;
        
        // Manejo de Imagen
        let imagenUrl = null;
        if (req.file) {
            // Ajusta el protocolo/host según tu entorno (o usa path relativo si el front lo maneja)
            // Para desarrollo local con docker:
            imagenUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        }

        // Manejo del JSON de detalles
        let detallesFinal = detalles;
        try {
            if (typeof detalles === 'string') {
                JSON.parse(detalles); // Validar
            } else {
                detallesFinal = JSON.stringify(detalles);
            }
        } catch (e) {
            detallesFinal = null; 
        }

        const [result] = await pool.query(
            'INSERT INTO Equipos (nombre_equipo, tipo, modelo, estado, ubicacion_id, imagen_url, serial_number, posicion_fisica, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre_equipo, tipo, modelo, estado || 'operativo', ubicacionFinal, imagenUrl, serial_number, posicion_fisica, detallesFinal]
        );

        res.status(201).json({ message: "Equipo creado exitosamente", id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// 4. ACTUALIZAR EQUIPO
export const updateEquipo = async (req, res) => {
    const { id } = req.params;
    const { nombre_equipo, tipo, modelo, estado, ubicacion_id, serial_number, posicion_fisica, detalles } = req.body;
    
    try {
        const ubicacionFinal = (ubicacion_id && ubicacion_id !== 'undefined' && ubicacion_id !== 'null') ? ubicacion_id : null;

        let detallesFinal = detalles;
        try {
             if (typeof detalles === 'string') {
                 JSON.parse(detalles); 
             } else {
                 detallesFinal = JSON.stringify(detalles);
             }
        } catch (e) {
             if (!detalles) detallesFinal = null;
        }

        let query = 'UPDATE Equipos SET nombre_equipo=?, tipo=?, modelo=?, estado=?, ubicacion_id=?, serial_number=?, posicion_fisica=?, detalles=?';
        let params = [nombre_equipo, tipo, modelo, estado, ubicacionFinal, serial_number, posicion_fisica, detallesFinal];

        // Solo actualizamos la imagen si se subió una nueva
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
            // Retornamos la nueva URL para que el frontend actualice la vista sin recargar
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
        // Opcional: Validar si el equipo está en uso en alguna bitácora antes de borrar
        // const [uso] = await pool.query('SELECT COUNT(*) as c FROM BitacoraDispositivos WHERE equipo_id = ?', [req.params.id]);
        // if(uso[0].c > 0) return res.status(409).json({ message: "No se puede borrar: El equipo está registrado en bitácoras." });

        const [result] = await pool.query('DELETE FROM Equipos WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.sendStatus(204); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};