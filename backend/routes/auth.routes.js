import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';

// Importamos controladores y middlewares
import { login, logout } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateResult } from '../middleware/validator.middleware.js';

const router = Router();

// --- SEGURIDAD NIVEL 3: RATE LIMIT ESTRICTO PARA LOGIN ---
// Solo 5 intentos cada 15 minutos. ¡Duro contra la fuerza bruta!
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100, 
	message: { message: "Demasiados intentos fallidos. Cuenta bloqueada temporalmente por 15 min." }
});

// RUTA LOGIN
router.post('/login', 
    loginLimiter, // 1. Freno de mano
    [
        // 2. Validaciones de datos
        body('email', 'Formato de email incorrecto')
            .trim()
            .isEmail()
            .normalizeEmail(),
        body('password', 'La contraseña es obligatoria y debe ser segura')
            .trim()
            .isLength({ min: 1 }) // En prod: min 6 u 8
            .escape(), // Sanitizar
    ],
    validateResult, // 3. Verificar si hubo errores
    login // 4. Controlador
);

// RUTA LOGOUT
router.post('/logout', verifyToken, logout);

export default router;