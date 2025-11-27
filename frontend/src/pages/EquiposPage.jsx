import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, HardDrive, Wifi, Tv, Monitor, Printer, Smartphone, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const EquiposPage = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem('cuchi_token');
        if (!token) {
            toast.error("Sesión expirada");
            return;
        }
        const response = await axios.get('http://localhost:3000/api/equipos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEquipos(response.data);
        setLoading(false);
      } catch (err) {
        const msg = err.response?.status === 401 ? "Sesión inválida" : "Error al cargar inventario";
        toast.error(msg);
        setLoading(false);
      }
    };
    fetchEquipos();
  }, []);

  const getEquipoIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'servidor': return <HardDrive size={18} />;
      case 'router': return <Wifi size={18} />;
      case 'switch': return <Tv size={18} />;
      case 'monitor': return <Monitor size={18} />;
      case 'impresora': return <Printer size={18} />;
      case 'computadora': return <Monitor size={18} />;
      case 'celular': return <Smartphone size={18} />;
      default: return <HardDrive size={18} />;
    }
  };

  const getEstadoStyle = (estado) => {
    switch (estado.toLowerCase()) {
      case 'operativo': return 'bg-green-100 text-green-700 border-green-200';
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'falla': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fade-in max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-cuchi-text mb-1">Inventario</h2>
          <p className="text-gray-500">Administración de dispositivos físicos.</p>
        </div>
        <button 
          className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 flex items-center gap-2 font-bold transition-all active:scale-95"
          onClick={() => navigate('/admin/equipos/nuevo')}
        >
          <Plus size={20} /> Nuevo Equipo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader2 className="h-12 w-12 text-cuchi-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipos.map((equipo) => (
            <div 
              key={equipo.id} 
              onClick={() => navigate(`/admin/equipos/${equipo.id}`)}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden cursor-pointer 
                         hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-full h-48 bg-gray-50 flex items-center justify-center relative p-4">
                {equipo.imagen_url ? (
                  <img src={equipo.imagen_url} alt={equipo.nombre_equipo} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                ) : (
                  <HardDrive size={60} className="text-gray-300" />
                )}
                <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold rounded-full border uppercase ${getEstadoStyle(equipo.estado)}`}>
                  {equipo.estado}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-2">
                  {getEquipoIcon(equipo.tipo)}
                  <span>{equipo.tipo}</span>
                </div>
                <h3 className="text-lg font-bold text-cuchi-text mb-1 truncate">{equipo.nombre_equipo}</h3>
                <p className="text-gray-500 text-sm mb-4 truncate">{equipo.modelo}</p>
                <div className="flex items-center text-cuchi-primary text-xs font-medium bg-blue-50 py-1.5 px-3 rounded-lg w-fit">
                  <MapPin size={14} className="mr-1" />
                  <span>{equipo.ubicacion || 'Sin ubicación'}</span>
                </div>
              </div>
            </div>
          ))}
          {equipos.length === 0 && <p className="col-span-full text-center text-gray-400 py-10">No hay equipos registrados.</p>}
        </div>
      )}
    </div>
  );
};

export default EquiposPage;