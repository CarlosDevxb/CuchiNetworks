import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getDocentes, saveDocente } from '../controllers/docentes.controller.js';
import { body } from 'express-validator';
import { validateResult } from '../middleware/validator.middleware.js';

const router = Router();
router.use(verifyToken, verifyRole(['admin']));

router.get('/', getDocentes);

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