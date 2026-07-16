import { BrowserRouter, Routes, Route } from "react-router-dom";

import Perfil from "./pages/Usuario/Perfil";
import AuthPage from "./pages/Auth/AuthPage";
import Layout from "./pages/Layout";
import Home from "./pages/Publico/Home";
import DetalleReceta from "./pages/Publico/DetalleReceta";
import Recetas from "./pages/Usuario/Recetas";
import Categorias from "./pages/Admin/Categorias";
import Usuarios from "./pages/Admin/Usuarios";
import Dashboard from "./pages/Admin/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "./context/UserProvider";

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/recetas/:id" element={<DetalleReceta />} />

          {/* Privadas: cualquier usuario autenticado (usuario o admin) */}
          <Route element={<ProtectedRoute allowedRoles={["usuario", "admin"]} />}>
            <Route element={<Layout />}>
              <Route path="/recetas" element={<Recetas />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Route>

          {/* Privadas: solo admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/categorias" element={<Categorias />} />
            </Route>
          </Route>

          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
