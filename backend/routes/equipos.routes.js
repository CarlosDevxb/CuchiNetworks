import { Router } from 'express';
import { body } from 'express-validator';

// Controladores
import { 
    getEquipos, 
    getEquipoById, 
    createEquipo, 
    updateEquipo, 
    deleteEquipo 
} from '../controllers/equipos.controller.js';

// Middlewares
import { upload } from '../middleware/upload.middleware.js';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { validateResult } from '../middleware/validator.middleware.js';

const router = Router();

// 1. REGLAS DE VALIDACIÓN PARA EQUIPOS
const validacionesEquipo = [
    body('nombre_equipo')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre es muy largo')
        .trim()
        .escape(), // Convierte <script> en &lt;script&gt;
        
    body('serial_number')
        .optional({ checkFalsy: true }) // Si viene vacío, lo ignora
        .trim()
        .escape(),

    body('tipo')
        .isIn(['computadora', 'router', 'switch', 'servidor', 'impresora', 'monitor', 'otro'])
        .withMessage('Tipo de dispositivo inválido'),

    body('estado')
        .isIn(['operativo', 'falla', 'mantenimiento', 'inactivo'])
        .withMessage('Estado inválido'),
        
    // Validar que el JSON de detalles sea un string válido (si se envía)
    body('detalles')
        .optional()
        .custom((value) => {
            try {
                if (typeof value === 'string') JSON.parse(value);
                return true;
            } catch {
                throw new Error('El formato de detalles técnicos es inválido');
            }
        })
];

// 2. APLICAR MIDDLEWARE GLOBAL (TOKEN)
router.use(verifyToken);

// 3. RUTAS

// Leer (Admin y Docente)
router.get('/', verifyRole(['admin', 'docente']), getEquipos);
router.get('/:id', verifyRole(['admin', 'docente']), getEquipoById);

// Crear (Solo Admin)
// ORDEN IMPORTANTE: 
// 1. Roles -> 2. Multer (Procesa archivo y body) -> 3. Validaciones (Revisa el body) -> 4. Controlador
router.post('/', 
    verifyRole(['admin']), 
    upload.single('imagen'), 
    validacionesEquipo, 
    validateResult, 
    createEquipo
);

// Actualizar (Solo Admin)
router.put('/:id', 
    verifyRole(['admin']), 
    upload.single('imagen'), 
    validacionesEquipo, 
    validateResult, 
    updateEquipo
);

// Eliminar (Solo Admin)
router.delete('/:id', verifyRole(['admin']), deleteEquipo);

export default router;