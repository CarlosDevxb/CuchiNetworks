import jwt from 'jsonwebtoken';
import pool from '../src/db.js'; // Asegúrate que la ruta a db.js sea correcta

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
        // Asegúrate que JWT_SECRET esté en tu .env o config.js
        const secret = process.env.JWT_SECRET || 'secreto_temporal_inseguro'; 
        const decoded = jwt.verify(token, secret);
        
        // Guardamos al usuario en la request
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

// 2. VERIFICAR ROLES (Dinámico y Flexible)
export const verifyRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({ message: "Error de seguridad: Usuario no procesado." });
        }

        // --- CORRECCIÓN AQUÍ: Normalizamos a minúsculas ---
        // Esto hace que "Docente", "docente" y "DOCENTE" sean lo mismo.
        const rolUsuario = req.user.rol ? req.user.rol.toLowerCase() : '';
        const rolesPermitidosLower = rolesPermitidos.map(r => r.toLowerCase());

        if (rolesPermitidosLower.includes(rolUsuario)) {
            next(); // ✅ Pase adelante
        } else {
            console.log(`⛔ Acceso denegado. Usuario: ${rolUsuario}, Requerido: ${rolesPermitidosLower}`);
            return res.status(403).json({ 
                message: `Acceso prohibido. Se requiere rol: ${rolesPermitidos.join(' o ')}` 
            });
        }
    };
};

// 👇 3. EXPORTS DEFINIDOS (Esto es lo que faltaba o estaba fallando)
export const isDocente = verifyRole(['docente']);
export const isAlumno = verifyRole(['alumno']);
export const isAdmin = verifyRole(['admin']);
export const verifyAdmin = verifyRole(['admin']);