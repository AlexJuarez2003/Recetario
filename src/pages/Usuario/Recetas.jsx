import { useEffect, useState } from "react";
import { getRecetas } from "../../helpers/recetas";
import Loading from "../../components/Loading";
import Comentarios from "../../components/Comentarios";

const Recetas = () => {

    const [recetas, setRecetas] = useState([]);
    const [modal, setModal] = useState({ open: false, id: null, name: null});

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
    }, []);

    const handleComments = (id, name) => {
        setModal({ open: true, id: id, name: name});
    };

    return (
        <div className=" w-3/4 flex flex-col items-center bg-gray-300 rounded">
            <div className="w-2xl flex flex-col justify-center items-center">
                <div className="w-full">
                    {
                        recetas.length === 0
                        ? <Loading message="Cargando recetas" />
                        : recetas.map(receta => (
                            <div key={receta.id} className="bg-white rounded flex flex-col m-4">
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
                                    <h1 className="text-2xl font-bold">{receta.titulo} {receta.es_premium ? "⭐" : ""} {receta.precio ? ("$" + receta.precio) : ""}</h1>
                                    <p className="font-bold">{receta.descripcion}</p>
                                    <p><span className="font-semibold">Ingredientes:</span> {receta.ingredientes}</p>
                                    <p><span className="font-semibold">Pasos:</span> {receta.pasos}</p>
                                </div>
                                {/* Imagen */}
                                <img src={receta.imagen} className="w-full" />
                                {/* Comentarios / Favoritos */}
                                <div className="flex flex-row justify-around items-center h-10 ">
                                    <button onClick={() => handleComments(receta.id, receta.usuario.name)} className="p-2 font-medium rounded hover:bg-gray-300">Ver comentarios</button>
                                </div>
                            </div>
                        ))
                    }

                    <Comentarios 
                    isOpen={modal.open}
                    onClose={() => setModal({ open: false, id: null })}
                    id={modal.id}
                    usuario={modal.name}
                    />
                </div>
            </div>
        </div>
    );
}

export default Recetas;