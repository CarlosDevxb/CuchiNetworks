import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Server, Users, ClipboardList, BookOpen, MapPin } from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();

  const adminMenu = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={22} />
    },
    {
      label: 'Infraestructura',
      icon: <Server size={22} />,
      subItems: [
        { label: 'Equipos', path: '/admin/equipos' },
        { label: 'Ubicaciones', path: '/admin/ubicaciones' },
        { label: 'Proveedores', path: '/admin/proveedores' }
      ]
    },
    {
      label: 'Académico', // NUEVA SECCIÓN
      icon: <BookOpen size={22} />,
      subItems: [
        { label: 'Materias', path: '/admin/materias' }, // CRUD de materias
        { label: 'Docentes', path: '/admin/docentes' }, // Ver lista de profes
        { label: 'Bitácora de Uso', path: '/admin/bitacora' } // Ver quién usó el lab
      ]
    },
    {
      label: 'Usuarios',
      path: '/admin/usuarios',
      icon: <Users size={22} />
    },
    {
      label: 'Reportes',
      icon: <ClipboardList size={22} />,
      subItems: [
        { label: 'Activos', path: '/admin/reportes' },
        { label: 'Historial', path: '/admin/reportes/historial' }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-cuchi-base font-sans">
      <Sidebar menuItems={adminMenu} title="Administrador" user={user} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;