import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Search, FileText, 
  Eye, Briefcase, BookOpen 
} from 'lucide-react';

const BitacoraPage = () => {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. CARGAR DATOS AL INICIO
  useEffect(() => {
    const fetchBitacora = async () => {
        try {
            const token = localStorage.getItem('cuchi_token');
            const res = await axios.get('http://localhost:3000/api/bitacora', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistros(res.data);
            setLoading(false);
        } catch (e) { 
            console.error(e); 
            setLoading(false); 
        }
    };
    fetchBitacora();
  }, []);

  // 2. FILTRADO EN CLIENTE (Buscador)
  const filteredRegistros = registros.filter(reg => 
      reg.nombre_docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.nombre_materia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. FORMATEADOR DE FECHA
  const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-ES', { 
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
      });
  };

  return (
    <div className="fade-in max-w-6xl mx-auto">
      
      {/* HEADER Y BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Bitácora de Uso</h2>
            <p className="text-gray-500">Historial de clases y actividades en el laboratorio.</p>
        </div>
        
        <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400"/>
            </div>
            <input 
                type="text" 
                placeholder="Buscar docente o materia..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary shadow-sm text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* TABLA DE DATOS */}
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
                              <th className="p-5 font-bold">Tipo</th>
                              <th className="p-5 font-bold text-right">Acciones</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                          {filteredRegistros.map((reg) => (
                              <tr key={reg.id} className="hover:bg-blue-50/30 transition-colors">
                                  
                                  {/* COLUMNA: FECHA */}
                                  <td className="p-5">
                                      <div className="flex items-center gap-3 font-medium text-cuchi-text">
                                          <div className="bg-blue-50 p-2 rounded-lg text-cuchi-primary">
                                              <Calendar size={18}/>
                                          </div>
                                          <div>
                                              <span className="block capitalize">{formatDate(reg.fecha)}</span>
                                              <span className="text-xs text-gray-400 font-normal flex items-center gap-1 mt-1">
                                                  <Clock size={10}/> {reg.hora_entrada} - {reg.hora_salida}
                                              </span>
                                          </div>
                                      </div>
                                  </td>

                                  {/* COLUMNA: DOCENTE */}
                                  <td className="p-5">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                              {reg.nombre_docente.charAt(0)}
                                          </div>
                                          <div>
                                              <span className="block font-bold">{reg.nombre_docente}</span>
                                              <span className="text-xs text-gray-400">{reg.email_docente}</span>
                                          </div>
                                      </div>
                                  </td>

                                  {/* COLUMNA: MATERIA */}
                                  <td className="p-5">
                                      <span className="font-semibold text-cuchi-primary block">{reg.nombre_materia}</span>
                                      <span className="text-xs text-gray-400 block mb-1">{reg.carrera || 'General'}</span>
                                      {reg.tema_visto && (
                                          <div className="text-xs bg-gray-50 px-2 py-1 rounded w-fit text-gray-500 border border-gray-100 truncate max-w-[150px]" title={reg.tema_visto}>
                                              {reg.tema_visto}
                                          </div>
                                      )}
                                  </td>

                                  {/* COLUMNA: TIPO (Práctica/Teórica) */}
                                  <td className="p-5">
                                      {reg.tipo_clase === 'practica' ? (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wide border border-purple-200">
                                              <Briefcase size={12}/> Práctica
                                          </span>
                                      ) : (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide border border-gray-200">
                                              <BookOpen size={12}/> Teórica
                                          </span>
                                      )}
                                  </td>

                                  {/* COLUMNA: ACCIONES (Ver Detalle) */}
                                  <td className="p-5 text-right">
                                      <button 
                                        onClick={() => navigate(`/admin/bitacora/${reg.id}`)} 
                                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-cuchi-primary hover:text-white hover:border-cuchi-primary transition-all shadow-sm"
                                        title="Ver Detalle Completo"
                                      >
                                          <Eye size={18}/>
                                      </button>
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