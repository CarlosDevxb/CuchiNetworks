import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Server, HardDrive } from 'lucide-react';
import client from '../config/axios'; // ✅ Usamos solo nuestro cliente configurado

const BitacoraDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
        try {
            // ✅ CORRECCIÓN: Ya no enviamos headers manuales, el cliente lo hace solo.
            const res = await client.get(`/bitacora/${id}`);
            setData(res.data);
            setLoading(false);
        } catch (e) { 
            console.error("Error cargando bitácora:", e); 
            setLoading(false); 
        }
    };
    fetchDetalle();
  }, [id]);

  if (loading) return <div className="flex justify-center mt-20 text-gray-400">Cargando detalles...</div>;
  
  if (!data) return (
    <div className="p-10 text-center">
        <p className="text-xl font-bold text-gray-400">Registro no encontrado</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-cuchi-primary hover:underline">Regresar</button>
    </div>
  );

  return (
    <div className="fade-in max-w-5xl mx-auto pb-10">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Volver al Historial
        </button>

        {/* TARJETA PRINCIPAL */}
        <div className="bg-white rounded-[2rem] shadow-lg p-8 border border-gray-100 mb-8">
            
            {/* Header de la Tarjeta */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-gray-50 pb-6 gap-4">
                <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                        ${data.tipo_clase === 'practica' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        Clase {data.tipo_clase}
                    </span>
                    <h1 className="text-3xl font-bold text-cuchi-text mt-2">{data.tema_visto || 'Sin tema registrado'}</h1>
                    <p className="text-gray-400 text-lg font-medium">{data.nombre_materia}</p>
                </div>
                
                <div className="text-right md:text-right flex flex-row md:flex-col gap-4 md:gap-1 items-center md:items-end">
                    <div className="flex items-center gap-2 text-cuchi-primary font-bold">
                        <Calendar size={18}/> 
                        {/* Validación de fecha segura */}
                        {data.fecha ? new Date(data.fecha).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={16}/> {data.hora_entrada} - {data.hora_salida}
                    </div>
                </div>
            </div>

            {/* Información del Docente */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">
                    {data.nombre_docente?.charAt(0) || '?'}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-700">Docente: {data.nombre_docente}</p>
                    <p className="text-xs text-gray-400">Responsable de la sesión</p>
                </div>
            </div>

            {/* Observaciones */}
            {data.observaciones && (
                <div className="text-sm text-gray-600 italic border-l-4 border-gray-200 pl-4 py-1">
                    "{data.observaciones}"
                </div>
            )}
        </div>

        {/* SECCIÓN DE EQUIPOS USADOS (Solo si es práctica) */}
        {data.tipo_clase === 'practica' && (
            <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-cuchi-text mb-4 flex items-center gap-2">
                    <Server className="text-cuchi-primary"/> 
                    Recursos Utilizados ({data.equipos_usados?.length || 0})
                </h3>
                
                {data.equipos_usados && data.equipos_usados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.equipos_usados.map(eq => (
                            <div key={eq.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                                <div className="h-24 bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                                    {eq.imagen_url ? (
                                        <img src={eq.imagen_url} className="h-full object-contain p-2" alt={eq.nombre_equipo}/>
                                    ) : (
                                        <HardDrive size={30} className="text-gray-300"/>
                                    )}
                                    
                                    {/* Indicador si el equipo tiene falla actualmente */}
                                    {eq.estado === 'falla' && (
                                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Equipo con falla actual"></span>
                                    )}
                                </div>
                                <h4 className="font-bold text-gray-700 text-sm truncate" title={eq.nombre_equipo}>{eq.nombre_equipo}</h4>
                                <p className="text-xs text-gray-400 truncate">{eq.posicion_fisica || eq.ubicacion || 'Sin ubicación'}</p>
                                <div className="mt-2">
                                    <span className="text-[10px] text-cuchi-primary bg-blue-50 px-2 py-1 rounded w-fit uppercase font-bold border border-blue-100">
                                        {eq.tipo}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-gray-400">
                        <p>No se registraron equipos específicos en esta práctica.</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default BitacoraDetallePage;