import { Router } from 'express';
import pool from '../src/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuario
        const [users] = await pool.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // 2. Verificar contraseña (Comparar texto plano con Hash)
        // NOTA: Si tu usuario en DB tiene contraseña en texto plano para pruebas, esto fallará.
        // Asegúrate de que la DB tenga un hash de bcrypt.
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 3. Generar Token (JWT)
        // Guardamos el ID y el ROL en el token cifrado
        const token = jwt.sign(
            { id: user.id, rol: user.rol, nombre: user.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Expira en 8 horas de jornada laboral
        );

        // 4. Enviar respuesta (sin el password_hash obviamente)
        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// RUTA TEMPORAL PARA CREAR USUARIOS CON HASH (Úsala para arreglar tu DB)
router.post('/register-test', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    const hash = await bcrypt.hash(password, 10); // Encriptar
    try {
        await pool.query('INSERT INTO Usuarios (nombre, email, password_hash, rol) VALUES (?,?,?,?)', 
        [nombre, email, hash, rol]);
        res.json({ message: "Usuario creado con hash correctamente" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;