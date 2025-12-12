import { Router } from 'express';
import { verifyToken, verifyRole, isDocente } from '../middleware/auth.middleware.js';
import { getDocentes, saveDocente, getMisClases, registrarUso, getHistorial } from '../controllers/docentes.controller.js';
import { body } from 'express-validator';
import { validateResult } from '../middleware/validator.middleware.js';
import { createReporte, getMisReportesStats } from '../controllers/reportes.controller.js';
import { getMisNotificaciones, marcarLeida } from '../controllers/notificaciones.controller.js';

const router = Router();
router.use(verifyToken, verifyRole(['docente', 'admin']));

router.get('/', getDocentes);
router.get('/mis-clases', verifyToken, isDocente, getMisClases);

router.post('/registrar-uso', verifyToken, isDocente, registrarUso);
router.get('/historial', verifyToken, isDocente, getHistorial);

// Reportes
router.post('/', verifyToken, createReporte);
router.get('/stats', verifyToken, getMisReportesStats);

// Notificaciones
router.get('/notificaciones', verifyToken, getMisNotificaciones);
router.patch('/notificaciones/:id/leida', verifyToken, marcarLeida);
// Ruta única para Crear y Editar (Save)
router.post('/', 
    [
        body('nombre').notEmpty(),
        body('email').isEmail(),
        // Password es opcional si es edición
    ],
    validateResult,
    saveDocente
);

export default router;