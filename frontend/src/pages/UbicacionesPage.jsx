import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Box, Plus, Loader2, Server, Layout } from 'lucide-react';

const UbicacionesPage = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  const fetchUbicaciones = async () => {
    try {
        const token = localStorage.getItem('cuchi_token');
        const res = await axios.get('http://localhost:3000/api/ubicaciones', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUbicaciones(res.data);
        setLoading(false);
    } catch (error) {
        console.error(error);
        setLoading(false);
    }
  };

  // Icono según tipo
  const getIcon = (tipo) => {
      switch(tipo) {
          case 'isla': return <Server size={24} className="text-blue-500"/>;
          case 'mesa_central': return <Layout size={24} className="text-purple-500"/>;
          case 'bodega': return <Box size={24} className="text-orange-500"/>;
          default: return <MapPin size={24} className="text-gray-500"/>;
      }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Ubicaciones</h2>
            <p className="text-gray-500">Zonas físicas del laboratorio.</p>
        </div>
        <button 
            onClick={() => navigate('/admin/ubicaciones/nueva')} // Ruta que crearemos después
            className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 font-bold"
        >
            <Plus size={20} /> Nueva Zona
        </button>
      </div>

      {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-cuchi-primary" /></div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ubicaciones.map(ub => (
                  <div 
                    key={ub.id} 
                    onClick={() => navigate(`/admin/ubicaciones/${ub.id}`)}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                      <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                              {getIcon(ub.tipo_zona)}
                          </div>
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase">
                              {ub.tipo_zona.replace('_', ' ')}
                          </span>
                      </div>
                      <h3 className="text-xl font-bold text-cuchi-text mb-1">{ub.nombre}</h3>
                      <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{ub.descripcion || 'Sin descripción'}</p>
                      
                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium">Dispositivos:</span>
                          <span className="text-cuchi-primary font-bold text-lg">{ub.total_equipos}</span>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default UbicacionesPage;