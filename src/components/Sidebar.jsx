import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const linkClass = ({ isActive }) =>
        `px-3 py-2 rounded transition-colors ${
            isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-200"
        }`;

    return (<>
    <aside className="flex flex-col w-64 items-center pt-7 gap-6 bg-gray-100">
        <h2 className="font-bold text-2xl">Menú</h2>
        <ul className="flex flex-col gap-6">
            <li>
                <NavLink to="/perfil" className={linkClass}>
                    Perfil de usuario
                </NavLink>
            </li>
            <li>
                <NavLink to="/recetas" className={linkClass}>
                    Recetas
                </NavLink>
            </li>
            <li>
                <NavLink to="/categorias" className={linkClass}>
                    Categorías
                </NavLink>
            </li>
            <li>
                <NavLink to="/favoritos" className={linkClass}>
                    Favoritos
                </NavLink>
            </li>
        </ul>
    </aside>
    </>);
}

export default Sidebar;