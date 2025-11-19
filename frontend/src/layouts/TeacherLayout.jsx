import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Home, Clock, AlertTriangle, History } from 'lucide-react';

const TeacherLayout = () => {
  const { user } = useAuth();

  const teacherMenu = [
    {
      label: 'Inicio',
      path: '/docente/dashboard',
      icon: <Home size={22} />
    },
    {
      label: 'Mis Clases',
      icon: <Clock size={22} />,
      subItems: [
        { label: 'Registrar Asistencia', path: '/docente/registrar-uso' }, // EL MÁS IMPORTANTE
        { label: 'Historial de Clases', path: '/docente/historial' }
      ]
    },
    {
      label: 'Incidencias',
      icon: <AlertTriangle size={22} />,
      subItems: [
        { label: 'Reportar Falla', path: '/docente/reportar' },
        { label: 'Mis Reportes', path: '/docente/mis-reportes' }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-cuchi-base font-sans">
      <Sidebar menuItems={teacherMenu} title="Panel Docente" user={user} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;