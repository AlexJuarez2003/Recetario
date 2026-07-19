import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { UserContext } from "../context/UserProvider";

const Sidebar = () => {
    const { user } = useContext(UserContext);
    const esAdmin = user?.role === "admin";

    const linkClass = ({ isActive }) =>
        `app-sidebar-link ${isActive ? "active" : ""}`;

    return (
        <aside className="app-sidebar">
            <div className="app-sidebar-heading">
                <span>Menu</span>
                <strong>{esAdmin ? "Administrador" : "Usuario"}</strong>
            </div>

            <ul className="app-sidebar-list">
                {esAdmin && (
                    <li>
                        <NavLink to="/dashboard" className={linkClass}>
                            Dashboard
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/perfil" className={linkClass}>
                        Perfil
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/recetas" className={linkClass}>
                        Recetas
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/mis-recetas" className={linkClass}>
                        Tus recetas
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/favoritos" className={linkClass}>
                        Me encanta
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/mis-compras" className={linkClass}>
                        Tus compras
                    </NavLink>
                </li>

                {esAdmin && (
                    <>
                        <li>
                            <NavLink to="/categorias" className={linkClass}>
                                Categorias
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/usuarios" className={linkClass}>
                                Usuarios
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/ventas" className={linkClass}>
                                Ventas
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/reportes" className={linkClass}>
                                Reportes
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;
