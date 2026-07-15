import { useNavigate } from "react-router-dom";

const Logout = ({ estilo}) => {
    const navigate = useNavigate();

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
            
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <button onClick={handleLogout} className={estilo ? estilo : "w-60 rounded-2xl p-1 cursor-pointer bg-red-500 text-white"}>Cerrar sesión</button>
    );
}

export default Logout;