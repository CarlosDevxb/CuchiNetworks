import { useEffect, useState } from 'react';
import { Calendar, Clock, BookOpen, FileText, Search } from 'lucide-react';
import client from '../config/axios';
import { TableSkeleton } from '../components/ui/Skeleton';

const HistorialDocentePage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        // Simulamos delay para ver el Skeleton
        await new Promise(resolve => setTimeout(resolve, 500));
        const res = await client.get('/docentes/historial');
        setRegistros(res.data);
      } catch (error) {
        console.error("Error al cargar historial", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  // Filtrado simple
  const filtered = registros.filter(r => 
    r.materia.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.tema_visto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formateador de fecha amigable
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

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
            <h1 className="text-3xl font-bold text-cuchi-text">Mi Historial de Actividades</h1>
            <p className="text-gray-400">Consulta los registros de uso del laboratorio.</p>
        </div>
        
        {/* BUSCADOR */}
        <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
            <input 
                type="text" 
                placeholder="Buscar por materia o tema..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 focus:border-cuchi-primary rounded-xl outline-none text-sm transition-all shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* TIMELINE / LISTA */}
      <div className="space-y-6">
        {filtered.length > 0 ? (
            filtered.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group">
                    
                    {/* FECHA (Columna Izquierda) */}
                    <div className="md:w-48 shrink-0 flex flex-col justify-center border-r border-gray-50 pr-4">
                        <div className="flex items-center gap-2 text-cuchi-primary font-bold capitalize mb-1">
                            <Calendar size={18} />
                            {new Date(item.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock size={14} />
                            {item.hora_entrada.slice(0,5)} - {item.hora_salida.slice(0,5)}
                        </div>
                    </div>

                    {/* CONTENIDO (Centro) */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                            {item.materia}
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">Gpo {item.grupo}</span>
                        </h3>
                        <p className="text-gray-600 font-medium flex items-start gap-2">
                            <BookOpen size={18} className="text-blue-300 mt-0.5 shrink-0"/>
                            {item.tema_visto}
                        </p>
                        {item.observaciones && (
                            <div className="mt-3 bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex gap-2">
                                <FileText size={16} className="text-yellow-600 mt-0.5 shrink-0"/>
                                <p className="text-sm text-yellow-800 italic">"{item.observaciones}"</p>
                            </div>
                        )}
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No se encontraron registros.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default HistorialDocentePage;