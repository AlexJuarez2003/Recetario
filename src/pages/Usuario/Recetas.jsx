import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Comentarios from "../../components/Comentarios";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import { getComentarios } from "../../helpers/comentarios";
import { addFavorito, getFavoritos, removeFavorito } from "../../helpers/favoritos";
import { getRecetas } from "../../helpers/recetas";
import "./Recetas.css";

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

const textoCorto = (texto = "", limite = 180) => {
    if (texto.length <= limite) return texto;
    return `${texto.slice(0, limite).trim()}...`;
};

const Recetas = () => {
    const { user } = useContext(UserContext);
    const [recetas, setRecetas] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [accionFavorito, setAccionFavorito] = useState(null);
    const [modal, setModal] = useState({ open: false, receta: null });

    const cargarDatos = async () => {
        try {
            const [recetasData, favoritosData, comentariosData] = await Promise.all([
                getRecetas(),
                getFavoritos(),
                getComentarios(),
            ]);

            setRecetas(Array.isArray(recetasData) ? recetasData : []);
            setFavoritos(Array.isArray(favoritosData) ? favoritosData : []);
            setComentarios(Array.isArray(comentariosData) ? comentariosData : []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const favoritosPorReceta = useMemo(() => {
        return favoritos.reduce((mapa, favorito) => {
            mapa[favorito.receta_id] = (mapa[favorito.receta_id] || 0) + 1;
            return mapa;
        }, {});
    }, [favoritos]);

    const comentariosPorReceta = useMemo(() => {
        return comentarios.reduce((mapa, comentario) => {
            mapa[comentario.receta_id] = (mapa[comentario.receta_id] || 0) + 1;
            return mapa;
        }, {});
    }, [comentarios]);

    const recetasFiltradas = useMemo(() => {
        const filtro = busqueda.trim().toLowerCase();
        if (!filtro) return recetas;

        return recetas.filter((receta) =>
            receta.titulo?.toLowerCase().includes(filtro)
            || receta.descripcion?.toLowerCase().includes(filtro)
            || receta.categoria?.nombre?.toLowerCase().includes(filtro)
            || receta.usuario?.name?.toLowerCase().includes(filtro)
        );
    }, [busqueda, recetas]);

    const favoritoDeUsuario = (recetaId) =>
        favoritos.find((favorito) =>
            favorito.receta_id === recetaId && favorito.usuario_id === user?.id
        );

    const toggleFavorito = async (receta) => {
        if (!user || accionFavorito === receta.id) return;

        const favoritoActual = favoritoDeUsuario(receta.id);
        setAccionFavorito(receta.id);

        try {
            if (favoritoActual) {
                await removeFavorito(favoritoActual.id);
                setFavoritos((prev) => prev.filter((favorito) => favorito.id !== favoritoActual.id));
            } else {
                const favoritoCreado = await addFavorito(user.id, receta.id);
                setFavoritos((prev) => [
                    ...prev,
                    {
                        ...favoritoCreado,
                        usuario_id: user.id,
                        receta_id: receta.id,
                        usuario: user,
                        receta,
                    },
                ]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setAccionFavorito(null);
        }
    };

    const abrirComentarios = (receta) => {
        setModal({ open: true, receta });
    };

    const cerrarComentarios = () => {
        setModal({ open: false, receta: null });
    };

    const handleComentarioCreado = (comentario) => {
        setComentarios((prev) => [...prev, comentario]);
    };

    const handleComentarioEliminado = (comentarioId) => {
        setComentarios((prev) => prev.filter((comentario) => comentario.id !== comentarioId));
    };

    if (loading) {
        return <Loading message="Cargando recetas" />;
    }

    return (
        <div className="recetas-page">
            <section className="recetas-hero">
                <div>
                    <span>Feed ChefIA</span>
                    <h1>Recetas de la comunidad</h1>
                    <p>
                        Mira las publicaciones, guarda tus recetas favoritas con el corazon
                        y abre los comentarios sin perder tu lugar en el feed.
                    </p>
                </div>

                <div className="recetas-search-card">
                    <label htmlFor="buscar-feed">Buscar receta</label>
                    <input
                        id="buscar-feed"
                        type="search"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Nombre, categoria o autor..."
                    />
                </div>
            </section>

            <section className="recetas-feed-layout">
                <aside className="recetas-feed-side">
                    <div className="recetas-side-card">
                        <span>Resumen</span>
                        <strong>{recetas.length}</strong>
                        <p>recetas publicadas</p>
                    </div>
                    <div className="recetas-side-card">
                        <span>Favoritos</span>
                        <strong>{favoritos.length}</strong>
                        <p>corazones guardados</p>
                    </div>
                    <div className="recetas-side-card">
                        <span>Comentarios</span>
                        <strong>{comentarios.length}</strong>
                        <p>mensajes en recetas</p>
                    </div>
                </aside>

                <div className="recetas-feed">
                    {recetasFiltradas.length === 0 ? (
                        <div className="recetas-empty">
                            <h2>No hay recetas para mostrar</h2>
                            <p>Prueba con otra busqueda o agrega nuevas recetas desde el panel.</p>
                        </div>
                    ) : (
                        recetasFiltradas.map((receta) => {
                            const favoritoActual = favoritoDeUsuario(receta.id);
                            const totalFavoritos = favoritosPorReceta[receta.id] || 0;
                            const totalComentarios = comentariosPorReceta[receta.id] || 0;

                            return (
                                <article key={receta.id} className="receta-post">
                                    <header className="receta-post-header">
                                        <div className="receta-author">
                                            <span>{iniciales(receta.usuario?.name)}</span>
                                            <div>
                                                <h2>{receta.usuario?.name || "Usuario"}</h2>
                                                <p>{formatearFecha(receta.updated_at)} · {receta.categoria?.nombre || "Sin categoria"}</p>
                                            </div>
                                        </div>

                                        <div className="receta-post-meta">
                                            {receta.es_premium && <span>Premium ${receta.precio}</span>}
                                            <small>{receta.tiempo_preparacion || "--"} min</small>
                                        </div>
                                    </header>

                                    <div className="receta-post-body">
                                        <h3>{receta.titulo}</h3>
                                        <p>{receta.descripcion}</p>
                                        <div className="receta-post-detail">
                                            <strong>Ingredientes:</strong> {textoCorto(receta.ingredientes)}
                                        </div>
                                        <div className="receta-post-detail">
                                            <strong>Pasos:</strong> {textoCorto(receta.pasos)}
                                        </div>
                                    </div>

                                    {receta.imagen && (
                                        <button
                                            type="button"
                                            className="receta-image-button"
                                            onClick={() => abrirComentarios(receta)}
                                        >
                                            <img src={receta.imagen} alt={receta.titulo} />
                                        </button>
                                    )}

                                    <div className="receta-social-summary">
                                        <span className={favoritoActual ? "active" : ""}>♥</span>
                                        <p>{totalFavoritos} favorito{totalFavoritos === 1 ? "" : "s"}</p>
                                        <button type="button" onClick={() => abrirComentarios(receta)}>
                                            {totalComentarios} comentario{totalComentarios === 1 ? "" : "s"}
                                        </button>
                                    </div>

                                    <footer className="receta-actions">
                                        <button
                                            type="button"
                                            className={favoritoActual ? "liked" : ""}
                                            disabled={accionFavorito === receta.id}
                                            onClick={() => toggleFavorito(receta)}
                                        >
                                            <span>♥</span>
                                            {favoritoActual ? "Guardado" : "Me gusta"}
                                        </button>
                                        <button type="button" onClick={() => abrirComentarios(receta)}>
                                            <span>◐</span>
                                            Comentar
                                        </button>
                                        <Link className="receta-detail-link" to={`/recetas/${receta.id}`}>
                                            <span>↗</span>
                                            Ver detalle
                                        </Link>
                                    </footer>
                                </article>
                            );
                        })
                    )}
                </div>
            </section>

            <Comentarios
                isOpen={modal.open}
                onClose={cerrarComentarios}
                receta={modal.receta}
                onCommentCreated={handleComentarioCreado}
                onCommentDeleted={handleComentarioEliminado}
            />
        </div>
    );
};

export default Recetas;
