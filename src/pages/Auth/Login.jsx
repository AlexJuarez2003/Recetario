import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserProvider";

const Login = () => {

    const navigate = useNavigate();
    const input = useRef(null);
    const { setUser } = useContext(UserContext);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Error al loguear");
            }

            const data = await response.json();

            setUser(data.user);
            localStorage.setItem("token", data.token);

            navigate('/perfil');
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (input.current) {
            input.current.focus();
        }
    }, []);

    return (<>
        <div className="flex w-lvw h-lvh justify-center items-center bg-gray-300">
            <div className="flex flex-col h-100 w-112.5 justify-center items-center bg-white rounded-2xl">
                <h1 className="font-bold text-2xl">Iniciar Sesión</h1>

                <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center w-112.5 gap-7" >
                    <label className="flex flex-col w-3/4 gap-2">
                        Email
                        <input ref={input} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="pancho@gmail.com" className="border-2 rounded p-2" required />    
                    </label>
                    <label className="flex flex-col w-3/4 gap-2">
                        Contraseña
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="border-2 rounded p-2" required />    
                    </label>
                    <button type="submit" className="w-1/2 p-2 bg-gray-500 text-white  border-2 rounded-2xl cursor-pointer" >Ingresar</button>
                </form>
            </div>
        </div>
    </>);
}

export default Login;