import { Router } from 'express';
import { 
    getEquipos, 
    getEquipoById, 
    createEquipo, 
    updateEquipo, 
    deleteEquipo 
} from '../controllers/equipos.controller.js';
import { upload } from '../middleware/upload.middleware.js';

// Importamos los middlewares de seguridad
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';

const router = Router();

// 1. APLICAR TOKEN A TODO (Nadie entra sin login)
router.use(verifyToken);

// 2. DEFINIR REGLAS POR RUTA

// LEER: Admin, Docente y Alumno pueden ver la lista (Ejemplo)
// O si prefieres que solo Admin vea todo: verifyRole(['admin'])
router.get('/', verifyRole(['admin', 'docente']), getEquipos);

// LEER DETALLE: Igual que arriba
router.get('/:id', verifyRole(['admin', 'docente']), getEquipoById);

// CREAR: SOLO ADMIN
router.post('/', 
    verifyRole(['admin']), 
    upload.single('imagen'), 
    createEquipo
);

// ACTUALIZAR: SOLO ADMIN
router.put('/:id', 
    verifyRole(['admin']), 
    upload.single('imagen'), 
    updateEquipo
);

// ELIMINAR: SOLO ADMIN
router.delete('/:id', verifyRole(['admin']), deleteEquipo);

export default router;