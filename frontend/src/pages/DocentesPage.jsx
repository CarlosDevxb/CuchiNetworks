import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, User, Clock, BookOpen, X, Save, Edit, Trash2, MapPin, Calendar, Users, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import client from '../config/axios';
import ConfirmModal from '../components/ConfirmModal';

const DocentesPage = () => {
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // ESTADOS MODALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  
  // ESTADO FORMULARIO DATOS (Sin password)
  const [form, setForm] = useState({
      nombre: '', email: ''
  });

  // ESTADO NUEVA CLASE
  const [newClase, setNewClase] = useState({
      materia_id: '', grupo: '', dia_semana: 'Lunes', hora_inicio: '', hora_fin: ''
  });
  
  // LISTA LOCAL DE CLASES (Para visualización inmediata)
  const [clasesDelProfe, setClasesDelProfe] = useState([]);

  // VALIDACIÓN DE TIEMPO SIMPLE (Inicio < Fin)
  const isTimeInvalid = newClase.hora_inicio && newClase.hora_fin && newClase.hora_fin <= newClase.hora_inicio;

  // --- CARGA DE DATOS ---
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
        toast.error("Error al cargar la plantilla docente");
        setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ABRIR MODAL ---
  const openModal = (docente = null) => {
      if (docente) {
          setEditingDocente(docente);
          setForm({
              id: docente.id,
              nombre: docente.nombre,
              email: docente.email
          });
          // Aseguramos que sea un array
          setClasesDelProfe(Array.isArray(docente.clases_asignadas) ? docente.clases_asignadas : []);
      } else {
          setEditingDocente(null);
          setForm({ nombre: '', email: '' });
          setClasesDelProfe([]);
      }
      // Resetear formulario de clase nueva
      setNewClase({ materia_id: '', grupo: '', dia_semana: 'Lunes', hora_inicio: '', hora_fin: '' });
      setIsModalOpen(true);
  };

  // --- GUARDAR DOCENTE (Info Básica) ---
  const handleSaveDocente = async (e) => {
      e.preventDefault();
      try {
          await client.post('/docentes', form);
          toast.success(editingDocente ? "Información actualizada" : "Docente registrado");
          
          if (!editingDocente) {
              setIsModalOpen(false); // Si es nuevo cerramos para refrescar ID
              fetchData();
          } else {
              fetchData(); // Si es edición, refrescamos en background
          }
      } catch (error) {
          toast.error(error.response?.data?.message || "Error al guardar");
      }
  };

  // --- AGREGAR CLASE (Con Validación de Empalme) ---
  const handleAddClase = async () => {
      // 1. Validaciones básicas
      if (!editingDocente) {
          toast.warning("Primero guarda los datos del docente.");
          return;
      }
      if (!newClase.materia_id || !newClase.grupo || !newClase.hora_inicio || !newClase.hora_fin) {
          toast.warning("Completa todos los campos del horario.");
          return;
      }
      if (isTimeInvalid) {
          toast.error("El horario es inválido (Inicio debe ser antes del Fin)");
          return;
      }

      // 2. VALIDACIÓN DE TRASLAPE (Frontend - Lógica Matemática)
      // "Si es el mismo día, y (NuevoInicio < ViejoFin) y (NuevoFin > ViejoInicio), entonces chocan."
      const empalme = clasesDelProfe.find(c => 
          c.dia === newClase.dia_semana && 
          (newClase.hora_inicio < c.fin && newClase.hora_fin > c.inicio)
      );

      if (empalme) {
          toast.error(`Conflicto: Ya tiene clase de ${empalme.inicio?.slice(0,5)} a ${empalme.fin?.slice(0,5)} ese día.`);
          return;
      }

      // 3. Enviar al Backend
      try {
          await client.post('/clases', { ...newClase, docente_id: editingDocente.id });
          toast.success("Clase asignada al LS5");
          
          // Actualizar lista localmente para feedback inmediato
          const materiaNombre = materias.find(m => m.id == newClase.materia_id)?.nombre;
          const nuevaClaseVisual = {
              id: Date.now(), // ID temporal
              materia_nombre: materiaNombre,
              grupo: newClase.grupo,
              dia: newClase.dia_semana,
              inicio: newClase.hora_inicio + ":00",
              fin: newClase.hora_fin + ":00"
          };
          
          setClasesDelProfe([...clasesDelProfe, nuevaClaseVisual]);
          fetchData(); // Refrescar datos reales de fondo
          
          // Limpiar inputs
          setNewClase({ ...newClase, grupo: '', hora_inicio: '', hora_fin: '' });

      } catch (error) {
          // Si el backend detecta choque con OTRO profesor en el LS5, aquí saldrá el error
          toast.error(error.response?.data?.message || "Error al asignar clase");
      }
  };

  // --- ELIMINAR CLASE ---
  const handleDeleteClase = async (claseId) => {
      if(!confirm("¿Desvincular esta clase del docente?")) return;
      try {
          await client.delete(`/clases/${claseId}`);
          toast.success("Horario liberado");
          setClasesDelProfe(clasesDelProfe.filter(c => c.id !== claseId));
          fetchData();
      } catch (error) {
          toast.error("Error al eliminar");
      }
  };

  return (
    <div className="fade-in max-w-7xl mx-auto pb-10 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Plantilla Docente</h2>
            <p className="text-gray-500 mt-1">Gestión académica y asignación de horarios en LS5.</p>
        </div>
        <button onClick={() => openModal()} className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-cuchi-primary/20 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={20}/> Nuevo Docente
        </button>
      </div>

      {/* GRID DE TARJETAS (ESTILO NUEVO CON AVATAR) */}
      {loading ? <div className="text-center p-10 text-gray-400">Cargando docentes...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docentes.map(d => (
                <div key={d.id} onClick={() => openModal(d)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cuchi-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-start gap-4 mb-6">
                        {/* AVATAR: FOTO O INICIAL */}
                        <div className="flex-shrink-0">
                            {d.foto_perfil ? (
                                <img src={d.foto_perfil} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"/>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-blue-50 text-cuchi-primary flex items-center justify-center font-bold text-3xl shadow-inner border border-blue-100">
                                    {d.nombre.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">{d.nombre}</h3>
                            <p className="text-xs text-gray-400 mt-1 truncate">{d.email}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-md border border-gray-200">
                                {d.numero_empleado || 'Externo'}
                            </span>
                        </div>
                    </div>
                    
                    {/* RESUMEN DE CLASES */}
                    <div className="space-y-3 pt-4 border-t border-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Carga Académica</p>
                        {d.clases_asignadas && d.clases_asignadas.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {d.clases_asignadas.slice(0, 3).map((c, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50/50 p-2 rounded-lg">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <BookOpen size={14} className="text-cuchi-primary flex-shrink-0"/>
                                            <span className="truncate font-medium text-gray-700">{c.materia_nombre}</span>
                                        </div>
                                        <span className="text-gray-400 font-mono text-[10px]">{c.grupo}</span>
                                    </div>
                                ))}
                                {d.clases_asignadas.length > 3 && (
                                    <p className="text-[10px] text-center text-cuchi-primary font-bold cursor-pointer hover:underline">
                                        Ver {d.clases_asignadas.length - 3} clases más...
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <span className="text-xs text-gray-400 italic">Sin clases asignadas</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- MODAL TELETRANSPORTADO (PORTAL) --- */}
      {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

              <div className="relative bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
                  
                  {/* HEADER MODAL */}
                  <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                      <div>
                          <h2 className="text-2xl font-bold text-cuchi-text flex items-center gap-2">
                              {editingDocente ? 'Expediente Docente' : 'Alta de Docente'}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium mt-1">
                              Administración de perfil y asignación de horarios en Laboratorio.
                          </p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-gray-100">
                          <X size={20}/>
                      </button>
                  </div>

                  {/* BODY CON SCROLL */}
                  <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                      
                      {/* 1. FORMULARIO DATOS (Sin Password) */}
                      <form id="docenteForm" onSubmit={handleSaveDocente} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                          {/* Columna Izquierda: Foto (Placeholder) */}
                          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200 text-4xl font-bold text-gray-300 mb-3">
                                  {form.nombre ? form.nombre.charAt(0).toUpperCase() : <User size={40}/>}
                              </div>
                              <p className="text-xs text-gray-400 text-center">Foto de Perfil<br/>(Gestionada por usuario)</p>
                          </div>

                          {/* Columna Derecha: Inputs */}
                          <div className="md:col-span-2 space-y-5">
                              <div>
                                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1">Nombre Completo</label>
                                  <input type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="input-modal" placeholder="Ej. Juan Pérez"/>
                              </div>
                              <div>
                                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1">Correo Institucional</label>
                                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-modal" placeholder="nombre@cuchi.net"/>
                              </div>
                              <div className="flex justify-end pt-2">
                                  <button type="submit" className="bg-cuchi-primary text-white px-6 py-2 rounded-xl font-bold text-sm shadow hover:bg-blue-700 transition-all">
                                      {editingDocente ? 'Guardar Cambios' : 'Crear Docente'}
                                  </button>
                              </div>
                          </div>
                      </form>

                      {/* 2. SECCIÓN DE CLASES */}
                      {editingDocente && (
                          <div className="border-t border-gray-100 pt-8">
                              <div className="flex items-center justify-between mb-6">
                                  <h4 className="text-sm font-bold text-cuchi-text uppercase tracking-wider flex items-center gap-2">
                                      <Clock size={18} className="text-cuchi-primary"/> Horario de Clases
                                  </h4>
                                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                      <MapPin size={14}/>
                                      <span className="text-xs font-bold">Ubicación: LS5</span>
                                  </div>
                              </div>
                              
                              {/* BARRA DE AGREGAR CLASE */}
                              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6 flex flex-col md:flex-row gap-3 items-end">
                                  <div className="flex-1 w-full">
                                      <label className="lbl-mini">Materia</label>
                                      <select className="input-mini bg-white" value={newClase.materia_id} onChange={e => setNewClase({...newClase, materia_id: e.target.value})}>
                                          <option value="">Seleccionar Asignatura...</option>
                                          {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                      </select>
                                  </div>
                                  <div className="w-24">
                                      <label className="lbl-mini">Grupo</label>
                                      <input type="text" className="input-mini bg-white text-center" placeholder="4A" value={newClase.grupo} onChange={e => setNewClase({...newClase, grupo: e.target.value})}/>
                                  </div>
                                  <div className="w-32">
                                      <label className="lbl-mini">Día</label>
                                      <select className="input-mini bg-white" value={newClase.dia_semana} onChange={e => setNewClase({...newClase, dia_semana: e.target.value})}>
                                          {['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'].map(d => <option key={d} value={d}>{d}</option>)}
                                      </select>
                                  </div>
                                  <div className="w-28">
                                      <label className="lbl-mini">Inicio</label>
                                      <input type="time" className="input-mini bg-white" value={newClase.hora_inicio} onChange={e => setNewClase({...newClase, hora_inicio: e.target.value})}/>
                                  </div>
                                  <div className="w-28">
                                      <label className="lbl-mini">Fin</label>
                                      <input type="time" className={`input-mini bg-white ${isTimeInvalid ? 'border-red-400 text-red-500' : ''}`} value={newClase.hora_fin} onChange={e => setNewClase({...newClase, hora_fin: e.target.value})}/>
                                  </div>
                                  <button onClick={handleAddClase} disabled={isTimeInvalid} className="bg-cuchi-primary text-white rounded-xl h-[38px] w-[44px] flex items-center justify-center shadow-md hover:bg-blue-700 disabled:bg-gray-300 transition-all">
                                      <Plus size={20}/>
                                  </button>
                              </div>

                              {/* TABLA DE CLASES */}
                              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                  <table className="w-full text-sm text-left">
                                      <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                          <tr>
                                              <th className="p-4 pl-6">Asignatura</th>
                                              <th className="p-4 text-center">Grupo</th>
                                              <th className="p-4 text-center">Día</th>
                                              <th className="p-4 text-center">Horario (LS5)</th>
                                              <th className="p-4 text-right pr-6">Acciones</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 bg-white text-gray-600">
                                          {clasesDelProfe.map(c => (
                                              <tr key={c.id} className="hover:bg-blue-50/40 transition-colors group">
                                                  <td className="p-4 pl-6 font-bold text-cuchi-text flex items-center gap-3">
                                                      <div className="p-2 bg-blue-50 rounded-lg text-cuchi-primary"><BookOpen size={16}/></div>
                                                      {c.materia_nombre}
                                                  </td>
                                                  <td className="p-4 text-center">
                                                      <span className="bg-gray-100 px-2 py-1 rounded-md font-mono text-xs font-bold border border-gray-200">{c.grupo}</span>
                                                  </td>
                                                  <td className="p-4 text-center">
                                                      <div className="flex items-center justify-center gap-1">
                                                          <Calendar size={14} className="text-gray-400"/>
                                                          <span>{c.dia}</span>
                                                      </div>
                                                  </td>
                                                  <td className="p-4 text-center font-medium text-cuchi-primary bg-blue-50/20">
                                                      {c.inicio?.slice(0,5)} - {c.fin?.slice(0,5)}
                                                  </td>
                                                  <td className="p-4 text-right pr-6">
                                                      <button onClick={() => handleDeleteClase(c.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Desvincular clase">
                                                          <Trash2 size={18}/>
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))}
                                          {clasesDelProfe.length === 0 && (
                                              <tr>
                                                  <td colSpan="5" className="p-12 text-center">
                                                      <div className="flex flex-col items-center text-gray-300">
                                                          <Users size={48} className="mb-2 opacity-50"/>
                                                          <p className="text-sm font-medium">No tiene clases asignadas en este laboratorio.</p>
                                                      </div>
                                                  </td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>,
          document.body
      )}

      <style>{`
        .input-modal { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E2E8F0; border-radius: 0.75rem; outline: none; transition: all 0.2s; color: #334155; }
        .input-modal:focus { border-color: #4180AB; box-shadow: 0 0 0 3px rgba(65, 128, 171, 0.1); }
        .input-mini { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #CBD5E1; border-radius: 0.6rem; outline: none; font-size: 0.85rem; font-weight: 500; color: #334155; transition: border-color 0.2s; height: 38px; }
        .input-mini:focus { border-color: #4180AB; ring: 2px solid #4180AB; }
        .lbl-mini { font-size: 0.65rem; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 0.35rem; display: block; letter-spacing: 0.05em; padding-left: 2px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default DocentesPage;