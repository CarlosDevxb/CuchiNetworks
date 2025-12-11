export const errorHandler = (err, req, res, next) => {
    // 1. Loguear el error en la terminal (para ti, el desarrollador)
    console.error(`❌ [Error Global]:`, err);

    // 2. Determinar el código de estado (si no existe, usar 500)
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    // 3. Manejo especial de errores comunes (opcional)
    // Ejemplo: Duplicado en base de datos (Unique constraint)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'El registro ya existe (dato duplicado).'
        });
    }

    // 4. Responder al Frontend
    res.status(statusCode).json({
        success: false,
        message: message,
        // En desarrollo mostramos el stack para debug, en producción lo ocultamos
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};