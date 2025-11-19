import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages (Aquí irás importando tus páginas reales)
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EquiposPage from './pages/EquiposPage';
import EquipoDetallePage from './pages/EquipoDetallePage';
// Componente de Protección
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.rol !== requiredRole) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* --- RUTAS ADMIN --- */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="equipos" element={<EquiposPage />} />
        
        {/* 2. CAMBIAR ESTA LÍNEA (Antes tenías <div>Detalle de Equipo</div>) */}
        <Route path="equipos/:id" element={<EquipoDetallePage />} />

      </Route>
      {/* --- RUTAS DOCENTE --- */}
      <Route path="/docente" element={
        <ProtectedRoute requiredRole="docente">
          <TeacherLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<div className="text-2xl text-cuchi-text font-bold">Bienvenido Profesor</div>} />
        <Route path="registrar-uso" element={<div>Aquí irá el formulario de asistencia</div>} />
      </Route>

      {/* --- RUTAS ALUMNO --- */}
      <Route path="/alumno" element={
        <ProtectedRoute requiredRole="alumno">
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<div className="text-2xl text-cuchi-text font-bold">Bienvenido Alumno</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;