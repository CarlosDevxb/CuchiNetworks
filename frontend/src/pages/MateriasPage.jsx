import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; // <--- IMPORTANTE: Para el portal
import { BookOpen, Plus, Loader2, Save, X, Edit, Trash2, GraduationCap, Layers } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal'; 
import client from '../config/axios';

const MateriasPage = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [editingMateria, setEditingMateria] = useState(null);
  const [materiaToDelete, setMateriaToDelete] = useState(null);

  const [form, setForm] = useState({ nombre: '', carrera: '', semestre: '' });

  const carrerasOptions = [
      "Ingeniería en Sistemas Computacionales",
      "Ingeniería Industrial",
      "Ingeniería en Mecatrónica",
      "Ingeniería en Gestión Empresarial",
      "Licenciatura en Administración",
      "Tronco Común / Ciencias Básicas"
  ];

  const fetchMaterias = async () => {
    try {
      const res = await client.get('/materias');
      setMaterias(res.data);
      setLoading(false);
    } catch (e) { 
        console.error(e); 
        toast.error("Error al cargar el catálogo");
        setLoading(false); 
    }
  };

  useEffect(() => { fetchMaterias(); }, []);

  const openModal = (materia = null) => {
      if (materia) {
          setEditingMateria(materia);
          setForm({ 
              nombre: materia.nombre, 
              carrera: materia.carrera, 
              semestre: materia.semestre || '' 
          });
      } else {
          setEditingMateria(null);
          setForm({ nombre: '', carrera: '', semestre: '' });
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.carrera) {
        toast.warning("Por favor selecciona una carrera/área.");
        return;
    }

    try {
      if (editingMateria) {
          await client.put(`/materias/${editingMateria.id}`, form);
          toast.success("Materia actualizada correctamente");
      } else {
          await client.post('/materias', form);
          toast.success("Materia creada exitosamente");
      }
      setIsModalOpen(false);
      fetchMaterias(); 
    } catch (error) {
      const msg = error.response?.data?.message || "Error al procesar la solicitud";
      toast.error(msg);
    }
  };

  const handleDeleteClick = () => {
      setIsModalOpen(false); 
      setMateriaToDelete(editingMateria); 
      setShowConfirm(true); 
  };

  const confirmDelete = async () => {
      if (!materiaToDelete) return;
      try {
          await client.delete(`/materias/${materiaToDelete.id}`);
          toast.success(`Materia "${materiaToDelete.nombre}" eliminada.`);
          fetchMaterias(); 
      } catch (error) {
          const msg = error.response?.data?.message || "No se pudo eliminar el registro";
          toast.error(msg);
      } finally {
          setShowConfirm(false);
          setMateriaToDelete(null);
      }
  };

  return (
    <div className="fade-in max-w-7xl mx-auto pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-cuchi-text">Catálogo de Materias</h2>
            <p className="text-gray-500">Administra las asignaturas disponibles para el laboratorio.</p>
        </div>
        <button onClick={() => openModal()} className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={20}/> Nueva Materia
        </button>
      </div>
      
      {/* GRID */}
      {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-cuchi-primary w-10 h-10"/></div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {materias.map(m => (
                <div 
                    key={m.id} 
                    onClick={() => openModal(m)} 
                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-blue-50 text-cuchi-primary p-3 rounded-2xl shadow-inner">
                            <BookOpen size={24} />
                        </div>
                        {m.semestre && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-lg border border-gray-200">
                                {m.semestre}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-cuchi-primary transition-colors">
                        {m.nombre}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mt-auto pt-3 border-t border-gray-50">
                        <GraduationCap size={14} />
                        <span className="truncate" title={m.carrera}>{m.carrera}</span>
                    </div>
                </div>
            ))}
            {materias.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-gray-400 text-lg">No hay materias registradas.</p>
                    <button onClick={() => openModal()} className="mt-4 text-cuchi-primary font-bold hover:underline">
                        Registrar la primera
                    </button>
                </div>
            )}
          </div>
      )}

      {/* --- MODAL CON PORTAL (Para arreglar la superposición) --- */}
      {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

              <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col transform transition-all animate-fade-in max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 rounded-t-[2rem] flex-shrink-0">
                      <div>
                          <h2 className="text-xl font-bold text-cuchi-text flex items-center gap-2">
                              {editingMateria ? <Edit size={20} className="text-cuchi-primary"/> : <Plus size={20} className="text-cuchi-primary"/>}
                              {editingMateria ? 'Editar Materia' : 'Nueva Materia'}
                          </h2>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-gray-100">
                          <X size={20}/>
                      </button>
                  </div>

                  {/* Body (Scrollable) */}
                  <div className="p-8 overflow-y-auto custom-scrollbar">
                      <form id="materiaForm" onSubmit={handleSubmit} className="space-y-6">
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Nombre de la Asignatura</label>
                              <input 
                                type="text" required 
                                placeholder="Ej. Estructura de Datos"
                                value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                                className="input-modal"
                              />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Carrera / Área</label>
                              <select 
                                className="input-modal bg-white"
                                value={form.carrera} onChange={e => setForm({...form, carrera: e.target.value})}
                              >
                                  <option value="">-- Seleccionar --</option>
                                  {carrerasOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2 ml-1">
                                  <Layers size={14}/> Semestre (Opcional)
                              </label>
                              <input 
                                type="text" 
                                placeholder="Ej. 3er Semestre"
                                value={form.semestre} onChange={e => setForm({...form, semestre: e.target.value})}
                                className="input-modal"
                              />
                          </div>
                      </form>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] flex justify-between items-center flex-shrink-0">
                      {editingMateria ? (
                          <button type="button" onClick={handleDeleteClick} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors font-bold flex items-center gap-2 text-sm border border-transparent hover:border-red-100">
                              <Trash2 size={18}/> Eliminar
                          </button>
                      ) : <div></div>}
                      
                      <div className="flex gap-3">
                          <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">
                              Cancelar
                          </button>
                          <button type="submit" form="materiaForm" className="px-6 py-3 rounded-xl font-bold text-white bg-cuchi-primary shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
                              <Save size={18}/> Guardar
                          </button>
                      </div>
                  </div>

              </div>
          </div>,
          document.body // PORTAL AL BODY
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Materia?"
        message={`Estás a punto de eliminar "${materiaToDelete?.nombre}". Esta acción no se puede deshacer.`}
        type="danger"
      />

      <style>{`
        .input-modal { width: 100%; padding: 0.85rem 1rem; border: 1px solid #E2E8F0; border-radius: 0.75rem; outline: none; transition: all 0.2s; color: #334155; font-weight: 600; }
        .input-modal:focus { border-color: #4180AB; box-shadow: 0 0 0 3px rgba(65, 128, 171, 0.1); }
      `}</style>
    </div>
  );
};

export default MateriasPage;