import { useContext, useEffect, useState } from "react";
import { getRecetas } from "../../helpers/recetas";
import { UserContext } from "../../context/UserProvider";

const Recetas = () => {

    const [recetas, setRecetas] = useState([]);
    const { user } = useContext(UserContext);

    const obtenerRecetas = async () => {
        try {
            const data = await getRecetas();
            if (data) {
                setRecetas(data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        obtenerRecetas();
        // console.log(user);
    }, []);

    return (
        <div className=" w-3/4 flex flex-col items-center bg-gray-300 rounded">
            <div className="w-2xl flex flex-col justify-center items-center">
                <div className="flex flex-col w-full h-10 rounded justify-center items-center mt-4 mb-4 bg-white">
                    <button className="h-3/5 w-2/3 rounded-2xl text-center cursor-pointer hover:bg-gray-300">Nueva receta</button>
                </div>
                <div className="w-full">
                    {
                        recetas.map(receta => (
                            <div key={receta.id} className="bg-white rounded flex flex-col mb-4">
                                {/* Título */}
                                <div className="flex justify-between p-2">
                                    <div>
                                        <p className="text-2xl font-bold">{receta.usuario.name}</p>
                                        <p className="font-semibold">
                                            {
                                                new Date(receta.updated_at).toLocaleDateString(
                                                "es-AR",
                                                {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                },
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex flex-col justify-end text-right">
                                        <p>{receta.categoria.nombre}</p>
                                        <p>Tiempo de preparación: {receta.tiempo_preparacion} minutos</p>
                                    </div>
                                </div>
                                {/* Cuerpo - Info */}
                                <div className="p-2">
                                    <h1 className="text-2xl font-bold">{receta.titulo}</h1>
                                    <p className="font-bold">{receta.descripcion}</p>
                                    <p><span className="font-semibold">Ingredientes:</span> {receta.ingredientes}</p>
                                    <p><span className="font-semibold">Pasos:</span> {receta.pasos}</p>
                                </div>
                                {/* Imagen */}
                                <img src={receta.imagen} className="w-full" />
                                {/* Comentarios / Favoritos */}
                                <div className="flex flex-row justify-around items-center h-10 ">
                                    <button className="p-2 font-medium rounded hover:bg-gray-300">Ver comentarios (1)</button>
                                    <button className="p-2 font-medium rounded hover:bg-gray-300">Añadir a favoritos</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default Recetas;