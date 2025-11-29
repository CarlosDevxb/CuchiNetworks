import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Settings, 
  Server, 
  ClipboardList, 
  CalendarClock 
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();

  const adminMenu = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={22} />
    },
    {
      label: 'Administración',
      icon: <Settings size={22} />,
      subItems: [
        { label: 'Control de Usuarios', path: '/admin/usuarios' },
        { label: 'Catálogo Materias', path: '/admin/materias' },
        { label: 'Carga Académica', path: '/admin/carga-academica' } 
      ]
    },
    {
      label: 'Infraestructura',
      icon: <Server size={22} />,
      subItems: [
        { label: 'Inventario Equipos', path: '/admin/equipos' },
        { label: 'Zonas y Ubicaciones', path: '/admin/ubicaciones' },
        { label: 'Proveedores', path: '/admin/proveedores' }
      ]
    },
    {
      label: 'Reportes y Logs',
      icon: <ClipboardList size={22} />,
      subItems: [
        { label: 'Bitácora de Uso', path: '/admin/bitacora' }, 
        { label: 'Fallas y Reportes', path: '/admin/reportes' }
      ]
    }
  ];

  return (
    // CAMBIO 1: h-screen (Alto fijo) y overflow-hidden (Sin scroll global)
    <div className="flex h-screen bg-cuchi-base font-sans overflow-hidden">
      
      {/* El Sidebar ya tiene su propio scroll interno si es necesario */}
      <Sidebar menuItems={adminMenu} title="Panel Admin" user={user} />
      
      {/* CAMBIO 2: overflow-y-auto (Solo esta zona hace scroll) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative w-full">
        <Outlet />
      </main>
      
    </div>
  );
};

export default AdminLayout;