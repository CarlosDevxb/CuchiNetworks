import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getBitacora, getBitacoraById, createRegistro } from '../controllers/bitacora.controller.js';

const router = Router();

// 1. Crear Registro (Solo Docente)
router.post('/', verifyToken, verifyRole(['docente']), createRegistro);

// 2. Ver Historial (Admin y Docente)
router.get('/', verifyToken, verifyRole(['admin', 'docente']), getBitacora);

// 3. Ver Detalle Específico (Admin y Docente)
router.get('/:id', verifyToken, verifyRole(['admin', 'docente']), getBitacoraById);

export default router;