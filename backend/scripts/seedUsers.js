import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv para leer el archivo .env desde la carpeta raíz del backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
    console.log("🌱 Iniciando sembrado de usuarios...");

    let connection;
    try {
        // 1. Crear conexión directa (sin usar el pool de la app)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST, // Ojo: Si corres esto desde TU terminal (no docker), usa '127.0.0.1'
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        // 2. Definir los usuarios a crear
        const users = [
            {
                nombre: 'Jefe Cuchi (Admin)',
                email: 'jefe@cuchi.net',
                password: 'admin123',
                rol: 'admin'
            },
            {
                nombre: 'Profesor Jirafales',
                email: 'profe@cuchi.net',
                password: 'profe123',
                rol: 'docente'
            },
            {
                nombre: 'Alumno Ejemplar',
                email: 'alumno@cuchi.net',
                password: 'alumno123',
                rol: 'alumno'
            }
        ];

        // 3. Recorrer e insertar
        for (const user of users) {
            // Verificar si ya existe para no duplicar
            const [rows] = await connection.execute('SELECT id FROM Usuarios WHERE email = ?', [user.email]);
            
            if (rows.length === 0) {
                // Encriptar contraseña
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(user.password, salt);

                // Insertar
                await connection.execute(
                    'INSERT INTO Usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
                    [user.nombre, user.email, hash, user.rol]
                );
                console.log(`✅ Usuario creado: ${user.nombre} (${user.rol})`);
            } else {
                console.log(`⚠️ Usuario ya existe: ${user.email} (Saltando...)`);
            }
        }

        console.log("🏁 Sembrado terminado exitosamente.");

    } catch (error) {
        console.error("❌ Error al sembrar usuarios:", error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
};

seedUsers();