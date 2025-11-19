import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        // 1. Buscar el token en la cabecera (Header)
        const token = req.headers.authorization;

        // El token suele venir como: "Bearer eyJhbGciOi..."
        // Verificamos que exista
        if (!token) {
            return res.status(403).json({ message: "¡Alto ahí! No proporcionaste un token." });
        }

        // Limpiamos la palabra "Bearer " si viene incluida
        const tokenReal = token.split(" ")[1] || token;

        // 2. Verificar la firma del token con tu SEGRETO
        const decoded = jwt.verify(tokenReal, process.env.JWT_SECRET);

        // 3. Si es válido, guardamos los datos del usuario en la request
        // Esto nos servirá para saber QUIÉN está pidiendo los datos
        req.user = decoded;

        // 4. Dejar pasar a la siguiente función (el controlador)
        next();

    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

// Middleware extra para verificar roles (Ej. solo admins)
export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Administrador." });
    }
};