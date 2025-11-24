import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ArrowLeft, AlertOctagon } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Lógica Inteligente de Redirección
  const handleGoHome = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    switch (user.rol) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'docente':
        navigate('/docente/dashboard');
        break;
      case 'alumno':
        navigate('/alumno/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cuchi-base p-6 font-sans">
      <div className="max-w-lg w-full text-center">
        
        {/* ILUSTRACIÓN CON ICONOS (Estilo Soft UI) */}
        <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-cuchi-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <AlertOctagon size={64} className="text-cuchi-primary" />
            </div>
            {/* Decoración flotante */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-blue-200 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 bg-purple-200 rounded-full blur-xl"></div>
        </div>

        {/* TEXTOS */}
        <h1 className="text-8xl font-extrabold text-cuchi-text mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">¡Ups! Página no encontrada</h2>
        <p className="text-gray-500 mb-10 text-lg leading-relaxed">
          Parece que la página que buscas no existe, está en mantenimiento o no tienes permisos para acceder a ella.
        </p>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          {/* Botón 1: Regresar (Historial) */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
            Regresar
          </button>

          {/* Botón 2: Ir a Inicio (Seguro por Rol) */}
          <button 
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cuchi-primary text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all shadow-md shadow-cuchi-primary/30"
          >
            <Home size={20} />
            Ir a mi Panel
          </button>

        </div>

        <div className="mt-12 text-xs text-gray-400 font-medium">
            CuchiNetworks v1.0 &copy; 2025
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;