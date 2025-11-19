/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aquí definimos tus colores personalizados
      colors: {
        cuchi: {
          dark: '#0B1120',    // Un azul muy oscuro, casi negro (Fondo)
          light: '#F8FAFC',   // Blanco con un toque grisáceo (Textos claros)
          primary: '#3B82F6', // Azul eléctrico (Botones principales)
          accent: '#06B6D4',  // Cian (Detalles, bordes, hovers)
          surface: '#1E293B'  // Gris azulado (Tarjetas, inputs)
        }
      },
      // Podemos agregar una fuente si quisieras luego
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}