import { Router } from 'express';
import { body } from 'express-validator'; // Validadores
import { validateResult } from '../middleware/validator.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { login, logout } from '../controllers/auth.controller.js'; // Importar el controller

const router = Router();

// RUTA LOGIN (Con validaciones estrictas)
router.post('/login', 
    [
        // 1. Validar Email
        body('email', 'El formato del email es incorrecto')
            .trim()
            .isEmail()
            .normalizeEmail(),
        // 2. Validar Password (mínimo 6 caracteres para evitar ataques fuerza bruta triviales)
        body('password', 'La contraseña debe tener al menos 6 caracteres')
            .trim()
            .isLength({ min: 6 })
            .escape(), // Sanitizar caracteres HTML peligrosos
    ],
    validateResult, // Si falla lo de arriba, este middleware detiene todo
    login
);

// RUTA LOGOUT (Requiere estar logueado para salir)
router.post('/logout', verifyToken, logout);

export default router;