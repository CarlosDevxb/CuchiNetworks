import { validationResult } from 'express-validator';

export const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Si hay errores, devolvemos 400 y la lista de fallos
        return res.status(400).json({ 
            message: "Datos inválidos", 
            errors: errors.array() 
        });
    }
    next();
};