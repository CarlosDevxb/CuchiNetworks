import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Server, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'; // Iconos bonitos

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para efecto de carga
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simulamos un pequeño delay para que se vea la animación del botón (opcional)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = await login(email, password);
      if (user.rol === 'admin') navigate('/admin/dashboard');
      else navigate('/alumno/dashboard');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cuchi-dark font-sans">
      
      {/* SECCIÓN IZQUIERDA: Arte / Branding (Oculto en celular) */}
      <div className="hidden md:flex md:w-1/2 bg-cuchi-surface relative overflow-hidden items-center justify-center">
        {/* Fondo con imagen de servidores y overlay oscuro */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558494949-ef526b0042a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Servidores" 
            className="w-full h-full object-cover opacity-40"
          />
          {/* Gradiente encima de la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-cuchi-dark via-transparent to-transparent"></div>
        </div>

        {/* Contenido flotante encima de la imagen */}
        <div className="relative z-10 text-center px-10">
          <div className="mb-6 inline-block p-4 rounded-full bg-cuchi-dark/50 backdrop-blur-sm border border-cuchi-accent/30 shadow-lg shadow-cuchi-accent/20">
            <Server size={48} className="text-cuchi-accent" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">CuchiNetworks</h1>
          <p className="text-cuchi-accent text-lg font-light">Gestión Inteligente de Infraestructura</p>
          
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck size={18} />
              <span>Acceso Seguro</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Server size={18} />
              <span>Monitoreo 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: El Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-grid-pattern relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Encabezado Móvil (Solo se ve en celular) */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Bienvenido de nuevo</h2>
            <p className="mt-2 text-sm text-gray-400">
              Ingresa tus credenciales para acceder al panel de control.
            </p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm rounded-lg p-4 flex items-center animate-pulse">
              <Lock className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Input Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-cuchi-accent transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg leading-5 bg-cuchi-surface text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cuchi-accent focus:border-transparent sm:text-sm transition-all"
                  placeholder="correo@institucional.com"
                />
              </div>

              {/* Input Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-cuchi-accent transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg leading-5 bg-cuchi-surface text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cuchi-accent focus:border-transparent sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botón de Submit con Estado de Carga */}
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white 
                ${isLoading ? 'bg-cuchi-primary/70 cursor-not-allowed' : 'bg-gradient-to-r from-cuchi-primary to-blue-600 hover:to-blue-700'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cuchi-accent focus:ring-offset-cuchi-dark transition-all shadow-lg shadow-blue-500/30`}
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Ingresar al Sistema
                  <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                    <ArrowRight className="h-5 w-5 text-blue-200 group-hover:text-white transition-colors" />
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer pequeño */}
          <p className="mt-2 text-center text-xs text-gray-500">
            &copy; 2025 CuchipuEntertainment. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;