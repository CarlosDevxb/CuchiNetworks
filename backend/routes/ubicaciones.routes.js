import { Router } from 'express';
import { body } from 'express-validator';
import { getUbicaciones, getUbicacionById, createUbicacion } from '../controllers/ubicaciones.controller.js';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { validateResult } from '../middleware/validator.middleware.js';

const router = Router();

const validacionesUbicacion = [
    body('nombre').notEmpty().trim().escape(),
    body('tipo_zona').isIn(['isla', 'mesa_central', 'bodega', 'otro'])
];

// 1. Todos con Token
router.use(verifyToken);

// 2. LEER: Admin y Docente (Para llenar los dropdowns)
router.get('/', verifyRole(['admin', 'docente']), getUbicaciones);
router.get('/:id', verifyRole(['admin', 'docente']), getUbicacionById);

// 3. CREAR: Solo Admin
router.post('/', 
    verifyRole(['admin']), 
    validacionesUbicacion, 
    validateResult, 
    createUbicacion
);

export default router;