import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';
// Importas la imagen como si fuera un componente más
import loginImage from '../assets/BCO.678a7549-e329-4bef-a903-c8ba5bbdbefb.pngs';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 1. Hacemos el login y recibimos el usuario
      const user = await login(email, password);
      
      // 2. REDIRECCIÓN INTELIGENTE (Switch Case)
      switch (user.rol) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'docente':
          navigate('/docente/dashboard'); // <--- ¡Esta era la línea que faltaba!
          break;
        case 'alumno':
          navigate('/alumno/dashboard');
          break;
        default:
          // Si por alguna razón tiene un rol raro, lo mandamos al login
          setError('Rol de usuario no reconocido');
          setIsLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas o error de conexión');
      setIsLoading(false);
    }
  };
  return (
    // FONDO GENERAL: Usamos tu color más claro #E4EBF0
    <div className="min-h-screen flex items-center justify-center bg-cuchi-base p-4 font-sans">
      
      {/* TARJETA PRINCIPAL: Bordes muy redondeados (3xl) y sombra suave */}
      <div className="bg-cuchi-card w-full max-w-5xl h-[600px] rounded-[2rem] shadow-2xl shadow-cuchi-primary/10 flex overflow-hidden">
        
        {/* LADO IZQUIERDO: Ilustración y Personalidad */}
        <div className="hidden md:flex w-1/2 bg-cuchi-surface/30 relative flex-col items-center justify-center p-10">
            
            {/* Círculo decorativo de fondo */}
            <div className="absolute w-96 h-96 bg-cuchi-secondary/20 rounded-full blur-3xl -top-10 -left-10"></div>
            
            {/* Logo o Nombre arriba a la izquierda */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <div className="bg-cuchi-primary p-2 rounded-lg">
                    <Zap size={20} className="text-white" />
                </div>
                <span className="font-bold text-cuchi-primary tracking-wide">CuchiNetworks</span>
            </div>

            {/* ILUSTRACIÓN 3D (Simulada con imagen) */}
            {/* Esta imagen tiene estilo 3D colorido como tu referencia */}
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <img 
                    src={loginImage} 
                    alt="3D Server Illustration" 
                    className="w-full max-w-md object-contain drop-shadow-xl"
                />
            </div>

            <div className="mt-8 text-center relative z-10">
                <h3 className="text-2xl font-bold text-cuchi-text mb-2">Gestiona tu laboratorio</h3>
                <p className="text-cuchi-secondary font-medium">Control total de equipos e incidencias.</p>
            </div>
        </div>

        {/* LADO DERECHO: Formulario Limpio */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-8 lg:p-16">
          
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-4xl font-bold text-cuchi-text mb-2">Hola de nuevo</h2>
            <p className="text-gray-400 mb-10">Ingresa tus datos para continuar.</p>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm rounded-xl p-3 mb-6 flex items-center animate-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Input Email Estilo "Soft" */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-cuchi-secondary group-focus-within:text-cuchi-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // ESTILO CLAVE: Fondo gris suave (#F3F4F6), sin bordes, redondeado grande
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-cuchi-primary focus:ring-4 focus:ring-cuchi-primary/10 rounded-2xl text-cuchi-text placeholder-gray-400 transition-all duration-200 font-medium outline-none"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
              </div>

              {/* Input Password Estilo "Soft" */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-cuchi-secondary group-focus-within:text-cuchi-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-cuchi-primary focus:ring-4 focus:ring-cuchi-primary/10 rounded-2xl text-cuchi-text placeholder-gray-400 transition-all duration-200 font-medium outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Botón Principal */}
              <button
                type="submit"
                disabled={isLoading}
                // COLOR PRINCIPAL: #4180AB
                className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cuchi-primary/30 transform transition-all duration-200 hover:-translate-y-1
                  ${isLoading ? 'bg-cuchi-secondary cursor-not-allowed' : 'bg-cuchi-primary hover:shadow-xl hover:bg-[#366d95]'}`}
              >
                {isLoading ? (
                   <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Ingresar ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
              ¿Olvidaste tu contraseña? <a href="#" className="text-cuchi-primary font-bold hover:underline">Recupérala aquí</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;