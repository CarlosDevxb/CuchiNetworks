import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, User, Clock, BookOpen, X, Save, Edit, AlertCircle, Check, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const DocentesPage = () => {
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const toast = useToast();
  
  // Formulario
  const [form, setForm] = useState({
      nombre: '', email: '', password: '', horario_entrada: '', horario_salida: '', materias_ids: []
  });

  // Buscador interno de materias en el modal
  const [searchMateria, setSearchMateria] = useState('');

  // VALIDACIÓN DE HORARIO EN TIEMPO REAL
  const isTimeInvalid = form.horario_entrada && form.horario_salida && form.horario_salida <= form.horario_entrada;

  // --- CARGAR DATOS ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('cuchi_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resDocentes, resMaterias] = await Promise.all([
          axios.get('http://localhost:3000/api/docentes', config),
          axios.get('http://localhost:3000/api/materias', config)
      ]);
      
      setDocentes(resDocentes.data);
      setMaterias(resMaterias.data);
      setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- MANEJO DEL MODAL ---
  const openModal = (docente = null) => {
      if (docente) {
          setEditingDocente(docente);
          setForm({
              id: docente.id,
              nombre: docente.nombre,
              email: docente.email,
              password: '', 
              horario_entrada: docente.horario_entrada || '',
              horario_salida: docente.horario_salida || '',
              materias_ids: docente.materias_asignadas.map(m => m.id)
          });
      } else {
          setEditingDocente(null);
          setForm({ nombre: '', email: '', password: '', horario_entrada: '', horario_salida: '', materias_ids: [] });
      }
      setSearchMateria('');
      setIsModalOpen(true);
  };

  const toggleMateria = (materiaId) => {
      const id = parseInt(materiaId);
      if (form.materias_ids.includes(id)) {
          setForm({ ...form, materias_ids: form.materias_ids.filter(x => x !== id) });
      } else {
          setForm({ ...form, materias_ids: [...form.materias_ids, id] });
      }
  };

  // --- GUARDAR ---
  const handleSave = async (e) => {
      e.preventDefault();
      if (isTimeInvalid) return; // Doble seguridad

      try {
          const token = localStorage.getItem('cuchi_token');
          await axios.post('http://localhost:3000/api/docentes', form, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setIsModalOpen(false);
          fetchData(); 
          toast.success(editingDocente ? "Docente actualizado" : "Docente registrado");
      } catch (error) {
          const msg = error.response?.data?.message || "Error al guardar";
          toast.error(msg);
      }
  };

  // Filtrar materias en el modal
  const filteredMaterias = materias.filter(m => m.nombre.toLowerCase().includes(searchMateria.toLowerCase()));

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Plantilla Docente</h2>
            <p className="text-gray-500">Gestiona a los profesores y sus asignaturas.</p>
        </div>
        <button onClick={() => openModal()} className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={20}/> Nuevo Docente
        </button>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? <p className="text-gray-400">Cargando...</p> : docentes.map(d => (
              <div key={d.id} onClick={() => openModal(d)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-cuchi-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-cuchi-primary flex items-center justify-center font-bold text-2xl shadow-inner">
                          {d.nombre.charAt(0)}
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">{d.nombre}</h3>
                          <p className="text-xs text-gray-400 mt-1">{d.email}</p>
                      </div>
                  </div>
                  
                  <div className="space-y-3 border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg w-fit">
                          <Clock size={16} className="text-cuchi-primary"/>
                          <span className="font-medium">{d.horario_entrada ? `${d.horario_entrada} - ${d.horario_salida}` : 'Sin horario'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                          <BookOpen size={16} className="text-gray-400 mt-1.5 min-w-[16px]"/>
                          <div className="flex flex-wrap gap-1">
                              {d.materias_asignadas.length > 0 ? d.materias_asignadas.slice(0, 3).map(m => (
                                  <span key={m.id} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-xs font-bold border border-purple-100">
                                      {m.nombre}
                                  </span>
                              )) : <span className="italic text-gray-400">Sin asignaciones</span>}
                              {d.materias_asignadas.length > 3 && (
                                  <span className="text-xs text-gray-400 self-center">+{d.materias_asignadas.length - 3} más</span>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* MODAL MEJORADO */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem]">
                      <div>
                          <h2 className="text-2xl font-bold text-cuchi-text flex items-center gap-2">
                              {editingDocente ? 'Editar Perfil' : 'Registrar Docente'}
                          </h2>
                          <p className="text-xs text-gray-400 mt-1">Información personal y académica</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors">
                          <X size={20}/>
                      </button>
                  </div>

                  {/* Modal Body (Scrollable) */}
                  <div className="p-8 overflow-y-auto custom-scrollbar">
                      <form id="docenteForm" onSubmit={handleSave} className="space-y-8">
                          
                          {/* SECCIÓN 1: DATOS */}
                          <div className="space-y-4">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Credenciales</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Nombre Completo</label>
                                      <input type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="input-modal" placeholder="Ej. Juan Pérez"/>
                                  </div>
                                  <div>
                                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Correo Institucional</label>
                                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-modal" placeholder="nombre@cuchi.net"/>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-sm font-semibold text-gray-700 mb-1 block">{editingDocente ? "Nueva Contraseña (Opcional)" : "Contraseña"}</label>
                                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-modal" placeholder="••••••••"/>
                              </div>
                          </div>

                          {/* SECCIÓN 2: HORARIO INTELIGENTE */}
                          <div className={`p-5 rounded-2xl border transition-colors ${isTimeInvalid ? 'bg-red-50 border-red-200' : 'bg-blue-50/50 border-blue-100'}`}>
                              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isTimeInvalid ? 'text-red-500' : 'text-cuchi-primary'}`}>
                                  <Clock size={16}/> Disponibilidad en Laboratorio
                              </h4>
                              
                              <div className="grid grid-cols-2 gap-5">
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 mb-1 block">Hora Entrada</label>
                                      <input 
                                        type="time" 
                                        value={form.horario_entrada} 
                                        onChange={e => setForm({...form, horario_entrada: e.target.value})} 
                                        className="input-modal bg-white"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 mb-1 block">Hora Salida</label>
                                      <input 
                                        type="time" 
                                        value={form.horario_salida} 
                                        // AQUÍ ESTÁ LA MAGIA: El min impide seleccionar horas anteriores en el picker
                                        min={form.horario_entrada} 
                                        onChange={e => setForm({...form, horario_salida: e.target.value})} 
                                        className={`input-modal bg-white ${isTimeInvalid ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-200' : ''}`}
                                      />
                                  </div>
                              </div>
                              
                              {/* MENSAJE DE ERROR VISUAL */}
                              {isTimeInvalid && (
                                  <div className="mt-3 flex items-center gap-2 text-red-600 text-xs font-bold animate-pulse">
                                      <AlertCircle size={14}/>
                                      <span>La hora de salida debe ser posterior a la entrada.</span>
                                  </div>
                              )}
                          </div>

                          {/* SECCIÓN 3: MATERIAS */}
                          <div>
                              <div className="flex justify-between items-end mb-3">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Asignar Materias ({form.materias_ids.length})</h4>
                                  <div className="relative">
                                      <Search size={14} className="absolute left-2 top-2 text-gray-400"/>
                                      <input 
                                        type="text" 
                                        placeholder="Filtrar..." 
                                        className="pl-7 pr-3 py-1 text-xs border rounded-lg outline-none focus:border-cuchi-primary"
                                        value={searchMateria}
                                        onChange={(e) => setSearchMateria(e.target.value)}
                                      />
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-100 p-2 rounded-xl bg-gray-50/30 custom-scrollbar">
                                  {filteredMaterias.map(mat => {
                                      const isSelected = form.materias_ids.includes(mat.id);
                                      return (
                                          <label key={mat.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-cuchi-primary text-white border-cuchi-primary shadow-md transform scale-[1.02]' : 'bg-white border-gray-100 hover:border-cuchi-primary text-gray-600 hover:bg-blue-50'}`}>
                                              <div className="flex items-center gap-3">
                                                  <input 
                                                    type="checkbox" 
                                                    className="hidden"
                                                    checked={isSelected}
                                                    onChange={() => toggleMateria(mat.id)}
                                                  />
                                                  <span className="text-sm font-semibold">{mat.nombre}</span>
                                              </div>
                                              {isSelected && <Check size={16} strokeWidth={3}/>}
                                          </label>
                                      );
                                  })}
                                  {filteredMaterias.length === 0 && <p className="text-xs text-gray-400 text-center col-span-2 py-2">No se encontraron materias.</p>}
                              </div>
                          </div>

                      </form>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] flex justify-end gap-3">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">
                          Cancelar
                      </button>
                      <button 
                        type="submit" 
                        form="docenteForm" 
                        disabled={isTimeInvalid} // BOTÓN DESHABILITADO SI LA HORA ESTÁ MAL
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2
                            ${isTimeInvalid ? 'bg-gray-400 cursor-not-allowed' : 'bg-cuchi-primary hover:bg-blue-700 hover:-translate-y-1'}`}
                      >
                          <Save size={18}/> Guardar
                      </button>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .input-modal { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E2E8F0; border-radius: 0.75rem; outline: none; transition: all 0.2s; font-size: 0.95rem; color: #334155; }
        .input-modal:focus { border-color: #4180AB; box-shadow: 0 0 0 3px rgba(65, 128, 171, 0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default DocentesPage;