import React, { useEffect, useState } from 'react';
import updatePerfil from "../../helpers/me.js";
import Logout from '../../components/Logout.jsx';
import Loading from '../../components/Loading.jsx';

const Perfil = () => {

    const [user, setUser] = useState(null);

    useEffect(() => {
        updatePerfil(setUser);
    }, []);

    if (!user) {
        return <Loading message='Cargando perfil' />
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