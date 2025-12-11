import { createPool } from 'mysql2/promise';
// 👇 1. Importar la configuración nueva
import { DB_CONFIG } from './config.js'; 

// 👇 2. Usar el objeto limpio
const pool = createPool({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database: DB_CONFIG.database,
    port: DB_CONFIG.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación de conexión (Opcional pero recomendado)
pool.getConnection()
    .then(connection => {
        console.log(`✅ Conectado a la BD: ${DB_CONFIG.database} en ${DB_CONFIG.host}`);
        connection.release();
    })
    .catch(error => {
        console.error('❌ Error conectando a la BD:', error.message);
    });

export default pool;