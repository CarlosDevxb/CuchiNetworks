import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";

// Pages (Aquí irás importando tus páginas reales)
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EquiposPage from "./pages/EquiposPage";
import EquipoDetallePage from "./pages/EquipoDetallePage";
import EquipoCreatePage from "./pages/EquipoCreatePage";
import NotFoundPage from "./pages/NotFoundPage";
import UbicacionesPage from "./pages/UbicacionesPage";
import UbicacionDetallePage from "./pages/UbicacionDetallePage";
import UbicacionCreatePage from "./pages/UbicacionCreatePage";
import DocentesPage from "./pages/DocentesPage";
import MateriasPage from "./pages/MateriasPage";
import BitacoraPage from "./pages/BitacoraPage";
// Componente de Ruta Protegida
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.rol !== requiredRole)
    return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
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
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="equipos" element={<EquiposPage />} />
        <Route path="equipos/nuevo" element={<EquipoCreatePage />} />{" "}
        {/* <--- AQUÍ, ANTES DEL ID */}
        <Route path="equipos/:id" element={<EquipoDetallePage />} />
        {/* 2. CAMBIAR ESTA LÍNEA (Antes tenías <div>Detalle de Equipo</div>) */}
        <Route path="equipos/:id" element={<EquipoDetallePage />} />
        <Route path="ubicaciones" element={<UbicacionesPage />} />
        <Route path="ubicaciones/nueva" element={<UbicacionCreatePage />} />
        <Route path="ubicaciones/:id" element={<UbicacionDetallePage />} />
        <Route path="materias" element={<MateriasPage />} />
        <Route path="docentes" element={<DocentesPage />} />
        <Route path="bitacora" element={<BitacoraPage />} />
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
        <Route
          path="dashboard"
          element={
            <div className="text-2xl text-cuchi-text font-bold">
              Bienvenido Profesor
            </div>
          }
        />
        <Route
          path="registrar-uso"
          element={<div>Aquí irá el formulario de asistencia</div>}
        />
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
            <div className="text-2xl text-cuchi-text font-bold">
              Bienvenido Alumno
            </div>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
