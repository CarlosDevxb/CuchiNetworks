import pool from '../src/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar credenciales base
        const [users] = await pool.query('SELECT id, email, password_hash, rol FROM Usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 3. OBTENER DATOS DE PERFIL (Nombre) SEGÚN ROL
        let nombreUsuario = 'Usuario';
        let datosExtra = {};

        if (user.rol === 'admin') {
            const [admins] = await pool.query('SELECT nombre_completo FROM Administradores WHERE usuario_id = ?', [user.id]);
            if (admins.length > 0) nombreUsuario = admins[0].nombre_completo;
        } 
        else if (user.rol === 'docente') {
            const [docentes] = await pool.query('SELECT nombre_completo FROM Docentes WHERE usuario_id = ?', [user.id]);
            if (docentes.length > 0) nombreUsuario = docentes[0].nombre_completo;
        } 
        else if (user.rol === 'alumno') {
            const [alumnos] = await pool.query('SELECT nombre_completo, matricula FROM Alumnos WHERE usuario_id = ?', [user.id]);
            if (alumnos.length > 0) {
                nombreUsuario = alumnos[0].nombre_completo;
                datosExtra.matricula = alumnos[0].matricula;
            }
        }

        // 4. Generar Token
        const token = jwt.sign(
            { 
                id: user.id, 
                rol: user.rol, 
                nombre: nombreUsuario,
                ...datosExtra 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.json({
            token,
            user: { 
                id: user.id, 
                nombre: nombreUsuario, 
                email: user.email, 
                rol: user.rol 
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// LOGOUT (Sigue igual, no depende de nombres)
export const logout = async (req, res) => {
    try {
        const tokenHeader = req.headers.authorization;
        if (!tokenHeader) return res.sendStatus(204);
        const token = tokenHeader.split(" ")[1] || tokenHeader;
        await pool.query('INSERT INTO TokenBlacklist (token, fecha_expiracion) VALUES (?, NOW() + INTERVAL 1 HOUR)', [token]);
        res.json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al cerrar sesión" });
    }
};