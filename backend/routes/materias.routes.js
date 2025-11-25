import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getMaterias, createMateria } from '../controllers/materias.controller.js';

const router = Router();

// 1. Todos necesitan Token
router.use(verifyToken);

// 2. LEER: Admin y Docente pueden ver la lista
router.get('/', verifyRole(['admin', 'docente']), getMaterias);

// 3. CREAR: Solo Admin puede crear nuevas materias
router.post('/', verifyRole(['admin']), createMateria);

export default router;