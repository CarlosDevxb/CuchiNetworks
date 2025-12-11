import { config } from 'dotenv';

// Cargar las variables del archivo .env
config();

// Exportar constantes limpias y organizadas
export const PORT = process.env.PORT || 3000;

export const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cuchi_networks_db',
    port: process.env.DB_PORT || 3306
};

export const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal_inseguro';

// Lista de orígenes permitidos (CORS)
export const ALLOWED_ORIGINS = [
    'http://localhost:5173',       // Vite Local
    'http://localhost:80',         // Docker Local
    process.env.FRONTEND_URL       // Para cuando estemos en AWS
].filter(Boolean); // Elimina valores undefined/null