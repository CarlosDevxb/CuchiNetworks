import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, AlertOctagon } from 'lucide-react'; // Ajusté los iconos

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
      icon: <BookOpen size={22} />, // Icono más acorde (Libro)
      subItems: [
        { label: 'Mi Historial', path: '/docente/historial' }
      ]
    },
    {
      label: 'Soporte Técnico',
      icon: <AlertOctagon size={22} />,
      subItems: [
        // 1. Quitamos 'Reportar Falla' porque ahora es un Modal en el Dashboard
        // 2. Corregimos 'to' por 'path' para que el Sidebar lo detecte bien
        { label: 'Mis Reportes', path: '/docente/reportes' }
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