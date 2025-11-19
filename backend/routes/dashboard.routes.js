import { Router } from 'express';
import pool from '../src/db.js';
// 1. IMPORTAR EL MIDDLEWARE
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// 2. APLICAR EL MIDDLEWARE A LA RUTA
// Ahora la petición pasa por: verifyToken -> verifyAdmin -> Tu código
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
    // ... (aquí va todo el código que ya tenías de las consultas Promise.all) ...
    try {
        const [totalEquiposData, reportesActivosData, equiposDañadosData] = await Promise.all([
            pool.query('SELECT COUNT(*) as total FROM Equipos'),
            pool.query("SELECT COUNT(*) as total FROM Reportes WHERE estado_reporte NOT IN ('resuelto', 'dado_de_baja')"),
            pool.query("SELECT COUNT(*) as total FROM Equipos WHERE estado != 'operativo'")
        ]);

        const stats = {
            total_equipos: totalEquiposData[0][0].total,
            reportes_activos: reportesActivosData[0][0].total,
            equipos_mantenimiento: equiposDañadosData[0][0].total
        };

        res.json(stats);
    } catch (error) {
        console.error("Error en dashboard stats:", error);
        res.status(500).json({ message: "Error al obtener estadísticas" });
    }
});

export default router;