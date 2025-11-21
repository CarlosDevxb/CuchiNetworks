import { Router } from 'express';
import { getUbicaciones } from '../controllers/ubicaciones.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Solo usuarios logueados pueden ver ubicaciones
router.get('/', verifyToken, getUbicaciones);

export default router;
