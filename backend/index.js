import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pool from './src/db.js'; // Importamos la conexión que acabamos de crear
import dashboardRoutes from './routes/dashboard.routes.js';
import AuthRoutes from './routes/auth.routes.js';
import equiposRoutes from './routes/equipos.routes.js';
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors()); // Permite que React (puerto 5173) hable con este server
app.use(morgan('dev')); // Muestra logs bonitos en la consola
app.use(express.json()); // Permite recibir datos JSON en los POST

// --- Rutas de Prueba ---

// 1. Ruta básica para ver si el server vive
app.get('/', (req, res) => {
    res.send('API de CuchiNetworks funcionando 🚀');
});

// 2. Ruta para probar la Base de Datos (¡La prueba de fuego!)
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
        res.json({ 
            mensaje: 'Conexión a DB exitosa', 
            calculo_db: rows[0].resultado 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/auth', AuthRoutes);
// Rutas de la API
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/equipos', equiposRoutes);
// --- Arrancar Servidor ---
app.listen(PORT, () => {
    console.log(`\n📡 Servidor Backend corriendo en http://localhost:${PORT}`);
});