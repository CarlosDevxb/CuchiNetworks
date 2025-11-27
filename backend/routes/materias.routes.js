import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getMaterias, createMateria } from '../controllers/materias.controller.js';
import { updateMateria, deleteMateria } from '../controllers/materias.controller.js';


const router = Router();

// 1. Todos necesitan Token
router.use(verifyToken);

// LEER
router.get('/', verifyRole(['admin', 'docente']), getMaterias);

// CREAR (Solo Admin)
router.post('/', verifyRole(['admin']), createMateria);

// ACTUALIZAR (Solo Admin) - ¡NUEVO!
router.put('/:id', verifyRole(['admin']), updateMateria);

// ELIMINAR (Solo Admin) - ¡NUEVO!
router.delete('/:id', verifyRole(['admin']), deleteMateria);

export default router;