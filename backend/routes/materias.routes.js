import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getMaterias, createMateria } from '../controllers/materias.controller.js';

const router = Router();
router.use(verifyToken, verifyRole(['admin'])); // Solo admin

router.get('/', getMaterias);
router.post('/', createMateria);

export default router;