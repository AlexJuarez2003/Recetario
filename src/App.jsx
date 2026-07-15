import { BrowserRouter, Routes, Route } from "react-router-dom";

import Perfil from "./pages/Admin/Perfil";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import Layout from "./pages/Layout";
import Recetas from "./pages/Usuario/Recetas";
import Favoritos from "./pages/Usuario/Favoritos";
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
          {/* Públicas */}
          <Route path="/" element={<Login />} />
          {/* <Route path="/signup" element={<Signup />} /> */}

          {/* Privadas */}
          <Route element={ <ProtectedRoute allowedRoles={[ "admin" ]} /> }>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/recetas" element={<Recetas />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;