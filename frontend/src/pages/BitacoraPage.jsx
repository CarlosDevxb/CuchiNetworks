import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, BookOpen, Search, FileText } from 'lucide-react';

const BitacoraPage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBitacora = async () => {
        try {
            const token = localStorage.getItem('cuchi_token');
            const res = await axios.get('http://localhost:3000/api/bitacora', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistros(res.data);
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };
    fetchBitacora();
  }, []);

  // Filtrado simple en el cliente
  const filteredRegistros = registros.filter(reg => 
      reg.nombre_docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.nombre_materia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formateador de fecha
  const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fade-in max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Bitácora de Uso</h2>
            <p className="text-gray-500">Historial de clases y actividades en el laboratorio.</p>
        </div>
        
        {/* BARRA DE BÚSQUEDA */}
        <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400"/>
            </div>
            <input 
                type="text" 
                placeholder="Buscar docente o materia..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
              <div className="p-10 text-center text-gray-400">Cargando historial...</div>
          ) : registros.length === 0 ? (
              <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                  <FileText size={48} className="mb-2 opacity-20"/>
                  <p>Aún no hay registros en la bitácora.</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                              <th className="p-5 font-bold">Fecha / Horario</th>
                              <th className="p-5 font-bold">Docente</th>
                              <th className="p-5 font-bold">Materia / Actividad</th>
                              <th className="p-5 font-bold">Observaciones</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                          {filteredRegistros.map((reg) => (
                              <tr key={reg.id} className="hover:bg-blue-50/30 transition-colors">
                                  
                                  {/* FECHA */}
                                  <td className="p-5">
                                      <div className="flex items-center gap-3 font-medium text-cuchi-text">
                                          <div className="bg-blue-50 p-2 rounded-lg text-cuchi-primary"><Calendar size={18}/></div>
                                          <div>
                                              <span className="block capitalize">{formatDate(reg.fecha)}</span>
                                              <span className="text-xs text-gray-400 font-normal flex items-center gap-1 mt-1">
                                                  <Clock size={10}/> {reg.hora_entrada} - {reg.hora_salida}
                                              </span>
                                          </div>
                                      </div>
                                  </td>

                                  {/* DOCENTE */}
                                  <td className="p-5">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                              {reg.nombre_docente.charAt(0)}
                                          </div>
                                          <div>
                                              <span className="block font-bold">{reg.nombre_docente}</span>
                                              <span className="text-xs text-gray-400">{reg.email_docente}</span>
                                          </div>
                                      </div>
                                  </td>

                                  {/* MATERIA */}
                                  <td className="p-5">
                                      <span className="font-semibold text-cuchi-primary block">{reg.nombre_materia}</span>
                                      <span className="text-xs text-gray-400">{reg.carrera || 'General'}</span>
                                      {reg.tema_visto && (
                                          <div className="mt-1 text-xs bg-gray-100 px-2 py-1 rounded w-fit text-gray-600">
                                              Tema: {reg.tema_visto}
                                          </div>
                                      )}
                                  </td>

                                  {/* OBSERVACIONES */}
                                  <td className="p-5">
                                      {reg.observaciones ? (
                                          <span className="text-gray-600 italic">"{reg.observaciones}"</span>
                                      ) : (
                                          <span className="text-gray-300">-</span>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default BitacoraPage;