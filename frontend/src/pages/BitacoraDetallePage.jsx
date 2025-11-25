import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, User, BookOpen, Server, HardDrive } from 'lucide-react';

const BitacoraDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
        try {
            const token = localStorage.getItem('cuchi_token');
            const res = await axios.get(`http://localhost:3000/api/bitacora/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };
    fetchDetalle();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!data) return <div>No encontrado</div>;

  return (
    <div className="fade-in max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary">
            <ArrowLeft size={20} className="mr-2" /> Volver al Historial
        </button>

        <div className="bg-white rounded-[2rem] shadow-lg p-8 border border-gray-100 mb-8">
            <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-6">
                <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${data.tipo_clase === 'practica' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        Clase {data.tipo_clase}
                    </span>
                    <h1 className="text-3xl font-bold text-cuchi-text mt-2">{data.tema_visto}</h1>
                    <p className="text-gray-400 text-lg">{data.nombre_materia}</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-cuchi-primary font-bold justify-end">
                        <Calendar size={18}/> {new Date(data.fecha).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 justify-end mt-1">
                        <Clock size={16}/> {data.hora_entrada} - {data.hora_salida}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    {data.nombre_docente.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-700">Docente: {data.nombre_docente}</p>
                    <p className="text-xs text-gray-400">Responsable de la sesión</p>
                </div>
            </div>

            {data.observaciones && (
                <div className="text-sm text-gray-600 italic border-l-4 border-gray-200 pl-4">
                    "{data.observaciones}"
                </div>
            )}
        </div>

        {/* SECCIÓN DE EQUIPOS USADOS */}
        {data.tipo_clase === 'practica' && (
            <div>
                <h3 className="text-xl font-bold text-cuchi-text mb-4 flex items-center gap-2">
                    <Server className="text-cuchi-primary"/> Recursos Utilizados ({data.equipos_usados.length})
                </h3>
                
                {data.equipos_usados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.equipos_usados.map(eq => (
                            <div key={eq.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <div className="h-24 bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                                    {eq.imagen_url ? <img src={eq.imagen_url} className="h-full object-contain"/> : <HardDrive size={30} className="text-gray-300"/>}
                                    {eq.estado === 'falla' && <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
                                </div>
                                <h4 className="font-bold text-gray-700 text-sm truncate">{eq.nombre_equipo}</h4>
                                <p className="text-xs text-gray-400">{eq.posicion_fisica}</p>
                                <p className="text-[10px] text-cuchi-primary bg-blue-50 px-2 py-1 rounded w-fit mt-2 uppercase font-bold">{eq.tipo}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No se registraron equipos en esta práctica.</p>
                )}
            </div>
        )}
    </div>
  );
};

export default BitacoraDetallePage;