import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard"; // <--- 1. ¡IMPORTAR ESTO!

// Pages Admin
import EquiposPage from "./pages/EquiposPage";
import EquipoDetallePage from "./pages/EquipoDetallePage";
import EquipoCreatePage from "./pages/EquipoCreatePage";
import UbicacionesPage from "./pages/UbicacionesPage";
import UbicacionDetallePage from "./pages/UbicacionDetallePage";
import UbicacionCreatePage from "./pages/UbicacionCreatePage";
import DocentesPage from "./pages/DocentesPage";
import MateriasPage from "./pages/MateriasPage";
import BitacoraPage from "./pages/BitacoraPage";
import BitacoraDetallePage from "./pages/BitacoraDetallePage";
import UsuariosPage from "./pages/UsuariosPage";
import CargaAcademicaPage from "./pages/CargaAcademicaPage";

// Pages Docente
import RegistrarClasePage from "./pages/RegistrarClasePage"; // Asegúrate que este archivo exista
import HistorialDocentePage from "./pages/HistorialDocentePage";
import MisReportesPage from "./pages/MisReportesPage";
import NotFoundPage from "./pages/NotFoundPage";

// Componente de Ruta Protegida
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-sans text-gray-500 font-bold animate-pulse">
        Cargando sistema...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.rol !== requiredRole)
    return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            border: '1px solid #E2E8F0',
            padding: '16px',
            color: '#1E293B',
            fontFamily: 'sans-serif',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* --- RUTAS ADMIN --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard y Usuarios */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="carga-academica" element={<CargaAcademicaPage />} />

          {/* Gestión de Equipos */}
          <Route path="equipos" element={<EquiposPage />} />
          <Route path="equipos/nuevo" element={<EquipoCreatePage />} />
          <Route path="equipos/:id" element={<EquipoDetallePage />} />
          
          {/* Gestión de Ubicaciones */}
          <Route path="ubicaciones" element={<UbicacionesPage />} />
          <Route path="ubicaciones/nueva" element={<UbicacionCreatePage />} />
          <Route path="ubicaciones/:id" element={<UbicacionDetallePage />} />
          
          {/* Académico */}
          <Route path="materias" element={<MateriasPage />} />
          <Route path="docentes" element={<DocentesPage />} />
          
          {/* Historial Global */}
          <Route path="bitacora" element={<BitacoraPage />} />
          <Route path="bitacora/:id" element={<BitacoraDetallePage />} />
        </Route>

        {/* --- RUTAS DOCENTE --- */}
        <Route
          path="/docente"
          element={
            <ProtectedRoute requiredRole="docente">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          {/* 2. AQUÍ CONECTAMOS EL DASHBOARD NUEVO */}
          <Route path="dashboard" element={<TeacherDashboard />} />
          
          {/* Esta ruta es vital para el botón "Registrar Asistencia" del dashboard */}
          <Route path="registrar-uso" element={<RegistrarClasePage />} />
  
    <Route path="historial" element={<HistorialDocentePage />} />
    <Route path="reportes" element={<MisReportesPage />} />
        </Route>

        {/* --- RUTAS ALUMNO --- */}
        <Route
          path="/alumno"
          element={
            <ProtectedRoute requiredRole="alumno">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <div className="p-10 text-center">
                <h1 className="text-3xl font-bold text-cuchi-text">Panel de Alumno</h1>
                <p className="text-gray-400 mt-2">Próximamente...</p>
              </div>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;