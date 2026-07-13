import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserProvider";
import { useContext } from "react";

const Logout = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error("Error al cerrar sesión");
            }

            localStorage.removeItem("token");
            setUser(null);

            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <button onClick={handleLogout} className="w-60 rounded-2xl p-1 cursor-pointer bg-red-500 text-white">Cerrar sesión</button>
    );
}

export default Logout;