import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Server, Monitor, 
  Cpu, Wifi, MoreVertical, Edit, Trash2, Eye 
} from 'lucide-react';
import client from '../config/axios';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext'; // O react-hot-toast

const EquiposPage = () => {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // ESTADOS DE FILTRO
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos'); // todos, router, switch, computadora, otros
  const [filterEstado, setFilterEstado] = useState('todos'); // todos, operativo, mantenimiento, falla

  // 1. CARGAR EQUIPOS
  useEffect(() => {
    const fetchEquipos = async () => {
      setLoading(true);
      try {
        // Simulamos delay para lucir el Skeleton
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const res = await client.get('/equipos');
        setEquipos(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar el inventario");
      } finally {
        setLoading(false);
      }
    };
    fetchEquipos();
  }, []);

  // 2. LÓGICA DE FILTRADO
  const filteredEquipos = equipos.filter(eq => {
    // Filtro de Texto (Nombre, Modelo, Serial, Ubicación)
    const searchLower = searchTerm.toLowerCase();
    const matchText = 
        eq.nombre_equipo?.toLowerCase().includes(searchLower) ||
        eq.modelo?.toLowerCase().includes(searchLower) ||
        eq.serial_number?.toLowerCase().includes(searchLower) ||
        eq.ubicacion_nombre?.toLowerCase().includes(searchLower);

    // Filtro de Tipo
    const matchTipo = filterTipo === 'todos' || eq.tipo === filterTipo;

    // Filtro de Estado
    const matchEstado = filterEstado === 'todos' || eq.estado === filterEstado;

    return matchText && matchTipo && matchEstado;
  });

  // HELPER: Badge de Estado
  const getStatusBadge = (estado) => {
    const styles = {
        operativo: "bg-green-100 text-green-700 border-green-200",
        mantenimiento: "bg-yellow-100 text-yellow-700 border-yellow-200",
        falla: "bg-red-100 text-red-700 border-red-200",
        inactivo: "bg-gray-100 text-gray-600 border-gray-200"
    };
    return (
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[estado] || styles.inactivo}`}>
            {estado}
        </span>
    );
  };

  // HELPER: Icono por Tipo
  const getTypeIcon = (tipo) => {
    switch(tipo) {
        case 'router': return <Wifi size={18} className="text-blue-500"/>;
        case 'switch': return <Server size={18} className="text-indigo-500"/>;
        case 'computadora': return <Monitor size={18} className="text-purple-500"/>;
        default: return <Cpu size={18} className="text-gray-500"/>;
    }
  };

  // SKELETON
  if (loading) {
      return (
        <div className="fade-in max-w-7xl mx-auto pb-10 p-4">
             <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
             </div>
             <div className="h-16 w-full bg-white rounded-xl mb-6 animate-pulse"></div>
             <TableSkeleton rows={8} />
        </div>
      );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto pb-10 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cuchi-text">Inventario de Equipos</h1>
          <p className="text-gray-500">Gestión de activos de red y cómputo.</p>
        </div>
        <button 
            onClick={() => navigate('/admin/equipos/nuevo')} 
            className="bg-cuchi-primary text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-cuchi-primary/20 hover:bg-blue-700 transition-all hover:-translate-y-1"
        >
            <Plus size={20}/> Nuevo Equipo
        </button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col xl:flex-row gap-4 justify-between items-center">
        
        {/* TABS DE TIPO */}
        <div className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl overflow-x-auto w-full xl:w-auto">
            {['todos', 'router', 'switch', 'computadora'].map(tipo => (
                <button
                    key={tipo}
                    onClick={() => setFilterTipo(tipo)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${filterTipo === tipo ? 'bg-white text-cuchi-text shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {tipo}
                </button>
            ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            {/* SELECTOR ESTADO */}
            <div className="relative">
                <Filter size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                <select 
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full md:w-40 pl-9 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-cuchi-primary rounded-xl outline-none text-sm font-medium appearance-none cursor-pointer"
                >
                    <option value="todos">Cualquier Estado</option>
                    <option value="operativo">🟢 Operativo</option>
                    <option value="mantenimiento">🟡 Mantenimiento</option>
                    <option value="falla">🔴 Falla</option>
                </select>
            </div>

            {/* BUSCADOR */}
            <div className="relative w-full md:w-64">
                <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar serial, modelo..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-cuchi-primary rounded-xl outline-none text-sm transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* LISTA DE TARJETAS (GRID) O TABLA */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                    <tr>
                        <th className="p-6">Dispositivo</th>
                        <th className="p-6">Ubicación</th>
                        <th className="p-6">Detalles Técnicos</th>
                        <th className="p-6 text-center">Estado</th>
                        <th className="p-6 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredEquipos.map(eq => {
        // ✅ CORRECCIÓN DE SEGURIDAD:
        // Verificamos si ya es objeto o si es string antes de leerlo.
        let detalles = {};
        try {
            detalles = typeof eq.detalles === 'string' 
                ? JSON.parse(eq.detalles) 
                : (eq.detalles || {});
        } catch (e) {
            console.error("Error parseando detalles fila:", eq.id);
        }

        return (
            <tr key={eq.id} className="group hover:bg-blue-50/30 transition-colors">
                <td className="p-6">
                    <div className="flex items-center gap-4">
                        {/* Miniatura Imagen */}
                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {eq.imagen_url ? (
                                <img src={eq.imagen_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                getTypeIcon(eq.tipo)
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-cuchi-text group-hover:text-cuchi-primary transition-colors text-base">{eq.nombre_equipo}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{eq.modelo}</p>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-1 inline-block">S/N: {eq.serial_number}</span>
                        </div>
                    </div>
                </td>
                <td className="p-6">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{eq.ubicacion_nombre || 'Sin asignar'}</span>
                        <span className="text-xs text-blue-500 font-bold">{eq.posicion_fisica}</span>
                    </div>
                </td>
                <td className="p-6 text-gray-500 text-xs">
                    {/* ✅ USAMOS LA VARIABLE SEGURA 'detalles' */}
                    {eq.tipo === 'router' && (
                        <div className="flex gap-2">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Fa: {detalles.interfaces?.fastEthernet || 0}</span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Se: {detalles.interfaces?.serial || 0}</span>
                        </div>
                    )}
                    {eq.tipo === 'computadora' && (
                        <div className="flex flex-col gap-1">
                            <span>CPU: {detalles.hardware?.procesador || 'N/A'}</span>
                            <span>RAM: {detalles.hardware?.ram || 'N/A'}</span>
                        </div>
                    )}
                </td>
                <td className="p-6 text-center">
                    {getStatusBadge(eq.estado)}
                </td>
                <td className="p-6 text-right">
                    <button 
                        onClick={() => navigate(`/admin/equipos/${eq.id}`)}
                        className="p-2 text-gray-400 hover:text-cuchi-primary hover:bg-white hover:shadow-md rounded-xl transition-all"
                        title="Ver Detalle / Editar"
                    >
                        <Eye size={20}/>
                    </button>
                </td>
            </tr>
        );
    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default EquiposPage;