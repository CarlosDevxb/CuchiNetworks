import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Home, PenTool, History, AlertOctagon } from 'lucide-react';

const TeacherLayout = () => {
  const { user } = useAuth();

  const teacherMenu = [
    {
      label: 'Inicio',
      path: '/docente/dashboard',
      icon: <Home size={22} />
    },
    {
      label: 'Gestión de Clase',
      icon: <PenTool size={22} />,
      subItems: [
        { label: 'Registrar Actividad', path: '/docente/registrar-uso' }, // Lo que más usan
        { label: 'Mi Historial', path: '/docente/historial' }
      ]
    },
    {
      label: 'Soporte Técnico',
      icon: <AlertOctagon size={22} />,
      subItems: [
        { label: 'Reportar Falla', path: '/docente/reportar' },
        { label: 'Mis Reportes', path: '/docente/mis-reportes' }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-cuchi-base font-sans">
      <Sidebar menuItems={teacherMenu} title="Docente" user={user} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;