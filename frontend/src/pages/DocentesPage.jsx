import { useEffect, useState } from 'react';
import { Plus, User, Clock, BookOpen, X, Save, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import client from '../config/axios';
import ConfirmModal from '../components/ConfirmModal';
import { createPortal } from 'react-dom';

const DocentesPage = () => {
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  
  const [form, setForm] = useState({
      nombre: '', email: '', password: ''
  });

  const [newClase, setNewClase] = useState({
      materia_id: '', grupo: '', dia_semana: 'Lunes', hora_inicio: '', hora_fin: ''
  });
  const [clasesDelProfe, setClasesDelProfe] = useState([]);

  const toast = useToast();

  const fetchData = async () => {
    try {
      const [resDocentes, resMaterias] = await Promise.all([
          client.get('/docentes'),
          client.get('/materias')
      ]);
      setDocentes(resDocentes.data);
      setMaterias(resMaterias.data);
      setLoading(false);
    } catch (e) { 
        console.error(e); 
        toast.error("Error al cargar datos");
        setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = async (docente = null) => {
      if (docente) {
          setEditingDocente(docente);
          setForm({
              id: docente.id,
              nombre: docente.nombre,
              email: docente.email,
              password: ''
          });
          setClasesDelProfe(docente.clases_asignadas || []);
      } else {
          setEditingDocente(null);
          setForm({ nombre: '', email: '', password: '' });
          setClasesDelProfe([]);
      }
      setIsModalOpen(true);
  };

  const handleSaveDocente = async (e) => {
      e.preventDefault();
      try {
          await client.post('/docentes', form);
          toast.success(editingDocente ? "Datos actualizados" : "Docente registrado");
          if (!editingDocente) {
              setIsModalOpen(false);
              fetchData();
          } else {
              fetchData();
          }
      } catch (error) {
          toast.error(error.response?.data?.message || "Error al guardar");
      }
  };

  const handleAddClase = async () => {
      if (!editingDocente) {
          toast.warning("Primero guarda al docente.");
          return;
      }
      if (!newClase.materia_id || !newClase.hora_inicio || !newClase.hora_fin) {
          toast.warning("Completa los datos de la clase");
          return;
      }
      try {
          await client.post('/clases', { ...newClase, docente_id: editingDocente.id });
          toast.success("Clase agregada");
          fetchData();
          
          const materiaNombre = materias.find(m => m.id == newClase.materia_id)?.nombre;
          setClasesDelProfe([...clasesDelProfe, { ...newClase, materia_nombre: materiaNombre, id: Date.now() }]);
          setNewClase({ ...newClase, grupo: '', hora_inicio: '', hora_fin: '' });
      } catch (error) {
          toast.error(error.response?.data?.message || "Error al agregar clase");
      }
  };

  const handleDeleteClase = async (claseId) => {
      if(!confirm("¿Quitar esta clase?")) return;
      try {
          await client.delete(`/clases/${claseId}`);
          toast.success("Clase eliminada");
          setClasesDelProfe(clasesDelProfe.filter(c => c.id !== claseId));
          fetchData();
      } catch (error) {
          toast.error("Error al eliminar clase");
      }
  };

  const getUniqueMaterias = (clases) => {
      if (!clases || !Array.isArray(clases)) return [];
      const nombres = clases.map(c => c.materia_nombre);
      return [...new Set(nombres)];
  };

  return (
    <div className="fade-in max-w-7xl mx-auto pb-10 font-sans">
      
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Plantilla Docente</h2>
            <p className="text-gray-500">Gestiona profesores y sus asignaciones de horarios.</p>
        </div>
        <button onClick={() => openModal()} className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={20}/> Nuevo Docente
        </button>
      </div>

      {/* GRID TARJETAS */}
      {loading ? <div className="text-center p-10 text-gray-400">Cargando docentes...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docentes.map(d => {
                const uniqueMaterias = getUniqueMaterias(d.clases_asignadas);
                return (
                    <div key={d.id} onClick={() => openModal(d)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-cuchi-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-cuchi-primary flex items-center justify-center font-bold text-2xl shadow-inner">
                                {d.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg leading-tight truncate w-40">{d.nombre}</h3>
                                <p className="text-xs text-gray-400 mt-1">{d.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 border-t border-gray-50 pt-4">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <BookOpen size={16} className="text-gray-400 mt-1.5 min-w-[16px]"/>
                                <div className="flex flex-wrap gap-1">
                                    {uniqueMaterias.length > 0 ? uniqueMaterias.slice(0, 2).map((m, idx) => (
                                        <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-xs font-bold border border-purple-100 truncate max-w-[150px]">
                                            {m}
                                        </span>
                                    )) : <span className="italic text-gray-400">Sin clases asignadas</span>}
                                    {uniqueMaterias.length > 2 && <span className="text-xs text-gray-400 self-center">+{uniqueMaterias.length - 2}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

     {/* ... (Tu Grid de tarjetas termina aquí) ... */}

      {/* --- MODAL CON PORTAL (Teletransportado al Body) --- */}
      {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
              
              {/* Overlay Oscuro */}
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

              {/* Contenedor del Modal */}
              <div className="relative bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
                  
                  {/* HEADER (Fijo) */}
                  <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                      <div>
                          <h2 className="text-2xl font-bold text-cuchi-text flex items-center gap-2">
                              {editingDocente ? 'Editar Docente' : 'Registrar Docente'}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium mt-1">
                              {editingDocente ? 'Gestión de perfil y horarios.' : 'Ingresa la información básica.'}
                          </p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-gray-100">
                          <X size={20}/>
                      </button>
                  </div>

                  {/* BODY (Con Scroll) */}
                  <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                      
                      {/* FORMULARIO DATOS PERSONALES */}
                      <form id="docenteForm" onSubmit={handleSaveDocente} className="space-y-6">
                          <div className="bg-white rounded-2xl p-1">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><User size={14}/> Datos Generales</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                      <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1">Nombre Completo</label>
                                      <input type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="input-modal" placeholder="Ej. Juan Pérez"/>
                                  </div>
                                  <div>
                                      <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1">Correo Institucional</label>
                                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-modal" placeholder="nombre@cuchi.net"/>
                                  </div>
                              </div>
                              <div className="mt-4">
                                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1">{editingDocente ? "Nueva Contraseña (Opcional)" : "Contraseña"}</label>
                                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-modal" placeholder="••••••••"/>
                              </div>
                              
                              <div className="flex justify-end mt-4 pt-4 border-t border-gray-50">
                                  <button type="submit" className="bg-cuchi-primary/10 text-cuchi-primary border border-cuchi-primary/20 px-6 py-2 rounded-xl font-bold text-sm hover:bg-cuchi-primary hover:text-white transition-all">
                                      {editingDocente ? 'Actualizar Información' : 'Guardar y Continuar'}
                                  </button>
                              </div>
                          </div>
                      </form>

                      {/* SECCIÓN DE CLASES */}
                      {editingDocente && (
                          <div className="mt-8 pt-6 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-bold text-cuchi-text uppercase tracking-wider flex items-center gap-2">
                                      <Clock size={18} className="text-cuchi-primary"/> Horario de Clases
                                  </h4>
                                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold">{clasesDelProfe.length} clases</span>
                              </div>
                              
                              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mb-6 shadow-inner">
                                  <div className="grid grid-cols-12 gap-3 items-end">
                                      <div className="col-span-12 md:col-span-4">
                                          <label className="lbl-mini">Materia</label>
                                          <select className="input-mini w-full bg-white" value={newClase.materia_id} onChange={e => setNewClase({...newClase, materia_id: e.target.value})}>
                                              <option value="">Seleccionar...</option>
                                              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                          </select>
                                      </div>
                                      <div className="col-span-6 md:col-span-2">
                                          <label className="lbl-mini">Grupo</label>
                                          <input type="text" className="input-mini w-full bg-white" placeholder="4A" value={newClase.grupo} onChange={e => setNewClase({...newClase, grupo: e.target.value})}/>
                                      </div>
                                      <div className="col-span-6 md:col-span-2">
                                          <label className="lbl-mini">Día</label>
                                          <select className="input-mini w-full bg-white" value={newClase.dia_semana} onChange={e => setNewClase({...newClase, dia_semana: e.target.value})}>
                                              {['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'].map(d => <option key={d} value={d}>{d}</option>)}
                                          </select>
                                      </div>
                                      <div className="col-span-6 md:col-span-2">
                                          <label className="lbl-mini">Inicio</label>
                                          <input type="time" className="input-mini w-full bg-white" value={newClase.hora_inicio} onChange={e => setNewClase({...newClase, hora_inicio: e.target.value})}/>
                                      </div>
                                      <div className="col-span-6 md:col-span-2 flex gap-1">
                                          <div className="w-full">
                                              <label className="lbl-mini">Fin</label>
                                              <input type="time" className="input-mini w-full bg-white" value={newClase.hora_fin} onChange={e => setNewClase({...newClase, hora_fin: e.target.value})}/>
                                          </div>
                                          <button onClick={handleAddClase} className="bg-cuchi-primary text-white rounded-lg mt-auto hover:bg-blue-700 h-[38px] w-[38px] flex items-center justify-center shadow-md transition-transform active:scale-95">
                                              <Plus size={20}/>
                                          </button>
                                      </div>
                                  </div>
                              </div>

                              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                  <table className="w-full text-xs text-left">
                                      <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                                          <tr>
                                              <th className="p-4">Materia</th>
                                              <th className="p-4 text-center">Gpo</th>
                                              <th className="p-4 text-center">Día</th>
                                              <th className="p-4 text-center">Horario</th>
                                              <th className="p-4 text-right">Acción</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 bg-white text-gray-600">
                                          {clasesDelProfe.map(c => (
                                              <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                                                  <td className="p-4 font-bold text-cuchi-text">{c.materia_nombre}</td>
                                                  <td className="p-4 text-center"><span className="bg-gray-100 px-2 py-1 rounded font-mono">{c.grupo}</span></td>
                                                  <td className="p-4 text-center">{c.dia}</td>
                                                  <td className="p-4 text-center font-medium text-cuchi-primary">{c.inicio?.slice(0,5)} - {c.fin?.slice(0,5)}</td>
                                                  <td className="p-4 text-right">
                                                      <button onClick={() => handleDeleteClase(c.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                                  </td>
                                              </tr>
                                          ))}
                                          {clasesDelProfe.length === 0 && (
                                              <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic bg-gray-50/30">Este docente aún no tiene clases asignadas.</td></tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>,
          document.body // <--- ESTO ES LO IMPORTANTE: Se renderiza en el BODY
      )}

      {/* Styles... */}
      <style>{`
        .input-modal { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E2E8F0; border-radius: 0.75rem; outline: none; transition: all 0.2s; color: #334155; }
        .input-modal:focus { border-color: #4180AB; box-shadow: 0 0 0 3px rgba(65, 128, 171, 0.1); }
        .input-mini { padding: 0.6rem; border: 1px solid #CBD5E1; border-radius: 0.6rem; outline: none; font-size: 0.85rem; font-weight: 500; color: #334155; transition: border-color 0.2s; }
        .input-mini:focus { border-color: #4180AB; ring: 2px solid #4180AB; }
        .lbl-mini { font-size: 0.65rem; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 0.25rem; display: block; letter-spacing: 0.05em; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default DocentesPage;