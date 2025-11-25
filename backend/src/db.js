import mysql from 'mysql2/promise'; // Usamos la versión con Promesas (moderna)
import dotenv from 'dotenv';

dotenv.config();

// Creamos un "Pool" de conexiones.
// Es más eficiente que abrir y cerrar una conexión por cada petición.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Probamos la conexión al iniciar
pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('✅ Conexión a MySQL exitosa');
    })
    .catch(err => {
        console.error('❌ Error conectando a MySQL:', err.message);
    });

export default pool;