import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexto/AuthContext";
import { ThemeProvider } from "./contexto/ThemeContext";
import Login from "./contenido/Auth/Login";
import { Toaster } from "./componentes/ui/toaster";
import Dashboard from "./contenido/paginas/Dashboard";
import ProtectedRoute from "./componentes/ProtectedRoute";
import RoleRoute from "./componentes/RoleRoute";
import Layout from "./componentes/Layout";
import DashboardLayout from "./componentes/DashboardLayout";
import NotFound from "./contenido/paginas/NotFound";
import Materias from "./contenido/paginas/Materias";
import RegistroAlumnos from "./contenido/paginas/RegistroAlumnos";
import Horarios from "./contenido/paginas/Horarios";
import Maestros from "./contenido/paginas/Maestros";
import Alumnos from "./contenido/paginas/Alumnos";
import Grupos from "./contenido/paginas/Grupos";
import Asistencia from "./contenido/paginas/Asistencia";
// Estudiante
import MiPerfil from "./contenido/paginas/estudiante/MiPerfil";
import MisGrupos from "./contenido/paginas/estudiante/MisGrupos";
import MiHorario from "./contenido/paginas/estudiante/MiHorario";
import MiAsistencia from "./contenido/paginas/estudiante/MiAsistencia";
import "./App.css";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <div className="app-background">
            <Routes>
              {/* ── RUTAS PROTEGIDAS ── */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard – todos los roles */}
                <Route path="dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                </Route>

                {/* ── Coordinador ── */}
                <Route
                  path="alumnos"
                  element={<RoleRoute roles={["coordinator"]}><Alumnos /></RoleRoute>}
                />
                <Route
                  path="registro-alumnos"
                  element={<RoleRoute roles={["coordinator"]}><RegistroAlumnos /></RoleRoute>}
                />
                <Route
                  path="maestros"
                  element={<RoleRoute roles={["coordinator"]}><Maestros /></RoleRoute>}
                />
                <Route
                  path="materias"
                  element={<RoleRoute roles={["coordinator"]}><Materias /></RoleRoute>}
                />
                <Route
                  path="horarios"
                  element={<RoleRoute roles={["coordinator"]}><Horarios /></RoleRoute>}
                />

                {/* ── Coordinador + Maestro ── */}
                <Route
                  path="grupos"
                  element={<RoleRoute roles={["coordinator", "teacher"]}><Grupos /></RoleRoute>}
                />
                <Route
                  path="asistencia"
                  element={<RoleRoute roles={["coordinator", "teacher"]}><Asistencia /></RoleRoute>}
                />

                {/* ── Alumno ── */}
                <Route
                  path="mi-perfil"
                  element={<RoleRoute roles={["student"]}><MiPerfil /></RoleRoute>}
                />
                <Route
                  path="mis-grupos"
                  element={<RoleRoute roles={["student"]}><MisGrupos /></RoleRoute>}
                />
                <Route
                  path="mi-horario"
                  element={<RoleRoute roles={["student"]}><MiHorario /></RoleRoute>}
                />
                <Route
                  path="mi-asistencia"
                  element={<RoleRoute roles={["student"]}><MiAsistencia /></RoleRoute>}
                />
              </Route>

              {/* ── RUTAS PÚBLICAS ── */}
              <Route path="/login" element={<Login />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
