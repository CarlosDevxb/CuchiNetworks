import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Rutas
import pool from './src/db.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import equiposRoutes from './routes/equipos.routes.js';
import ubicacionesRoutes from './routes/ubicaciones.routes.js';
import materiasRoutes from './routes/materias.routes.js';
import docentesRoutes from './routes/docentes.routes.js';
import bitacoraRoutes from './routes/bitacora.routes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- SEGURIDAD NIVEL 1: HEADERS (HELMET) ---
// crossOriginResourcePolicy: "cross-origin" permite que el Frontend cargue las imágenes
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// --- SEGURIDAD NIVEL 2: RATE LIMIT GLOBAL ---
// Permite 100 peticiones cada 15 minutos por IP
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 100, 
	standardHeaders: true,
	legacyHeaders: false,
    message: { message: "Demasiadas peticiones desde esta IP, intenta más tarde." }
});
app.use('/api', apiLimiter);

// --- MIDDLEWARES GENERALES ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir imágenes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- RUTAS ---
app.get('/', (req, res) => {
    res.send('API de CuchiNetworks funcionando 🚀');
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);

app.use('/api/materias', materiasRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/bitacora', bitacoraRoutes);
// Configuración de __dirnam
// Arrancar Servidor
app.listen(PORT, () => {
    console.log(`\n📡 Servidor Backend corriendo en http://localhost:${PORT}`);
});