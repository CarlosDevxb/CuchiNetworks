import { Router } from 'express';
import { 
    getEquipos, 
    getEquipoById, 
    createEquipo, 
    updateEquipo, 
    deleteEquipo 
} from '../controllers/equipos.controller.js';

// Importamos seguridad (Solo admins pueden gestionar equipos)
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js'; // Importar

// Actualiza la línea del PUT:
const router = Router();

// Todas las rutas requieren Token y ser Admin
router.use(verifyToken, verifyAdmin);

router.put('/:id', upload.single('imagen'), updateEquipo);
router.get('/', getEquipos);
router.get('/:id', getEquipoById);
router.post('/', createEquipo);
router.put('/:id', updateEquipo);
router.delete('/:id', deleteEquipo);

export default router;