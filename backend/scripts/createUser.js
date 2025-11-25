import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// 1. Configuración de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Configurar interfaz para leer de la terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promesa para hacer preguntas de forma secuencial (async/await)
const preguntar = (pregunta) => {
    return new Promise((resolve) => {
        rl.question(pregunta, (respuesta) => resolve(respuesta.trim()));
    });
};

const crearUsuarioManual = async () => {
    console.log("\n👤 --- ASISTENTE DE CREACIÓN DE USUARIOS CUCHINETWORKS ---");

    let connection;
    try {
        // 3. Conexión a la BD
        // IMPORTANTE: Forzamos 127.0.0.1 porque el script corre en tu PC, no en Docker
        connection = await mysql.createConnection({
            host: '127.0.0.1', 
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        // 4. Solicitar Datos
        const nombre = await preguntar("1. Nombre completo del usuario: ");
        if (!nombre) throw new Error("El nombre es obligatorio.");

        const rolInput = await preguntar("2. Rol (admin / docente / alumno) [default: alumno]: ");
        const rol = ['admin', 'docente', 'alumno'].includes(rolInput.toLowerCase()) ? rolInput.toLowerCase() : 'alumno';

        const password = await preguntar("3. Contraseña: ");
        if (!password) throw new Error("La contraseña es obligatoria.");

        // 5. Generar Email Automático (@cuchi.net)
        // Lógica: Quita espacios, acentos, pasa a minúsculas y une con puntos.
        // Ej: "Carlos Pérez" -> "carlos.perez@cuchi.net"
        const emailPrefix = nombre
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/\s+/g, '.'); // Espacios por puntos
        
        const email = `${emailPrefix}@cuchi.net`;

        console.log(`\n📧 Correo generado: ${email}`);
        const confirmar = await preguntar("¿Proceder a crear usuario? (s/n): ");

        if (confirmar.toLowerCase() !== 's') {
            console.log("❌ Operación cancelada.");
            process.exit(0);
        }

        // 6. Encriptar y Guardar
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await connection.execute(
            'INSERT INTO Usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hash, rol]
        );

        console.log(`\n✅ ¡ÉXITO! Usuario '${nombre}' creado con rol '${rol}'.`);

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error(`\n⚠️  Error: Ya existe un usuario con ese correo.`);
        } else {
            console.error("\n❌ Error del sistema:", error.message);
        }
    } finally {
        rl.close();
        if (connection) await connection.end();
        process.exit(0);
    }
};

crearUsuarioManual();