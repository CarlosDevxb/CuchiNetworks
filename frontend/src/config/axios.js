import axios from 'axios';


// Lógica de Prioridad para la URL:
// 1. window.APP_CONFIG.API_URL -> Inyectado por Docker/AWS en tiempo real.
// 2. import.meta.env.VITE_API_URL -> Variable de entorno local (.env).
// 3. Fallback a localhost.
const apiUrl = window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log("📡 Axios conectado a:", apiUrl);

const client = axios.create({
    baseURL: apiUrl,
    withCredentials: true 
});


// 3. Interceptor (Opcional pero recomendado):
// Inyecta el TOKEN automáticamente en cada petición si existe.
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('cuchi_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;