import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext'; // Nuevo
import { Server, AlertTriangle, Wrench } from 'lucide-react';
import client from '../config/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_equipos: 0,
    reportes_activos: 0,
    equipos_mantenimiento: 0
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('cuchi_token');
        const response = await client.get('/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar las estadísticas"); // Toast
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="fade-in max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-cuchi-text mb-2">Panel de Administrador</h2>
      <p className="text-gray-400 mb-8">Resumen general del estado del laboratorio.</p>
      
      {loading ? (
        <div className="flex justify-center h-64 items-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cuchi-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Equipos */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 group cursor-default">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Equipos Totales</h3>
                    <p className="text-5xl font-bold text-cuchi-text mt-2">{stats.total_equipos}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl text-cuchi-primary group-hover:scale-110 transition-transform">
                    <Server size={28}/>
                </div>
            </div>
            <span className="text-sm text-gray-400 font-medium mt-4 block">Dispositivos inventariados</span>
          </div>

          {/* Reportes */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 group cursor-default">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Reportes Activos</h3>
                    <p className="text-5xl font-bold text-red-500 mt-2">{stats.reportes_activos}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={28}/>
                </div>
            </div>
            <span className="text-sm text-red-300 font-medium mt-4 block">Requieren atención inmediata</span>
          </div>

          {/* Mantenimiento */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 group cursor-default">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">En Mantenimiento</h3>
                    <p className="text-5xl font-bold text-yellow-500 mt-2">{stats.equipos_mantenimiento}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                    <Wrench size={28}/>
                </div>
            </div>
            <span className="text-sm text-yellow-400 font-medium mt-4 block">Fuera de servicio temporal</span>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;