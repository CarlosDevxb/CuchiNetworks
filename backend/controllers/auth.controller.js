import pool from '../src/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// LOGIN
export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar credenciales y ESTATUS
        const [users] = await pool.query('SELECT id, email, password_hash, rol, estatus FROM Usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            const error = new Error('Credenciales invalidas' );
            error.statusCode = 401;
            throw error;
        }

        const user = users[0];

        // --- NUEVA VALIDACIÓN: ESTATUS ---
        if (user.estatus === 'inactivo') {
           
           const error = new Error('Tu cuenta ha sido desactivada. Contacta al administrador.' );
            error.statusCode = 401;
            throw error;
        }
        // ---------------------------------

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
             const error = new Error("Contraseña o usuario incorrectos");
            error.statusCode = 401;
            throw error;
        }

        // 3. OBTENER DATOS DE PERFIL SEGÚN ROL
        let nombreUsuario = 'Usuario Sin Perfil';
        let datosExtra = {};

        if (user.rol === 'admin') {
            const [admins] = await pool.query('SELECT nombre_completo, cargo FROM Administradores WHERE usuario_id = ?', [user.id]);
            if (admins.length > 0) {
                nombreUsuario = admins[0].nombre_completo;
                datosExtra.cargo = admins[0].cargo;
            }
        } 
        else if (user.rol === 'docente') {
            const [docentes] = await pool.query('SELECT nombre_completo, numero_empleado FROM Docentes WHERE usuario_id = ?', [user.id]);
            if (docentes.length > 0) {
                nombreUsuario = docentes[0].nombre_completo;
                datosExtra.numero_empleado = docentes[0].numero_empleado;
            }
        } 
        else if (user.rol === 'alumno') {
            const [alumnos] = await pool.query('SELECT nombre_completo, matricula, carrera FROM Alumnos WHERE usuario_id = ?', [user.id]);
            if (alumnos.length > 0) {
                nombreUsuario = alumnos[0].nombre_completo;
                datosExtra.matricula = alumnos[0].matricula;
                datosExtra.carrera = alumnos[0].carrera;
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
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { 
                id: user.id, 
                nombre: nombreUsuario, 
                email: user.email, 
                rol: user.rol,
                estatus: user.estatus, // Enviamos el estatus al front
                ...datosExtra
            }
        });

    } catch (error) {
        next(error);
    }
};

// LOGOUT (Sin cambios)
export const logout = async (req, res) => {
    try {
        const tokenHeader = req.headers.authorization;
        if (!tokenHeader) return res.sendStatus(204);
        const token = tokenHeader.split(" ")[1] || tokenHeader;
        await pool.query('INSERT INTO TokenBlacklist (token, fecha_expiracion) VALUES (?, NOW() + INTERVAL 8 HOUR)', [token]);
        res.json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
        console.error("Error en logout:", error);
        res.status(500).json({ message: "Error al cerrar sesión" });
    }
};