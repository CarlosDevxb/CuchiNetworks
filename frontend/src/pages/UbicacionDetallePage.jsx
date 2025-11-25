import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Server, HardDrive, Monitor, Wifi, Printer } from 'lucide-react';

const UbicacionDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null); // Guarda info de ubicación + array de equipos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('cuchi_token');
            const res = await axios.get(`http://localhost:3000/api/ubicaciones/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);

  // Helpers visuales (reutilizados de EquiposPage)
  const getIcon = (tipo) => {
      switch (tipo) {
        case 'router': return <Wifi size={16} />;
        case 'switch': return <Server size={16} />;
        case 'computadora': return <Monitor size={16} />;
        default: return <HardDrive size={16} />;
      }
  };

  const getStatusColor = (estado) => {
      return estado === 'operativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!data) return <div className="p-10 text-center">Ubicación no encontrada</div>;

  return (
    <div className="fade-in">
        {/* Header con Navegación */}
        <button onClick={() => navigate('/admin/ubicaciones')} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary">
            <ArrowLeft size={20} className="mr-2" /> Volver a Ubicaciones
        </button>

        {/* Tarjeta Principal de la Ubicación */}
        <div className="bg-cuchi-primary rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 opacity-90">
                    <MapPin size={20} />
                    <span className="uppercase font-bold tracking-widest text-sm">{data.tipo_zona.replace('_', ' ')}</span>
                </div>
                <h1 className="text-4xl font-bold mb-2">{data.nombre}</h1>
                <p className="text-blue-100 max-w-2xl">{data.descripcion}</p>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                <Server size={300} />
            </div>
        </div>

        {/* Lista de Dispositivos (Grid) */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-cuchi-text">Dispositivos Instalados ({data.equipos.length})</h2>
        </div>

        {data.equipos.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400">No hay equipos asignados a esta ubicación aún.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.equipos.map(eq => (
                    <div 
                        key={eq.id}
                        onClick={() => navigate(`/admin/equipos/${eq.id}`)} // Ir al detalle del equipo
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer flex flex-col"
                    >
                        <div className="h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                            {eq.imagen_url ? (
                                <img src={eq.imagen_url} className="w-full h-full object-cover" alt={eq.nombre_equipo}/>
                            ) : (
                                <HardDrive size={40} className="text-gray-300" />
                            )}
                            <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(eq.estado)}`}>
                                {eq.estado}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1">
                            {getIcon(eq.tipo)} {eq.tipo}
                        </div>
                        <h3 className="font-bold text-cuchi-text truncate">{eq.nombre_equipo}</h3>
                        
                        {/* Muestra la posición específica dentro de la ubicación (R1, Mesa 5) */}
                        {eq.posicion_fisica && (
                            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs">
                                <span className="text-gray-400">Posición:</span>
                                <span className="font-bold text-cuchi-primary bg-blue-50 px-2 py-1 rounded">{eq.posicion_fisica}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default UbicacionDetallePage;