import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createReporte, getMisReportes, getMisReportesStats } from '../controllers/reportes.controller.js';
import { getMisNotificaciones, marcarLeida } from '../controllers/notificaciones.controller.js';

const router = Router();

// --- REPORTES (INCIDENCIAS) ---

// POST /api/reportes -> Crear un nuevo reporte
router.post('/', verifyToken, createReporte);

// GET /api/reportes/stats -> Obtener conteo (Activos vs Resueltos)
router.get('/stats', verifyToken, getMisReportesStats);


// --- NOTIFICACIONES ---

// GET /api/reportes/notificaciones -> Listar notificaciones del usuario
router.get('/notificaciones', verifyToken, getMisNotificaciones);

// PATCH /api/reportes/notificaciones/:id/leida -> Marcar como leída
router.patch('/notificaciones/:id/leida', verifyToken, marcarLeida);
router.get('/', verifyToken, getMisReportes);
export default router;