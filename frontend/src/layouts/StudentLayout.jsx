import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Home, User, ShieldAlert, HelpCircle } from 'lucide-react';

const StudentLayout = () => {
  const { user } = useAuth();

  const studentMenu = [
    {
      label: 'Inicio',
      path: '/alumno/dashboard',
      icon: <Home size={22} />
    },
    {
      label: 'Mi Perfil',
      path: '/alumno/perfil',
      icon: <User size={22} />
    },
    {
      label: 'Reportar Problema',
      path: '/alumno/reportar-falla',
      icon: <ShieldAlert size={22} />
    },
    {
      label: 'Ayuda',
      path: '/alumno/ayuda',
      icon: <HelpCircle size={22} />
    }
  ];

  return (
    <div className="flex min-h-screen bg-cuchi-base font-sans">
      <Sidebar menuItems={studentMenu} title="Alumno" user={user} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;