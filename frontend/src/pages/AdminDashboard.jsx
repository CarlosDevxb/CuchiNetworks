import { useEffect, useState } from 'react';
import axios from 'axios';
// ❌ BORRA ESTA LÍNEA: import DashboardLayout from '../layouts/DashboardLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_equipos: 0,
    reportes_activos: 0,
    equipos_mantenimiento: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/dashboard/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ❌ ELIMINAMOS <DashboardLayout> QUE ENVOLVÍA TODO
  return (
    <div className="fade-in"> {/* Opcional: un div simple contenedor */}
      
      <h2 className="text-3xl font-bold text-cuchi-text mb-2">Panel de Administrador</h2>
      <p className="text-gray-400 mb-8">Resumen general del laboratorio.</p>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-64 items-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cuchi-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TARJETA 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Equipos Totales</h3>
            <p className="text-5xl font-bold text-cuchi-primary mt-4">{stats.total_equipos}</p>
            <span className="text-sm text-gray-400 font-medium mt-2 block">Inventariados</span>
          </div>

          {/* TARJETA 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Reportes Activos</h3>
            <p className="text-5xl font-bold text-red-500 mt-4">{stats.reportes_activos}</p>
            <span className="text-sm text-red-300 font-medium mt-2 block">Requieren atención</span>
          </div>

          {/* TARJETA 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">En Mantenimiento</h3>
            <p className="text-5xl font-bold text-yellow-500 mt-4">{stats.equipos_mantenimiento}</p>
            <span className="text-sm text-yellow-400 font-medium mt-2 block">Fuera de servicio</span>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;