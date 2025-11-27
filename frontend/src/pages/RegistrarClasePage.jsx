import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Save, CheckCircle, Server, Monitor, Layout } from 'lucide-react';
import client from '../config/axios';

const RegistrarClasePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    materia_id: '',
    tipo_clase: 'teorica',
    hora_entrada: '',
    hora_salida: '',
    tema_visto: '',
    observaciones: '',
    equipos_ids: []
  });

  // Catálogos
  const [materias, setMaterias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]); // Para filtrar equipos por zona
  const [equiposPorUbicacion, setEquiposPorUbicacion] = useState([]); // Equipos a mostrar
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');

  // 1. Cargar Materias y Ubicaciones al inicio
  useEffect(() => {
    const initData = async () => {
        const token = localStorage.getItem('cuchi_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [resMat, resUb] = await Promise.all([
                client.get('/materias', config),
                client.get('/ubicaciones', config)
            ]);
            setMaterias(resMat.data);
            setUbicaciones(resUb.data);
        } catch (e) { console.error(e); }
    };
    initData();
  }, []);

  // 2. Cargar equipos cuando selecciona una ubicación (Para clase práctica)
  const handleUbicacionChange = async (e) => {
      const id = e.target.value;
      setUbicacionSeleccionada(id);
      if(!id) { setEquiposPorUbicacion([]); return; }

      try {
          const token = localStorage.getItem('cuchi_token');
          // Reutilizamos el endpoint que te trae ubicación + sus equipos
          const res = await client.get(`/ubicaciones/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setEquiposPorUbicacion(res.data.equipos || []);
      } catch (e) { console.error(e); }
  };

  // 3. Manejar selección de equipos (Checkboxes)
  const toggleEquipo = (id) => {
      const currentIds = formData.equipos_ids;
      if (currentIds.includes(id)) {
          setFormData({ ...formData, equipos_ids: currentIds.filter(x => x !== id) });
      } else {
          setFormData({ ...formData, equipos_ids: [...currentIds, id] });
      }
  };

  // 4. Submit
  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const token = localStorage.getItem('cuchi_token');
          await client.post('/bitacora', formData, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Clase registrada correctamente");
          navigate('/docente/dashboard');
      } catch (error) {
          toast.error("Error al registrar la clase");
      } finally { setLoading(false); }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto pb-10">
      <h2 className="text-3xl font-bold text-cuchi-text mb-6">Registrar Actividad</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          
          {/* DATOS GENERALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="text-label">Materia</label>
                  <select required className="input-std" value={formData.materia_id} onChange={e => setFormData({...formData, materia_id: e.target.value})}>
                      <option value="">Selecciona materia...</option>
                      {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-label">Tipo de Clase</label>
                  <div className="flex gap-4 mt-2">
                      <label className={`cursor-pointer px-4 py-2 rounded-xl border transition-all ${formData.tipo_clase === 'teorica' ? 'bg-blue-50 border-cuchi-primary text-cuchi-primary font-bold' : 'border-gray-200 text-gray-500'}`}>
                          <input type="radio" className="hidden" name="tipo" value="teorica" checked={formData.tipo_clase === 'teorica'} onChange={() => setFormData({...formData, tipo_clase: 'teorica'})}/>
                          📖 Teórica
                      </label>
                      <label className={`cursor-pointer px-4 py-2 rounded-xl border transition-all ${formData.tipo_clase === 'practica' ? 'bg-purple-50 border-purple-600 text-purple-600 font-bold' : 'border-gray-200 text-gray-500'}`}>
                          <input type="radio" className="hidden" name="tipo" value="practica" checked={formData.tipo_clase === 'practica'} onChange={() => setFormData({...formData, tipo_clase: 'practica'})}/>
                          🛠️ Práctica
                      </label>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
              <div><label className="text-label">Hora Entrada</label><input type="time" required className="input-std" value={formData.hora_entrada} onChange={e => setFormData({...formData, hora_entrada: e.target.value})}/></div>
              <div><label className="text-label">Hora Salida</label><input type="time" required className="input-std" value={formData.hora_salida} onChange={e => setFormData({...formData, hora_salida: e.target.value})}/></div>
          </div>

          <div>
              <label className="text-label">Tema Visto / Actividad</label>
              <input type="text" required placeholder="Ej. Configuración de VLANs" className="input-std" value={formData.tema_visto} onChange={e => setFormData({...formData, tema_visto: e.target.value})}/>
          </div>

          {/* SECCIÓN PRÁCTICA (SELECCIÓN DE EQUIPOS) */}
          {formData.tipo_clase === 'practica' && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 animate-fade-in">
                  <h3 className="text-purple-700 font-bold mb-4 flex items-center gap-2"><Server size={20}/> Registro de Equipos Utilizados</h3>
                  
                  {/* Filtro por Ubicación */}
                  <div className="mb-4">
                      <label className="text-xs font-bold text-gray-400 uppercase">Filtrar por Zona:</label>
                      <select className="input-std mt-1" onChange={handleUbicacionChange} value={ubicacionSeleccionada}>
                          <option value="">-- Selecciona una Isla/Mesa --</option>
                          {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                      </select>
                  </div>

                  {/* Grid de Equipos (Checkboxes) */}
                  {equiposPorUbicacion.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                          {equiposPorUbicacion.map(eq => (
                              <label key={eq.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.equipos_ids.includes(eq.id) ? 'bg-purple-100 border-purple-500 shadow-sm' : 'bg-white border-gray-200 hover:border-purple-300'}`}>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.equipos_ids.includes(eq.id) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                                      {formData.equipos_ids.includes(eq.id) && <CheckCircle size={14} className="text-white"/>}
                                  </div>
                                  <div>
                                      <span className="block text-sm font-bold text-gray-700">{eq.nombre_equipo}</span>
                                      <span className="text-xs text-gray-400">{eq.posicion_fisica || eq.modelo}</span>
                                  </div>
                                  <input type="checkbox" className="hidden" checked={formData.equipos_ids.includes(eq.id)} onChange={() => toggleEquipo(eq.id)} />
                              </label>
                          ))}
                      </div>
                  ) : (
                      <p className="text-sm text-gray-400 italic text-center py-4">Selecciona una zona para ver equipos disponibles.</p>
                  )}
                  
                  <div className="mt-4 text-right text-sm font-bold text-purple-600">
                      {formData.equipos_ids.length} dispositivos seleccionados en total
                  </div>
              </div>
          )}

          <div>
              <label className="text-label">Observaciones (Opcional)</label>
              <textarea rows="2" className="input-std" placeholder="Incidencias menores, comentarios..." value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})}></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-cuchi-primary text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all flex justify-center gap-2">
              {loading ? 'Guardando...' : <><Save/> Registrar Clase</>}
          </button>
      </form>
      <style>{`.input-std { width: 100%; padding: 0.75rem; border: 1px solid #E5E7EB; border-radius: 0.75rem; outline: none; } .text-label { display: block; font-size: 0.7rem; font-weight: 800; color: #9CA3AF; text-transform: uppercase; margin-bottom: 0.25rem; }`}</style>
    </div>
  );
};

export default RegistrarClasePage;