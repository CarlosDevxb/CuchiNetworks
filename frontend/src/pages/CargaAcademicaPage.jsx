import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Plus, Search, GraduationCap, X, Save, Clock, Trash2 } from 'lucide-react';
import client from '../config/axios';
import { useToast } from '../context/ToastContext';

const CargaAcademicaPage = () => {
  // CATÁLOGOS
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  
  // DATOS TABLA MAESTRA
  const [allClases, setAllClases] = useState([]); 

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [clasesMateria, setClasesMateria] = useState([]); 

  // FORMULARIO NUEVA CLASE
  const [form, setForm] = useState({
      docente_id: '',
      grupo: '',
      hora_inicio: '',
      hora_fin: '',
      dias: [] 
  });

  const toast = useToast();
  const daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  // Definimos el rango de horas del laboratorio (7am a 9pm)
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // [7, 8, ..., 20]

  // --- CARGA INICIAL ---
  const fetchData = async () => {
    try {
        const [resMat, resDoc, resClases] = await Promise.all([
            client.get('/materias'),
            client.get('/docentes'),
            client.get('/clases')
        ]);
        setMaterias(resMat.data);
        setDocentes(resDoc.data);
        setAllClases(resClases.data);
        setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const refreshMasterTable = async () => {
      try {
          const res = await client.get('/clases');
          setAllClases(res.data);
      } catch (e) { console.error(e); }
  };

  // --- MANEJO DEL MODAL ---
  const handleOpenManage = async (materia) => {
      setSelectedMateria(materia);
      setForm({ docente_id: '', grupo: '', hora_inicio: '', hora_fin: '', dias: [] });
      setIsModalOpen(true);
      
      try {
          const res = await client.get(`/clases?materia_id=${materia.id}`);
          setClasesMateria(res.data);
      } catch (e) { toast.error("Error cargando horarios"); }
  };

  const toggleDia = (dia) => {
      if (form.dias.includes(dia)) {
          setForm({ ...form, dias: form.dias.filter(d => d !== dia) });
      } else {
          setForm({ ...form, dias: [...form.dias, dia] });
      }
  };

  const handleSaveClase = async (e) => {
      e.preventDefault();
      if (form.dias.length === 0) return toast.warning("Selecciona al menos un día.");
      if (form.hora_inicio >= form.hora_fin) return toast.warning("Hora inicio debe ser antes del fin.");

      try {
          const promises = form.dias.map(dia => {
              return client.post('/clases', {
                  materia_id: selectedMateria.id,
                  docente_id: form.docente_id,
                  grupo: form.grupo,
                  dia_semana: dia,
                  hora_inicio: form.hora_inicio,
                  hora_fin: form.hora_fin
              });
          });

          await Promise.all(promises);
          toast.success("Horario asignado");
          
          const res = await client.get(`/clases?materia_id=${selectedMateria.id}`);
          setClasesMateria(res.data);
          refreshMasterTable(); 
          setForm({ ...form, dias: [] });

      } catch (error) {
          const msg = error.response?.data?.message || "Error (Posible conflicto)";
          toast.error(msg);
      }
  };

  const handleDeleteClase = async (id) => {
      if(!confirm("¿Eliminar este horario?")) return;
      try {
          await client.delete(`/clases/${id}`);
          toast.success("Horario eliminado");
          setClasesMateria(clasesMateria.filter(c => c.id !== id));
          refreshMasterTable();
      } catch (e) { toast.error("Error al eliminar"); }
  };

  // --- HELPER PARA ENCONTRAR CLASE EN EL GRID ---
  const findClassForSlot = (day, hour) => {
      return allClases.find(c => {
          // Extraer la hora entera de "10:00:00" -> 10
          const startHour = parseInt(c.hora_inicio.split(':')[0]);
          // Normalizar nombres de días (Miercoles vs Miércoles) si fuera necesario
          return c.dia_semana === day && startHour === hour;
      });
  };

  const filteredMaterias = materias.filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fade-in max-w-[95%] mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Carga Académica</h2>
            <p className="text-gray-500">Asigna docentes y horarios a las materias del semestre.</p>
        </div>
        <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
            <input 
                type="text" placeholder="Buscar materia..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-cuchi-primary outline-none shadow-sm"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* 1. GRID DE MATERIAS (ACCIONES) */}
      {loading ? <div className="text-center p-10 text-gray-400">Cargando...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {filteredMaterias.map(m => (
                  <div key={m.id} onClick={() => handleOpenManage(m)} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start mb-3">
                          <div className="bg-blue-50 text-cuchi-primary p-2 rounded-xl">
                              <BookOpen size={20}/>
                          </div>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg uppercase font-bold">{m.semestre || 'GEN'}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2 h-10 line-clamp-2">{m.nombre}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium pt-2 border-t border-gray-50">
                          <GraduationCap size={12}/> <span className="truncate">{m.carrera}</span>
                      </div>
                  </div>
              ))}
          </div>
      )}

    {/* 2. CALENDARIO MAESTRO (FIXED VIEWPORT) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[65vh] min-h-[500px]">
          
          {/* Header del Calendario (Fijo) */}
          <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between flex-shrink-0 z-30 relative">
              <div>
                  <h3 className="text-lg font-bold text-cuchi-primary flex items-center gap-2">
                      <Clock size={20}/> Horarios del Laboratorio LS5
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Semestre Agosto-Diciembre 2025</p>
              </div>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
                  Vista Semanal
              </span>
          </div>
          
          {/* Cuerpo del Calendario (Scroll Interno) */}
          <div className="overflow-auto flex-1 custom-scrollbar relative bg-white">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                  {/* Encabezados Fijos (Sticky Top) */}
                  <thead className="bg-white sticky top-0 z-20 shadow-sm ring-1 ring-gray-100">
                      <tr>
                          {/* Esquina superior izquierda vacía/hora */}
                          <th className="p-3 border-b border-r border-gray-100 w-20 bg-gray-50 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky left-0 z-30">
                              Hora
                          </th>
                          {daysOfWeek.map(day => (
                              <th key={day} className="p-3 border-b border-gray-100 text-center text-xs font-bold text-cuchi-text w-1/6 uppercase tracking-wider bg-white">
                                  {day}
                              </th>
                          ))}
                      </tr>
                  </thead>
                  
                  {/* Filas (Horas) */}
                  <tbody className="divide-y divide-gray-50">
                      {timeSlots.map(hour => (
                          <tr key={hour} className="group hover:bg-gray-50/50 transition-colors">
                              {/* Columna Hora (Sticky Left) */}
                              <td className="p-2 border-r border-gray-100 bg-gray-50 text-center text-xs font-bold text-gray-400 sticky left-0 z-10 group-hover:bg-gray-100 transition-colors">
                                  {`${hour}:00`}
                              </td>

                              {/* Celdas por Día */}
                              {daysOfWeek.map(day => {
                                  const clase = findClassForSlot(day, hour);
                                  return (
                                      <td key={day} className="p-1 border-r border-dashed border-gray-100 h-20 align-top relative">
                                          {clase ? (
                                              <div className="absolute inset-1 bg-blue-50 border-l-4 border-cuchi-primary p-1.5 rounded-r-md shadow-sm text-xs flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all cursor-default z-0 overflow-hidden">
                                                  <div>
                                                      <span className="font-bold text-cuchi-primary line-clamp-1 text-[11px]" title={clase.materia_nombre}>
                                                          {clase.materia_nombre}
                                                      </span>
                                                      <span className="block text-gray-500 text-[9px] font-medium truncate">
                                                          {clase.docente_nombre}
                                                      </span>
                                                  </div>
                                                  <div className="flex justify-between items-end mt-1">
                                                      <span className="bg-white px-1 py-0.5 rounded text-[9px] font-bold text-gray-600 border border-blue-100">
                                                          {clase.grupo}
                                                      </span>
                                                  </div>
                                              </div>
                                          ) : null}
                                      </td>
                                  );
                              })}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* --- MODAL DE GESTIÓN (Mismo código que tenías) --- */}
      {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                  <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-cuchi-text flex items-center gap-2">
                              <BookOpen size={20} className="text-cuchi-primary"/>
                              {selectedMateria?.nombre}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">Gestión de Horarios - Laboratorio LS5</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full hover:text-red-500 shadow-sm"><X size={20}/></button>
                  </div>

                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* FORMULARIO */}
                      <div className="lg:col-span-1 space-y-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nueva Asignación</h4>
                          <form onSubmit={handleSaveClase} className="space-y-4">
                              <div>
                                  <label className="lbl-mini">Docente</label>
                                  <select required className="input-std w-full" value={form.docente_id} onChange={e => setForm({...form, docente_id: e.target.value})}>
                                      <option value="">Seleccionar...</option>
                                      {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="lbl-mini">Grupo</label>
                                  <input type="text" required placeholder="Ej. 4A" className="input-std w-full" value={form.grupo} onChange={e => setForm({...form, grupo: e.target.value})}/>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div>
                                      <label className="lbl-mini">Inicio</label>
                                      <input type="time" required className="input-std w-full" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})}/>
                                  </div>
                                  <div>
                                      <label className="lbl-mini">Fin</label>
                                      <input type="time" required className="input-std w-full" value={form.hora_fin} onChange={e => setForm({...form, hora_fin: e.target.value})}/>
                                  </div>
                              </div>
                              <div>
                                  <label className="lbl-mini mb-2">Días de Clase</label>
                                  <div className="grid grid-cols-3 gap-2">
                                      {daysOfWeek.map(dia => (
                                          <div key={dia} onClick={() => toggleDia(dia)} className={`cursor-pointer text-[10px] font-bold text-center py-2 rounded-lg border transition-all ${form.dias.includes(dia) ? 'bg-cuchi-primary text-white border-cuchi-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-cuchi-primary'}`}>{dia.slice(0,3)}</div>
                                      ))}
                                  </div>
                              </div>
                              <button type="submit" className="w-full py-3 bg-cuchi-primary text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg mt-4 flex items-center justify-center gap-2"><Plus size={16}/> Agregar Horario</button>
                          </form>
                      </div>

                      {/* LISTA DE CLASES MODAL */}
                      <div className="lg:col-span-2 bg-gray-50/50 rounded-2xl border border-gray-100 p-5 overflow-hidden flex flex-col">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex justify-between">
                              <span>Horarios Asignados</span>
                              <span className="bg-blue-100 text-blue-700 px-2 rounded-md">{clasesMateria.length}</span>
                          </h4>
                          <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                              {clasesMateria.length === 0 ? (
                                  <div className="h-full flex flex-col items-center justify-center text-gray-300"><Clock size={48} className="mb-2 opacity-50"/><p className="text-sm">No hay clases para esta materia.</p></div>
                              ) : (
                                  <div className="space-y-3">
                                      {clasesMateria.map(c => (
                                          <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-full bg-blue-50 text-cuchi-primary flex items-center justify-center font-bold text-sm">{c.grupo}</div>
                                                  <div>
                                                      <p className="text-sm font-bold text-gray-700">{c.docente_nombre}</p>
                                                      <div className="flex items-center gap-2 text-xs text-gray-400"><span className="bg-gray-100 px-1.5 rounded">{c.dia_semana}</span><span>{c.hora_inicio.slice(0,5)} - {c.hora_fin.slice(0,5)}</span></div>
                                                  </div>
                                              </div>
                                              <button onClick={() => handleDeleteClase(c.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}

      <style>{`
        .input-std { padding: 0.6rem; border: 1px solid #E2E8F0; border-radius: 0.6rem; outline: none; font-size: 0.9rem; color: #334155; }
        .input-std:focus { border-color: #4180AB; ring: 2px solid #4180AB; }
        .lbl-mini { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.3rem; display: block; }
      `}</style>
    </div>
  );
};

export default CargaAcademicaPage;