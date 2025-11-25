import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getBitacora } from '../controllers/bitacora.controller.js';

const router = Router();

// Solo Admins y Docentes pueden ver el historial completo (o filtraremos después)
router.get('/', verifyToken, verifyRole(['admin']), getBitacora);

export default router;