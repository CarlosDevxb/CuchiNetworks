import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para navegar al detalle
import { Loader2, Plus, HardDrive, Wifi, Tv, Monitor, Printer, Smartphone, PowerCircle, Wrench, MapPin } from 'lucide-react';
const EquiposPage = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 useEffect(() => {
    const fetchEquipos = async () => {
      try {
        // CORRECCIÓN: Usamos el nombre correcto de la llave en localStorage
        const token = localStorage.getItem('cuchi_token'); 
        
        if (!token) {
            setError("No hay sesión activa. Por favor inicia sesión nuevamente.");
            setLoading(false);
            return;
        }

        const response = await axios.get('http://localhost:3000/api/equipos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEquipos(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar equipos:", err);
        // Manejo mejorado de errores
        if (err.response && err.response.status === 401) {
            setError("Sesión expirada. Intenta salir y volver a entrar.");
        } else {
            setError("No se pudieron cargar los equipos. Verifica que el servidor esté corriendo.");
        }
        setLoading(false);
      }
    };

    fetchEquipos();
  }, []);

  // Función para obtener un ícono según el tipo de equipo
  const getEquipoIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'servidor': return <HardDrive size={18} />;
      case 'router': return <Wifi size={18} />;
      case 'switch': return <Tv size={18} />; // Usamos TV como proxy para switch
      case 'monitor': return <Monitor size={18} />;
      case 'impresora': return <Printer size={18} />;
      case 'computadora': return <Monitor size={18} />; // Monitor para PC genérico
      case 'celular': return <Smartphone size={18} />;
      default: return <HardDrive size={18} />; // Icono por defecto
    }
  };

  // Función para obtener el estilo del estado
  const getEstadoStyle = (estado) => {
    switch (estado.toLowerCase()) {
      case 'operativo': return 'bg-green-100 text-green-700';
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-700';
      case 'falla': return 'bg-red-100 text-red-700';
      case 'inactivo': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // NAVEGAR AL DETALLE
  const handleCardClick = (id) => {
    navigate(`/admin/equipos/${id}`); // Ruta que crearemos para el detalle
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-cuchi-text mb-1">Inventario de Equipos</h2>
          <p className="text-gray-500">Administra todos los dispositivos del laboratorio.</p>
        </div>
        <button 
          className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl shadow-md shadow-cuchi-primary/20 hover:bg-cuchi-primary/90 flex items-center gap-2 font-semibold transition-all duration-200"
          onClick={() => navigate('/admin/equipos/nuevo')} // Ruta para crear nuevo equipo (futuro)
        >
          <Plus size={20} />
          Nuevo Equipo
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center h-64">
          <Loader2 className="h-12 w-12 text-cuchi-primary animate-spin" />
          <p className="text-cuchi-secondary mt-4">Cargando equipos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipos.map((equipo) => (
            <div 
              key={equipo.id} 
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer 
                         transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              onClick={() => handleCardClick(equipo.id)}
            >
              <div className="w-full h-48 bg-cuchi-surface/20 flex items-center justify-center relative">
                {equipo.imagen_url ? (
                  <img 
                    src={equipo.imagen_url} 
                    alt={equipo.nombre_equipo} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <HardDrive size={60} className="text-cuchi-secondary/50" />
                )}
                {/* Etiqueta de estado */}
                <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${getEstadoStyle(equipo.estado)}`}>
                  {equipo.estado}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
                  {getEquipoIcon(equipo.tipo)}
                  <span>{equipo.tipo.toUpperCase()}</span>
                </div>
                <h3 className="text-lg font-bold text-cuchi-text mb-1 truncate">{equipo.nombre_equipo}</h3>
                <p className="text-gray-600 text-sm mb-3 truncate">{equipo.modelo}</p>
                <div className="flex items-center text-cuchi-secondary text-xs">
                  <MapPin size={14} className="mr-1" />
                  <span>{equipo.ubicacion}</span>
                </div>
              </div>
            </div>
          ))}
          {equipos.length === 0 && !loading && !error && (
              <p className="col-span-full text-center text-gray-500 text-lg py-10">No hay equipos registrados aún.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EquiposPage;