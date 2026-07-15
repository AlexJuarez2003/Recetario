import { useEffect, useRef } from "react";
import Logout from "./Logout";

const Navbar = () => {

    const search = useRef(null);

    useEffect(() => {
        if (search.current) {
            search.current.focus();
        }
    }, []);

    return (
        <div className="flex flex-row h-full justify-around items-center">
            <label className="flex flex-row gap-6 items-center">Buscar receta
                <input type="search" ref={search} className="h-9 w-60 p-3 border rounded-2xl"></input>
                <button className="cursor-pointer hover:bg-gray-200 p-1 rounded">Buscar</button>
            </label>
            <nav className="flex flex-row gap-10">
                <p className="flex  font-semibold items-center">Administrador</p>
                <Logout estilo={"cursor-pointer bg-red-500 text-white hover:bg-gray-400 p-3 rounded"} />
            </nav>
        </div>
    );
}

export default Navbar;