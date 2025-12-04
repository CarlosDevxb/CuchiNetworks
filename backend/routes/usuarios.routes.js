import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getAllUsuarios, createUsuario, toggleStatus, updateUsuario } from '../controllers/usuarios.controller.js';
import { body } from 'express-validator';
import { validateResult } from '../middleware/validator.middleware.js';

const router = Router();

// Todo este módulo es exclusivo de ADMIN
router.use(verifyToken, verifyRole(['admin']));

// Listar
router.get('/', getAllUsuarios);

// Crear (Con validaciones básicas)
router.post('/', 
    [
        body('nombre').notEmpty(),
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
        body('rol').isIn(['admin', 'docente', 'alumno'])
    ],
    validateResult,
    createUsuario
);

// Cambiar Estatus (Patch es ideal para cambios parciales)
router.patch('/:id/status', toggleStatus);

// Editar Info
router.put('/:id', updateUsuario);

export default router;