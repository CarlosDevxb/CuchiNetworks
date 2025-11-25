import { Router } from 'express';
import { body } from 'express-validator';
import { getUbicaciones, getUbicacionById, createUbicacion } from '../controllers/ubicaciones.controller.js';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { validateResult } from '../middleware/validator.middleware.js';

const router = Router();

// 1. VALIDACIONES PARA CREAR UBICACIÓN
const validacionesUbicacion = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre es muy largo')
        .trim()
        .escape(), // Sanitizar
    body('descripcion')
        .optional()
        .isLength({ max: 500 })
        .trim()
        .escape(),
    body('tipo_zona')
        .isIn(['isla', 'mesa_central', 'bodega', 'otro'])
        .withMessage('Tipo de zona inválido')
];

// 2. RUTAS

// Ver lista: Admin y Docente
router.get('/', verifyToken, verifyRole(['admin', 'docente']), getUbicaciones);

// Ver detalle (con equipos): Admin y Docente
router.get('/:id', verifyToken, verifyRole(['admin', 'docente']), getUbicacionById);

// Crear: SOLO ADMIN + Validaciones
router.post('/', 
    verifyToken, 
    verifyRole(['admin']), 
    validacionesUbicacion, 
    validateResult, 
    createUbicacion
);

export default router;