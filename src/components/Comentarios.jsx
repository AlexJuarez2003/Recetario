import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserProvider";
import { deleteComentario, getComentarios, storeComentario } from "../helpers/comentarios";
import "./Comentarios.css";

const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const iniciales = (nombre = "Usuario") =>
    nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();

const Comentarios = ({ isOpen, onClose, receta, onCommentCreated, onCommentDeleted }) => {
    const { user } = useContext(UserContext);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!isOpen || !receta?.id) return;

        const traerComentarios = async () => {
            try {
                const data = await getComentarios(receta.id);
                setComentarios(Array.isArray(data) ? data : []);
            } catch (error) {
                console.log(error);
            }
        };

        traerComentarios();
    }, [isOpen, receta?.id]);

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

    const handleCrearComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim() || !receta?.id || !user?.id || enviando) return;

        setEnviando(true);
        try {
            const comentario = await storeComentario(receta.id, user.id, nuevoComentario.trim());
            const comentarioCompleto = {
                ...comentario,
                usuario: user,
                receta,
            };

            setComentarios((prev) => [...prev, comentarioCompleto]);
            onCommentCreated?.(comentarioCompleto);
            setNuevoComentario("");
        } catch (error) {
            console.log(error);
        } finally {
            setEnviando(false);
        }
    };

    const handleDelete = async (comentarioId) => {
        try {
            await deleteComentario(comentarioId);
            setComentarios((prev) => prev.filter((comentario) => comentario.id !== comentarioId));
            onCommentDeleted?.(comentarioId);
        } catch (error) {
            console.log(error);
        }
    };

    if (!isOpen || !receta) return null;

    return (
        <div className="comentarios-overlay" onClick={onClose}>
            <section className="comentarios-modal" onClick={(e) => e.stopPropagation()}>
                <header className="comentarios-header">
                    <h2>Publicacion de {receta.usuario?.name || "Usuario"}</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar comentarios">
                        ×
                    </button>
                </header>

                <div className="comentarios-content">
                    <article className="comentarios-recipe">
                        {receta.imagen && <img src={receta.imagen} alt={receta.titulo} />}
                        <div className="comentarios-recipe-body">
                            <div className="comentarios-author">
                                <span>{iniciales(receta.usuario?.name)}</span>
                                <div>
                                    <strong>{receta.usuario?.name || "Usuario"}</strong>
                                    <small>{formatearFecha(receta.updated_at)} · {receta.categoria?.nombre}</small>
                                </div>
                            </div>
                            <h3>{receta.titulo}</h3>
                            <p>{receta.descripcion}</p>
                        </div>
                    </article>

                    <div className="comentarios-list">
                        <div className="comentarios-sort">Mas relevantes</div>

                        {comentarios.length === 0 ? (
                            <p className="comentarios-empty">Todavia no hay comentarios. Se el primero en comentar.</p>
                        ) : (
                            comentarios.map((comentario) => {
                                const puedeEliminar = user?.role === "admin";

                                return (
                                    <article key={comentario.id} className="comentario-item">
                                        <span>{iniciales(comentario.usuario?.name)}</span>
                                        <div>
                                            <div className="comentario-bubble">
                                                <strong>{comentario.usuario?.name || "Usuario"}</strong>
                                                <p>{comentario.contenido}</p>
                                            </div>
                                            <div className="comentario-actions">
                                                <small>{formatearFecha(comentario.created_at)}</small>
                                                {puedeEliminar && (
                                                    <button type="button" onClick={() => handleDelete(comentario.id)}>
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>

                <form className="comentarios-form" onSubmit={handleCrearComentario}>
                    <span>{iniciales(user?.name)}</span>
                    <input
                        type="text"
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder={`Comentar como ${user?.name || "usuario"}`}
                    />
                    <button type="submit" disabled={enviando || !nuevoComentario.trim()}>
                        Enviar
                    </button>
                </form>
            </section>
        </div>
    );
};

export default Comentarios;
