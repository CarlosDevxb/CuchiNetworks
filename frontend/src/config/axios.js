import axios from 'axios';

// 1. Leemos la URL desde las variables de entorno de Vite
// Si no existe la variable, usamos localhost por defecto para que no falle.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 2. Creamos una instancia "personalizada" de Axios
const client = axios.create({
    baseURL: apiUrl,
    // Aquí podemos añadir configuraciones globales futuras (como headers)
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