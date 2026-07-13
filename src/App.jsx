import { BrowserRouter, Routes, Route } from "react-router-dom"

import Perfil from "./pages/Usuario/Perfil";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import Layout from "./pages/Layout";
import Recetas from "./pages/Usuario/Recetas"
import Favoritos from "./pages/Usuario/Favoritos";

import Categorias from "./pages/Admin/Categorias";

import { UserProvider } from "./context/UserProvider";
import FormCategoria from "./components/categorias/FormCategoria";

const App = () => {

  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas para admin */}
          <Route path="/" element={ <Layout /> }>
            <Route path="/perfil" element={ <Perfil /> } />
            <Route path="/recetas" element={ <Recetas /> } />
            <Route path="/categorias" element={ <Categorias /> } />
            <Route path="/favoritos" element={ <Favoritos /> } />
            <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
          </Route>
          <Route path="/signup" element={ <Signup /> } />
          <Route path="/login" element={ <Login /> } />

          
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App