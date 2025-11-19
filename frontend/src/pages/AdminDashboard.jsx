import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminDashboard = () => {
  // 1. ESTADO: Para guardar los numeritos
  const [stats, setStats] = useState({
    total_equipos: 0,
    reportes_activos: 0,
    equipos_mantenimiento: 0
  });

  // 2. ESTADO DE CARGA
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. EFECTO: Cargar datos al entrar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Nota: Gracias al AuthContext, axios ya envía el token automáticamente aquí
        const response = await axios.get('http://localhost:3000/api/dashboard/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("No se pudieron cargar los datos.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Panel de Administrador</h2>
      
      {/* Muestra error si falla */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
          <p className="text-xs">Revisa la consola (F12) para más detalles.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TARJETA 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm uppercase font-bold">Equipos Totales</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total_equipos}</p>
            <span className="text-xs text-gray-400">Inventariados</span>
          </div>

          {/* TARJETA 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm uppercase font-bold">Reportes Activos</h3>
            <p className="text-4xl font-bold text-red-600 mt-2">{stats.reportes_activos}</p>
            <span className="text-xs text-red-300">Requieren atención</span>
          </div>

          {/* TARJETA 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm uppercase font-bold">En Mantenimiento</h3>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.equipos_mantenimiento}</p>
            <span className="text-xs text-yellow-400">Fuera de servicio</span>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;