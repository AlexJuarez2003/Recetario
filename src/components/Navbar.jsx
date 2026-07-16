import { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserProvider";
import Logout from "./Logout";

const Navbar = () => {
    const search = useRef(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (search.current) {
            search.current.focus();
        }
    }, []);

    return (
        <header className="app-navbar">
            <Link to="/" className="app-navbar-brand">
                <span>C</span>
                <div>
                    <strong>ChefIA</strong>
                    <small>Panel de recetas</small>
                </div>
            </Link>

            <label className="app-navbar-search">
                <span>Buscar receta</span>
                <input type="search" ref={search} placeholder="Nombre, categoria..." />
                <button type="button">Buscar</button>
            </label>

            <nav className="app-navbar-user">
                <Link to="/perfil" className="app-navbar-profile">
                    <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                    <strong>{user?.name || "Usuario"}</strong>
                </Link>
                <Logout estilo="app-navbar-logout" />
            </nav>
        </header>
    );
};

export default Navbar;
