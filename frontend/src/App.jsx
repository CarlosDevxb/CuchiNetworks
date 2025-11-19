import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // El componente que moviste
import { useAuth } from './context/AuthContext';

// Componente para proteger rutas
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.rol !== requiredRole) return <Navigate to="/login" />; // O una página 403

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rutas ADMIN */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Rutas ALUMNO (Placeholder por ahora) */}
      <Route path="/alumno/dashboard" element={
        <ProtectedRoute requiredRole="alumno">
           <div className="p-10 text-white"><h1>Hola Alumno (En construcción)</h1></div>
        </ProtectedRoute>
      } />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;