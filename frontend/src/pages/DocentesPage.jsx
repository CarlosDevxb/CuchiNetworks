import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, User, Clock, BookOpen, X, Save, Edit } from 'lucide-react';

const DocentesPage = () => {
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]); // Para el combo del modal
  const [loading, setLoading] = useState(true);
  
  // ESTADO DEL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null); // null = creando, obj = editando
  
  // FORMULARIO
  const [form, setForm] = useState({
      nombre: '', email: '', password: '', horario_entrada: '', horario_salida: '', materias_ids: []
  });

  // CARGAR DATOS INICIALES
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('cuchi_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const resDocentes = await axios.get('http://localhost:3000/api/docentes', config);
      const resMaterias = await axios.get('http://localhost:3000/api/materias', config);
      
      setDocentes(resDocentes.data);
      setMaterias(resMaterias.data);
      setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // ABRIR MODAL (Crear o Editar)
  const openModal = (docente = null) => {
      if (docente) {
          setEditingDocente(docente);
          setForm({
              id: docente.id,
              nombre: docente.nombre,
              email: docente.email,
              password: '', // Dejar vacío si no se quiere cambiar
              horario_entrada: docente.horario_entrada || '',
              horario_salida: docente.horario_salida || '',
              materias_ids: docente.materias_asignadas.map(m => m.id) // Extraer IDs
          });
      } else {
          setEditingDocente(null);
          setForm({ nombre: '', email: '', password: '', horario_entrada: '', horario_salida: '', materias_ids: [] });
      }
      setIsModalOpen(true);
  };

  // MANEJAR MATERIAS (Agregar/Quitar del array)
  const toggleMateria = (materiaId) => {
      const id = parseInt(materiaId);
      if (form.materias_ids.includes(id)) {
          setForm({ ...form, materias_ids: form.materias_ids.filter(x => x !== id) });
      } else {
          setForm({ ...form, materias_ids: [...form.materias_ids, id] });
      }
  };

  // GUARDAR
  const handleSave = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('cuchi_token');
          await axios.post('http://localhost:3000/api/docentes', form, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setIsModalOpen(false);
          fetchData(); // Refrescar tarjetas
          alert("Docente guardado correctamente");
      } catch (error) {
          alert("Error al guardar docente");
      }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-cuchi-text">Plantilla Docente</h2>
        <button onClick={() => openModal()} className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all">
            <Plus size={20}/> Nuevo Docente
        </button>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docentes.map(d => (
              <div key={d.id} onClick={() => openModal(d)} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-cuchi-primary flex items-center justify-center font-bold text-xl">
                          {d.nombre.charAt(0)}
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800">{d.nombre}</h3>
                          <p className="text-xs text-gray-400">{d.email}</p>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-gray-400"/>
                          <span>{d.horario_entrada ? `${d.horario_entrada} - ${d.horario_salida}` : 'Sin horario asignado'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                          <BookOpen size={16} className="text-gray-400 mt-1"/>
                          <div className="flex flex-wrap gap-1">
                              {d.materias_asignadas.length > 0 ? d.materias_asignadas.map(m => (
                                  <span key={m.id} className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                                      {m.nombre}
                                  </span>
                              )) : <span className="italic text-gray-400">Sin materias</span>}
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* MODAL DE EDICIÓN */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                  
                  <h2 className="text-2xl font-bold text-cuchi-text mb-6 flex items-center gap-2">
                      {editingDocente ? <Edit className="text-cuchi-primary"/> : <User className="text-cuchi-primary"/>}
                      {editingDocente ? 'Editar Docente' : 'Registrar Nuevo Docente'}
                  </h2>

                  <form onSubmit={handleSave} className="space-y-6">
                      {/* Datos Personales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Nombre Completo" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="input-std"/>
                          <input type="email" placeholder="Correo Institucional" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-std"/>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="password" placeholder={editingDocente ? "Nueva Contraseña (Opcional)" : "Contraseña"} className="input-std" value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
                      </div>

                      {/* Horario */}
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <h4 className="font-bold text-cuchi-primary text-sm mb-2 uppercase flex items-center gap-2"><Clock size={16}/> Horario Base</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs text-gray-500 font-bold">Entrada</label>
                                  <input type="time" value={form.horario_entrada} onChange={e => setForm({...form, horario_entrada: e.target.value})} className="input-std"/>
                              </div>
                              <div>
                                  <label className="text-xs text-gray-500 font-bold">Salida</label>
                                  <input type="time" value={form.horario_salida} onChange={e => setForm({...form, horario_salida: e.target.value})} className="input-std"/>
                              </div>
                          </div>
                      </div>

                      {/* Asignación de Materias */}
                      <div>
                          <h4 className="font-bold text-gray-600 text-sm mb-3 uppercase flex items-center gap-2"><BookOpen size={16}/> Asignar Materias</h4>
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 p-2 rounded-xl">
                              {materias.map(mat => (
                                  <label key={mat.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${form.materias_ids.includes(mat.id) ? 'bg-cuchi-primary/10 border border-cuchi-primary' : 'hover:bg-gray-50'}`}>
                                      <input 
                                        type="checkbox" 
                                        checked={form.materias_ids.includes(mat.id)}
                                        onChange={() => toggleMateria(mat.id)}
                                        className="rounded text-cuchi-primary focus:ring-cuchi-primary"
                                      />
                                      <span className="text-sm font-medium text-gray-700">{mat.nombre}</span>
                                  </label>
                              ))}
                          </div>
                      </div>

                      <button type="submit" className="w-full py-4 bg-cuchi-primary text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all">
                          Guardar Cambios
                      </button>
                  </form>
              </div>
          </div>
      )}

      <style>{`
        .input-std { width: 100%; padding: 0.75rem; border: 1px solid #E5E7EB; border-radius: 0.75rem; outline: none; }
        .input-std:focus { border-color: #4180AB; box-shadow: 0 0 0 2px rgba(65, 128, 171, 0.2); }
      `}</style>
    </div>
  );
};

export default DocentesPage;