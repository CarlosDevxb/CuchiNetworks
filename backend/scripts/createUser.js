import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const preguntar = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

const crearUsuarioAvanzado = async () => {
    console.log("\n👤 --- CREADOR DE USUARIOS v2 (Esquema Heredado) ---");

    let connection;
    try {
        connection = await mysql.createConnection({
            host: '127.0.0.1', // Script local
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        // 1. DATOS COMUNES
        const nombre = await preguntar("1. Nombre completo: ");
        if (!nombre) throw new Error("Nombre obligatorio");

        const rolInput = await preguntar("2. Rol (admin / docente / alumno): ");
        const rol = ['admin', 'docente', 'alumno'].includes(rolInput.toLowerCase()) ? rolInput.toLowerCase() : 'alumno';

        const password = await preguntar("3. Contraseña: ");
        if (!password) throw new Error("Contraseña obligatoria");

        // Generar Email
        const emailPrefix = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.');
        const email = `${emailPrefix}@cuchi.net`;
        console.log(`📧 Email generado: ${email}`);

        // 2. DATOS ESPECÍFICOS SEGÚN ROL
        let extraData = {};
        if (rol === 'admin') {
            extraData.cargo = await preguntar("   > Cargo (Ej. Gerente TI): ") || 'Administrador';
        } else if (rol === 'docente') {
            extraData.num_empleado = await preguntar("   > Número de Empleado: ") || 'S/N';
            extraData.titulo = await preguntar("   > Título (Ing./Dr.): ") || 'Prof.';
        } else if (rol === 'alumno') {
            extraData.matricula = await preguntar("   > Matrícula: ");
            if (!extraData.matricula) throw new Error("Matrícula obligatoria para alumnos");
            extraData.carrera = await preguntar("   > Carrera: ");
        }

        const confirmar = await preguntar("\n¿Crear usuario? (s/n): ");
        if (confirmar.toLowerCase() !== 's') process.exit(0);

        // 3. TRANSACCIÓN (INSERTAR EN 2 TABLAS)
        await connection.beginTransaction();

        try {
            // A. Insertar en Padre (Usuarios)
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            
            const [resUser] = await connection.execute(
                'INSERT INTO Usuarios (email, password_hash, rol) VALUES (?, ?, ?)',
                [email, hash, rol]
            );
            const userId = resUser.insertId;

            // B. Insertar en Hija (Admin/Docente/Alumno)
            if (rol === 'admin') {
                await connection.execute(
                    'INSERT INTO Administradores (usuario_id, nombre_completo, cargo) VALUES (?, ?, ?)',
                    [userId, nombre, extraData.cargo]
                );
            } else if (rol === 'docente') {
                await connection.execute(
                    'INSERT INTO Docentes (usuario_id, nombre_completo, numero_empleado, titulo_academico) VALUES (?, ?, ?, ?)',
                    [userId, nombre, extraData.num_empleado, extraData.titulo]
                );
            } else if (rol === 'alumno') {
                await connection.execute(
                    'INSERT INTO Alumnos (usuario_id, nombre_completo, matricula, carrera) VALUES (?, ?, ?, ?)',
                    [userId, nombre, extraData.matricula, extraData.carrera]
                );
            }

            await connection.commit();
            console.log(`\n✅ ¡ÉXITO! Usuario ID ${userId} creado correctamente.`);

        } catch (err) {
            await connection.rollback(); // Deshacer cambios si falla la tabla hija
            throw err;
        }

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        if (error.code === 'ER_DUP_ENTRY') console.error("   (Probablemente el correo o matrícula ya existe)");
    } finally {
        rl.close();
        if (connection) await connection.end();
        process.exit(0);
    }
};

crearUsuarioAvanzado();