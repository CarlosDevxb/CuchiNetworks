import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.middleware.js';
// Rutas
import pool from './src/db.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import equiposRoutes from './routes/equipos.routes.js';
import ubicacionesRoutes from './routes/ubicaciones.routes.js';
import materiasRoutes from './routes/materias.routes.js';
import docentesRoutes from './routes/docentes.routes.js';
import bitacoraRoutes from './routes/bitacora.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import clasesRoutes from './routes/clases.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { PORT, ALLOWED_ORIGINS } from './src/config.js';
const app = express();

// --- SEGURIDAD NIVEL 1: HEADERS (HELMET) ---
// crossOriginResourcePolicy: "cross-origin" permite que el Frontend cargue las imágenes
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// --- SEGURIDAD NIVEL 2: RATE LIMIT GLOBAL ---
// Permite 100 peticiones cada 15 minutos por IP
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 1000, 
	standardHeaders: true,
	legacyHeaders: false,
    message: { message: "Demasiadas peticiones desde esta IP, intenta más tarde." }
});
app.use('/api', apiLimiter);

// --- MIDDLEWARES GENERALES ---


app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origen (como Postman o Apps móviles)
        if (!origin) return callback(null, true);
        
        if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
            return callback(new Error('CORS: Origen no permitido por política de seguridad'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
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
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/reportes', reportesRoutes);
// Configuración de __dirnam
// Arrancar Servidor
app.use(errorHandler); // Manejo de errores (siempre al final de las rutas)
app.listen(PORT, () => {
    console.log(`📡 Servidor Backend corriendo en puerto ${PORT}`);
    console.log(`🛡️ Orígenes permitidos: ${ALLOWED_ORIGINS.join(', ')}`);
});