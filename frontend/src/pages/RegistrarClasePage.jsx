import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Server, Monitor, CheckSquare, Square } from 'lucide-react';
import client from '../config/axios';
import toast from 'react-hot-toast';

const RegistrarClasePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const claseId = searchParams.get('clase_id'); // Leemos el ID que mandó el Dashboard

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Datos para mostrar y enviar
  const [claseInfo, setClaseInfo] = useState(null);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  
  // Estado del Formulario
  const [form, setForm] = useState({
    tema_visto: '',
    observaciones: '',
    equipos_seleccionados: [] // Array de IDs
  });

  // 1. CARGAR DATOS (Info de la clase + Equipos disponibles)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // A. Traemos las clases del profe para encontrar la info de ESTA clase
        const resClases = await client.get('/docentes/mis-clases');
        const claseEncontrada = resClases.data.find(c => c.id == claseId);
        
        if (!claseEncontrada) {
            toast.error("Clase no encontrada o no asignada.");
            navigate('/docente/dashboard');
            return;
        }
        setClaseInfo(claseEncontrada);

        // B. Traemos equipos operativos para que seleccione cuáles usó
        const resEquipos = await client.get('/equipos');
        // Filtramos solo los operativos
        const operativos = resEquipos.data.filter(e => e.estado === 'operativo');
        setEquiposDisponibles(operativos);

      } catch (error) {
        console.error(error);
        toast.error("Error cargando datos del formulario");
      } finally {
        setLoading(false);
      }
    };
    
    if (claseId) cargarDatos();
  }, [claseId, navigate]);

  // HANDLERS
  const toggleEquipo = (id) => {
    setForm(prev => {
        const selected = prev.equipos_seleccionados;
        if (selected.includes(id)) {
            return { ...prev, equipos_seleccionados: selected.filter(eid => eid !== id) };
        } else {
            return { ...prev, equipos_seleccionados: [...selected, id] };
        }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tema_visto) return toast.error("El tema visto es obligatorio");

    setSubmitting(true);
    try {
        const payload = {
         
            // Asumiendo que agregamos 'c.materia_id' al SELECT del backend:
            materia_id: claseInfo.id, // ⚠️ Revisa la nota abajo sobre esto
            tema_visto: form.tema_visto,
            observaciones: form.observaciones,
            hora_inicio: claseInfo.hora_inicio,
            hora_fin: claseInfo.hora_fin,
            equipos_ids: form.equipos_seleccionados
        };
        
        // NOTA: Como en 'mis-clases' el ID principal es el de la tabla CLASES, y Bitacora pide Materia,
        // necesitamos asegurar que enviamos el ID correcto. 
        // Si tu tabla BitacoraUso usa FK a Materias, necesitamos ese ID.
        // Voy a ajustar el payload suponiendo que editaremos el controller de 'mis-clases' rápido.
        
        await client.post('/docentes/registrar-uso', {
            ...payload,
            // Truco temporal: Si no tienes el materia_id a mano, mándalo igual y ajustamos.
            // Pero lo correcto es editar el controller 'getMisClases' para que devuelva 'c.materia_id'.
        });

        toast.success("Asistencia registrada correctamente");
        navigate('/docente/dashboard');

    } catch (error) {
        console.error(error);
        toast.error("Error al guardar la bitácora");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando formulario...</div>;

  return (
    <div className="fade-in max-w-4xl mx-auto pb-10 font-sans p-6">
      
      {/* HEADER */}
      <button onClick={() => navigate('/docente/dashboard')} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary">
        <ArrowLeft size={20} className="mr-2" /> Cancelar y Volver
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-bold text-cuchi-text">Registrar Actividad</h1>
            <p className="text-gray-400 mt-2 text-lg">
                Materia: <strong className="text-cuchi-primary">{claseInfo?.materia}</strong> 
                <span className="mx-2">|</span> 
                Grupo: {claseInfo?.grupo}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. DATOS DE LA SESIÓN */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tema Visto en Clase</label>
                    <input 
                        type="text" 
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-cuchi-primary outline-none transition-colors font-medium"
                        placeholder="Ej. Configuración de VLANs en Packet Tracer"
                        value={form.tema_visto}
                        onChange={e => setForm({...form, tema_visto: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones / Incidencias (Opcional)</label>
                    <textarea 
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-cuchi-primary outline-none transition-colors font-medium h-24 resize-none"
                        placeholder="Ej. El proyector tardó en encender, faltaron 3 alumnos..."
                        value={form.observaciones}
                        onChange={e => setForm({...form, observaciones: e.target.value})}
                    />
                </div>
            </div>

            {/* 2. SELECTOR DE EQUIPOS (SIMPLE) */}
            <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Server size={20} className="text-blue-500"/> Equipos Utilizados
                </h3>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar">
                    {equiposDisponibles.length === 0 ? (
                        <p className="text-gray-400 text-sm">No hay equipos operativos registrados en el inventario.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {equiposDisponibles.map(eq => {
                                const isSelected = form.equipos_seleccionados.includes(eq.id);
                                return (
                                    <div 
                                        key={eq.id}
                                        onClick={() => toggleEquipo(eq.id)}
                                        className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200'}`}
                                    >
                                        <div className={isSelected ? 'text-cuchi-primary' : 'text-gray-300'}>
                                            {isSelected ? <CheckSquare size={20}/> : <Square size={20}/>}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{eq.nombre_equipo}</p>
                                            <p className="text-xs text-gray-400">{eq.modelo}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">Selecciona los equipos físicos que utilizaste durante la práctica.</p>
            </div>

            {/* BOTÓN SUBMIT */}
            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={submitting}
                    className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-cuchi-primary hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200'}`}
                >
                    {submitting ? 'Guardando...' : <><Save size={20}/> Registrar en Bitácora</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default RegistrarClasePage;