/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cuchi: {
          // #E4EBF0: El color más claro de tu paleta. Perfecto para el fondo de toda la pantalla.
          base: '#E4EBF0',
          
          // #FFFFFF: Blanco puro para la tarjeta central.
          card: '#FFFFFF',
          
          // #BDD1DE: Un gris/azul claro. Lo usaremos para fondos de inputs o paneles secundarios.
          surface: '#BDD1DE',
          
          // #8AB3CF: Azul medio. Genial para bordes, iconos inactivos o textos secundarios.
          secondary: '#8AB3CF',
          
          // #4180AB: TU COLOR PRINCIPAL. Fuerte y claro. Para el botón de acción y textos importantes.
          primary: '#4180AB',
          
          // Un color extra oscuro para texto (necesario para contraste, basado en tu azul)
          text: '#1e3a5f', 
        }
      },
      fontFamily: {
        // Usaremos una fuente redonda si es posible, o la sans por defecto
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], 
      }
    },
  },
  plugins: [],
}