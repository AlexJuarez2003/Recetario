import React, { useContext, useEffect} from 'react';
import { UserContext } from '../../context/UserProvider';
import updatePerfil from "../../helpers/me.js";
import Logout from '../Auth/Logout.jsx';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {

    const styles = {
        
    }

    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            return navigate("/login");
        }

        updatePerfil(setUser, token);
    }, []);

    if (!user) {
        return <h2>Cargando...</h2>
    }

    return (<>
    <div className='flex flex-col h-full text-center'>
        <h1 className='font-bold text-2xl'>Perfil de usuario</h1>

        <div className='w-full h-full p-4'>
            <div className='flex flex-col justify-center items-center h-90 w-80 rounded-2xl bg-gray-500'>
                <h2 className='font-bold text-white'>INFORMACIÓN PERSONAL</h2>
                <p className='m-4 p-2 rounded w-60 bg-white'>Nombre de usuario: {user.name}</p>
                <p className='m-4 p-2 rounded w-60 bg-white'>Email: {user.email}</p>
                <p className='m-4 p-2 rounded w-60 bg-white'>Rol: {user.role}</p>
                <button className='m-4 p-2 rounded-2xl w-20 cursor-pointer bg-white' >Editar</button>
            </div>
        </div>
        
        <p className='m-4'><Logout /></p>
    </div>
    </>)
}

export default Perfil;