import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, CheckCircle, AlertCircle, Bell, 
  ArrowRight, BookOpen, MessageSquare 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../config/axios';
import ReporteModal from '../components/ReporteModal'; // ✅ Importamos el Modal

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA LA LÓGICA DE TIEMPO (CLASES)
  const [claseActual, setClaseActual] = useState(null);
  const [siguienteClase, setSiguienteClase] = useState(null);
  
  // ESTADOS DE DATOS REALES
  const [statsReportes, setStatsReportes] = useState({ activos: 0, resueltos: 0 });
  const [notificaciones, setNotificaciones] = useState([]);
  
  // ESTADO DEL MODAL
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // FUNCIÓN MAESTRA DE CARGA DE DATOS
  const cargarDatosDashboard = async () => {
    try {
      // 1. CARGAR AGENDA (CLASES)
      const resClases = await client.get('/docentes/mis-clases');
      const todasLasClases = resClases.data;
      
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
      const hoyNombre = dias[new Date().getDay()];
      const ahora = new Date();
      const horaActual = `${ahora.getHours().toString().padStart(2,'0')}:${ahora.getMinutes().toString().padStart(2,'0')}:00`;

      const clasesHoy = todasLasClases.filter(c => c.dia_semana === hoyNombre);

      const actual = clasesHoy.find(c => horaActual >= c.hora_inicio && horaActual <= c.hora_fin);
      const siguiente = clasesHoy.find(c => c.hora_inicio > horaActual);

      setClaseActual(actual);
      setSiguienteClase(siguiente);

      // 2. CARGAR ESTADÍSTICAS DE REPORTES
      const resStats = await client.get('/reportes/stats');
      // El backend devuelve algo como { nuevo: 2, resuelto: 5, en_revision: 1 }
      // Agrupamos los estados activos
      const s = resStats.data;
      const totalActivos = (s.nuevo || 0) + (s.en_revision || 0) + (s.esperando_refaccion || 0) + (s.en_reparacion_externa || 0);
      setStatsReportes({
        activos: totalActivos,
        resueltos: s.resuelto || 0
      });

      // 3. CARGAR NOTIFICACIONES
      const resNotif = await client.get('/reportes/notificaciones');
      setNotificaciones(resNotif.data);

    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // Helper para formatear fecha de notificación
  const formatFechaNotif = (fecha) => {
    const d = new Date(fecha);
    const ahora = new Date();
    const dif = Math.floor((ahora - d) / (1000 * 60 * 60)); // Diferencia en horas

    if (dif < 1) return 'Hace un momento';
    if (dif < 24) return `Hace ${dif} horas`;
    return d.toLocaleDateString();
  };

  // --- RENDERIZADO DE LA TARJETA PRINCIPAL (HERO) ---
  const renderHeroSection = () => {
    // CASO A: ESTÁ DANDO CLASE AHORA MISMO
    if (claseActual) {
        return (
            <div className="bg-cuchi-primary text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-110"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 bg-blue-600/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/30">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider">Clase en Curso</span>
                    </div>

                    <h2 className="text-4xl font-bold mb-2">{claseActual.materia}</h2>
                    <p className="text-blue-100 text-lg mb-8 flex items-center gap-3">
                        <span className="bg-white/20 px-2 py-0.5 rounded font-mono">Grupo {claseActual.grupo}</span>
                        <span>•</span>
                        <span>{claseActual.hora_inicio.slice(0,5)} - {claseActual.hora_fin.slice(0,5)} hrs</span>
                    </p>

                    <button 
                        onClick={() => navigate(`/docente/registrar-uso?clase_id=${claseActual.id}`)}
                        className="bg-white text-cuchi-primary px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        <BookOpen size={24}/> Registrar Asistencia / Uso
                    </button>
                </div>
            </div>
        );
    }

    // CASO B: VIENE UNA CLASE PRONTO
    if (siguienteClase) {
        return (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <Clock size={32} className="text-cuchi-primary"/>
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-1">Próxima Clase: {siguienteClase.materia}</h2>
                <p className="text-gray-400 font-medium mb-6">Comienza a las <span className="text-cuchi-text font-bold">{siguienteClase.hora_inicio.slice(0,5)}</span></p>
            </div>
        );
    }

    // CASO C: LIBRE POR HOY
    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-green-100">
            <div>
                <h2 className="text-3xl font-bold text-emerald-800 mb-2">¡Todo listo por hoy! 🎉</h2>
                <p className="text-emerald-600">No tienes más clases programadas en el sistema.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
                <Calendar size={40} className="text-emerald-500"/>
            </div>
        </div>
    );
  };

  if (loading) return <div className="p-10">Cargando tu agenda...</div>;

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto font-sans">
      
      {/* 1. HEADER SIMPLE */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-cuchi-text">
            Bienvenido, {user?.nombre?.split(' ')[0]}
        </h1>
        <p className="text-gray-400">Panel de control docente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. SECCIÓN PRINCIPAL (2/3 ancho) */}
        <div className="lg:col-span-2 space-y-8">
            {/* TARJETA INTELIGENTE */}
            {renderHeroSection()}

            {/* SECCIÓN DE TICKET RÁPIDO */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="text-orange-500"/> ¿Problemas en el laboratorio?
                </h3>
                <div className="flex items-center justify-between bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-sm text-orange-800 font-medium">Reporta fallas en equipos o instalaciones al instante.</p>
                    <button 
                        onClick={() => setIsReportModalOpen(true)} // ✅ ABRIR MODAL
                        className="bg-white text-orange-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-100 transition-colors"
                    >
                        Crear Reporte
                    </button>
                </div>
            </div>
        </div>

        {/* 3. BARRA LATERAL DERECHA (1/3 ancho) */}
        <div className="space-y-6">
            
            {/* ESTADÍSTICAS REALES */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-6">Mis Reportes</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl text-center">
                        <span className="block text-3xl font-bold text-cuchi-primary">{statsReportes.activos}</span>
                        <span className="text-xs font-bold text-blue-400 uppercase">Activos</span>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl text-center">
                        <span className="block text-3xl font-bold text-green-600">{statsReportes.resueltos}</span>
                        <span className="text-xs font-bold text-green-400 uppercase">Resueltos</span>
                    </div>
                </div>
            </div>

            {/* NOTIFICACIONES REALES */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 h-80 overflow-y-auto custom-scrollbar">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
                    Notificaciones 
                    {notificaciones.filter(n => !n.leida).length > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {notificaciones.filter(n => !n.leida).length} nuevas
                        </span>
                    )}
                </h3>
                <div className="space-y-4">
                    {notificaciones.length === 0 ? (
                        <p className="text-gray-400 text-sm italic text-center py-4">No tienes notificaciones.</p>
                    ) : (
                        notificaciones.map(n => (
                            <div key={n.id} className={`flex gap-3 items-start p-3 rounded-xl transition-colors cursor-pointer ${n.leida ? 'opacity-60 hover:opacity-100' : 'bg-blue-50/50 hover:bg-blue-50'}`}>
                                <div className={`mt-1 p-1.5 rounded-full shrink-0 ${n.tipo === 'exito' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {n.tipo === 'exito' ? <CheckCircle size={14}/> : <MessageSquare size={14}/>}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium leading-snug">{n.mensaje}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatFechaNotif(n.fecha_creacion)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* ✅ MODAL DE REPORTES */}
      <ReporteModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
            // Recargamos los datos para actualizar contadores
            cargarDatosDashboard();
        }}
      />
    </div>
  );
};

export default TeacherDashboard;