import jwt from 'jsonwebtoken';
import pool from '../src/db.js';

// 1. VERIFICAR TOKEN Y BLACKLIST
export const verifyToken = async (req, res, next) => {
    try {
        const tokenHeader = req.headers.authorization;
        
        if (!tokenHeader) {
            return res.status(403).json({ message: "Acceso denegado. No se proporcionó token." });
        }

        // Limpiar el prefijo "Bearer " si existe
        const token = tokenHeader.split(" ")[1] || tokenHeader;

        // A. VERIFICAR SI ESTÁ EN LISTA NEGRA (Logout previo)
        const [rows] = await pool.query('SELECT id FROM TokenBlacklist WHERE token = ?', [token]);
        if (rows.length > 0) {
            return res.status(401).json({ message: "Sesión revocada. Por favor inicia sesión nuevamente." });
        }

        // B. VERIFICAR FIRMA Y EXPIRACIÓN
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Guardamos al usuario en la request para usarlo en el siguiente paso
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

// 2. VERIFICAR ROLES (Dinámico)
// Se usa así: verifyRole(['admin', 'docente'])
export const verifyRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({ message: "Error de seguridad: Usuario no procesado." });
        }

        if (rolesPermitidos.includes(req.user.rol)) {
            next(); // El usuario tiene uno de los roles permitidos
        } else {
            return res.status(403).json({ 
                message: `Acceso prohibido. Se requiere rol: ${rolesPermitidos.join(' o ')}` 
            });
        }
    };
};

// Middleware legacy (por si lo usabas en otro lado, opcional)
export const verifyAdmin = verifyRole(['admin']);