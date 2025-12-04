import { Router } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth.middleware.js';
import { getClases, createClase, deleteClase } from '../controllers/clases.controller.js';

const router = Router();

// 1. SEGURIDAD GLOBAL: Todo requiere Token
router.use(verifyToken);

// 2. RUTAS

// GET /api/clases
// Permite filtrar por ?docente_id=X o ?materia_id=Y
// Acceso: Admin (para gestionar) y Docente (para ver su horario)
router.get('/', verifyRole(['admin', 'docente']), getClases);

// POST /api/clases
// Asignar una nueva clase (Valida choques de horario automáticamente en el controlador)
// Acceso: SOLO ADMIN
router.post('/', verifyRole(['admin']), createClase);

// DELETE /api/clases/:id
// Eliminar una asignación
// Acceso: SOLO ADMIN
router.delete('/:id', verifyRole(['admin']), deleteClase);

export default router;