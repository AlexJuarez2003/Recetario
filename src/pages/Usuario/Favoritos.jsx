import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import { getFavoritos, removeFavorito } from "../../helpers/favoritos";
import "./Favoritos.css";

const fecha = (valor) =>
    new Date(valor).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const Favoritos = () => {
    const { user } = useContext(UserContext);
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quitando, setQuitando] = useState(null);

    useEffect(() => {
        const cargarFavoritos = async () => {
            try {
                const data = await getFavoritos();
                setFavoritos(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "No pude cargar tus favoritos.");
            } finally {
                setLoading(false);
            }
        };

        cargarFavoritos();
    }, []);

    const misFavoritos = useMemo(
        () => favoritos.filter((favorito) => Number(favorito.usuario_id) === Number(user?.id)),
        [favoritos, user?.id],
    );

    const quitarFavorito = async (favoritoId) => {
        setQuitando(favoritoId);
        setError("");

        try {
            await removeFavorito(favoritoId);
            setFavoritos((prev) => prev.filter((favorito) => favorito.id !== favoritoId));
        } catch (err) {
            setError(err.message || "No se pudo quitar de tus favoritos.");
        } finally {
            setQuitando(null);
        }
    };

    if (loading) return <Loading message="Cargando tus me encanta" />;

    return (
        <section className="favoritos-page">
            <div className="favoritos-hero">
                <div>
                    <span>Me encanta</span>
                    <h1>Tus recetas favoritas</h1>
                    <p>Todo lo que marcaste con corazon queda aqui para volver rapido a cocinarlo.</p>
                </div>
                <div className="favoritos-count">
                    <small>Guardadas</small>
                    <strong>{misFavoritos.length}</strong>
                    <p>receta{misFavoritos.length === 1 ? "" : "s"} con me encanta</p>
                </div>
            </div>

            {error && <div className="favoritos-alert">{error}</div>}

            {misFavoritos.length === 0 ? (
                <div className="favoritos-empty">
                    <span>Sin corazones todavia</span>
                    <h2>Aun no has guardado recetas.</h2>
                    <p>Entra al feed y toca Me gusta en las recetas que quieras conservar.</p>
                    <Link to="/recetas">Ver recetas</Link>
                </div>
            ) : (
                <div className="favoritos-grid">
                    {misFavoritos.map((favorito) => {
                        const receta = favorito.receta;

                        return (
                            <article key={favorito.id} className="favorito-card">
                                <img src={receta?.imagen || "/img/fondo-login.webp"} alt={receta?.titulo || "Receta"} />
                                <div>
                                    <small>{receta?.categoria?.nombre || "Sin categoria"} · guardada {fecha(favorito.created_at)}</small>
                                    <h2>{receta?.titulo || "Receta eliminada"}</h2>
                                    <p>{receta?.descripcion || "Esta receta ya no esta disponible."}</p>
                                    <div className="favorito-stats">
                                        <span>{receta?.favoritos_count || 0} me encanta</span>
                                        <span>{receta?.comentarios_count || 0} comentarios</span>
                                        <span>{receta?.tiempo_preparacion || "--"} min</span>
                                    </div>
                                    <footer>
                                        {receta ? (
                                            <Link to={`/recetas/${receta.id}`}>Ver detalle</Link>
                                        ) : (
                                            <span>No disponible</span>
                                        )}
                                        <button
                                            type="button"
                                            disabled={quitando === favorito.id}
                                            onClick={() => quitarFavorito(favorito.id)}
                                        >
                                            {quitando === favorito.id ? "Quitando..." : "Quitar"}
                                        </button>
                                    </footer>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default Favoritos;
