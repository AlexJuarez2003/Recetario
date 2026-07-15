import { useEffect, useState } from "react";
import { deleteComentario, getComentarios } from "../helpers/comentarios.js";

const Comentarios = ({ isOpen, onClose, id, usuario }) => {

    const [comentarios, setComentarios] = useState([]);

    useEffect(() => {
        const traerComentarios = async () => {
            try {
                const comentarios = await getComentarios(id);
                setComentarios(comentarios);
            } catch (error) {
                console.log(error);
            }
        };

        traerComentarios();
    }, []);

    useEffect(() => {
        if (!isOpen) return;
    
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
    
        document.addEventListener("keydown", handleKeyDown);
    
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleDelete = async (id) => {
        try {
            const mensaje = await deleteComentario(id);
            setComentarios(prev => prev.filter(comment => comment.id !== id ));
        } catch (error) {
            console.log(error);
        }
    }

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                {usuario && <h1 className="text-2xl font-semibold text-center">Receta de {usuario}</h1>}
                {
                    comentarios.map(comentario => (
                        id === comentario.receta_id && 
                        <div key={comentario.id} className="flex flex-col gap-2 border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-row justify-between items-center">
                                <h1 className="font-medium text-gray-900">{comentario.usuario.name}</h1>
                                <p className="text-sm text-gray-400">{
                                    new Date(comentario.created_at).toLocaleDateString(
                                        "es-AR",
                                        {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        },
                                        )
                                }</p>
                            </div>
                            <h2 className="text-gray-700">{comentario.contenido}</h2>
                            <button onClick={() => handleDelete(comentario.id)} className="self-start text-sm text-red-500 hover:text-red-700 hover:underline cursor-pointer">Eliminar</button>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Comentarios;