import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserProvider";

const Logout = ({ estilo }) => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleLogout = () => {
        const token = localStorage.getItem("token");

        localStorage.removeItem("token");
        setUser(null);
        navigate("/", { replace: true });

        if (!token) return;

        fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }).catch((error) => {
            console.log(error);
        });
    };

    return (
        <button
            onClick={handleLogout}
            className={estilo ? estilo : "w-60 rounded-2xl p-1 cursor-pointer bg-red-500 text-white"}
        >
            Cerrar sesion
        </button>
    );
};

export default Logout;
