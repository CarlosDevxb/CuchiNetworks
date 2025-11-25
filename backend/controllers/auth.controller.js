import pool from '../src/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // GENERAR TOKEN CON TIMER CORTO (1 Hora)
        const token = jwt.sign(
            { id: user.id, rol: user.rol, nombre: user.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.json({
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// LOGOUT (NUEVO)
export const logout = async (req, res) => {
    try {
        const tokenHeader = req.headers.authorization;
        if (!tokenHeader) return res.sendStatus(204); // Si no hay token, nada que hacer

        const token = tokenHeader.split(" ")[1] || tokenHeader;

        // Guardamos el token en la lista negra con 1 hora de validez (lo que dura el token)
        // Después de 1 hora, el token expira naturalmente, así que la DB se limpia sola (o la limpias tú con un CRON)
        await pool.query(
            'INSERT INTO TokenBlacklist (token, fecha_expiracion) VALUES (?, NOW() + INTERVAL 1 HOUR)', 
            [token]
        );

        res.json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al cerrar sesión" });
    }
};