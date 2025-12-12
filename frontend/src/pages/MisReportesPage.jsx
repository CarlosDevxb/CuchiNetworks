import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Search, FileText, Wrench} from 'lucide-react';
import client from '../config/axios';
import { TableSkeleton } from '../components/ui/Skeleton';

const MisReportesPage = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay estético
        const res = await client.get('/reportes');
        setReportes(res.data);
      } catch (error) {
        console.error("Error cargando reportes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
  }, []);

  // Helper de Estados
  const getStatusBadge = (estado) => {
    const config = {
        nuevo: { color: 'bg-blue-100 text-blue-700', icon: <AlertTriangle size={14}/>, label: 'Nuevo' },
        en_revision: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14}/>, label: 'En Revisión' },
        resuelto: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14}/>, label: 'Resuelto' },
        irreparable: { color: 'bg-red-100 text-red-700', icon: <Wrench size={14}/>, label: 'Irreparable' }
    };
    const c = config[estado] || config.nuevo;
    
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${c.color}`}>
            {c.icon} {c.label}
        </span>
    );
  };

  const filtered = reportes.filter(r => 
    r.descripcion_problema.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.nombre_equipo && r.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
      return (
        <div className="fade-in max-w-6xl mx-auto p-8">
            <div className="h-10 w-64 bg-gray-200 rounded mb-8 animate-pulse"></div>
            <TableSkeleton rows={5} />
        </div>
      );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto p-6 md:p-10 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-cuchi-text">Mis Reportes de Fallas</h1>
            <p className="text-gray-400">Seguimiento de incidencias reportadas.</p>
        </div>
        
        {/* BUSCADOR */}
        <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
            <input 
                type="text" 
                placeholder="Buscar reporte..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 focus:border-cuchi-primary rounded-xl outline-none text-sm transition-all shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* LISTA DE REPORTES */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
            filtered.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                    
                    {/* ESTADO (Columna Izquierda) */}
                    <div className="md:w-40 shrink-0 flex flex-col justify-center items-start border-r border-gray-50 pr-4">
                        <div className="mb-2">{getStatusBadge(item.estado_reporte)}</div>
                        <p className="text-xs text-gray-400 font-medium">
                            {new Date(item.fecha_reporte).toLocaleDateString()}
                        </p>
                    </div>

                    {/* CONTENIDO (Centro) */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                            {item.nombre_equipo ? (
                                <>Falla en: <span className="text-cuchi-primary">{item.nombre_equipo}</span></>
                            ) : (
                                "Falla General / Instalaciones"
                            )}
                        </h3>
                        <p className="text-gray-600 mb-3">{item.descripcion_problema}</p>
                        
                        {/* RESPUESTA DEL TÉCNICO (Si existe) */}
                        {item.solucion_tecnica && (
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex gap-3 items-start">
                                <div className="bg-green-100 p-1 rounded text-green-600 mt-0.5"><Tool size={14}/></div>
                                <div>
                                    <p className="text-xs font-bold text-green-700 uppercase mb-0.5">Solución Técnica:</p>
                                    <p className="text-sm text-green-800">{item.solucion_tecnica}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4"/>
                <p className="text-gray-500 font-bold">No has reportado ninguna falla.</p>
                <p className="text-gray-400 text-sm">¡El laboratorio funciona perfecto! 🎉</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default MisReportesPage;