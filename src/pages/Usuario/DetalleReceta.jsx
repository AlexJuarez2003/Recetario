import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import { storeComentario } from "../../helpers/comentarios";
import { comprarReceta } from "../../helpers/compras";
import { getReceta } from "../../helpers/recetas";
import "./DetalleReceta.css";

const formatearDinero = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });

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

const dividirLineas = (texto = "") =>
    texto
        .split(/\r?\n|\. /)
        .map((linea) => linea.trim())
        .filter(Boolean);

const DetalleReceta = () => {
    const { id } = useParams();
    const { user } = useContext(UserContext);

    const [receta, setReceta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comprando, setComprando] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [errorComentario, setErrorComentario] = useState(null);

    const cargarReceta = async () => {
        setLoading(true);
        setError(null);

        const data = await getReceta(id);

        if (!data) {
            setError("No se pudo cargar la receta.");
        } else {
            setReceta(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        cargarReceta();
    }, [id]);

    const handleComprar = async () => {
        setComprando(true);
        setErrorCompra(null);

        try {
            await comprarReceta(receta.id);
            await cargarReceta();
        } catch (err) {
            setErrorCompra(err.message);
        } finally {
            setComprando(false);
        }
    };

    const handleComentar = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        setEnviandoComentario(true);
        setErrorComentario(null);

        try {
            await storeComentario(receta.id, user.id, nuevoComentario.trim());
            setNuevoComentario("");
            await cargarReceta();
        } catch (err) {
            setErrorComentario(err.message);
        } finally {
            setEnviandoComentario(false);
        }
    };

    if (loading) return <Loading message="Cargando detalle" />;

    if (error) {
        return (
            <div className="detalle-page">
                <section className="detalle-error">
                    <h1>No se pudo abrir la receta</h1>
                    <p>{error}</p>
                    <Link to="/recetas">Volver al feed</Link>
                </section>
            </div>
        );
    }

    const ingredientes = dividirLineas(receta.ingredientes);
    const pasos = dividirLineas(receta.pasos);

    return (
        <div className="detalle-page">
            <Link to="/recetas" className="detalle-back">
                <span>←</span>
                Volver al feed
            </Link>

            <section className="detalle-hero">
                <div className="detalle-hero-copy">
                    <span>{receta.categoria?.nombre || "Receta"}</span>
                    <h1>{receta.titulo}</h1>
                    <p>{receta.descripcion}</p>

                    <div className="detalle-meta-row">
                        <div>
                            <strong>{receta.tiempo_preparacion || "--"} min</strong>
                            <small>Tiempo</small>
                        </div>
                        <div>
                            <strong>{receta.es_premium ? "Premium" : "Gratis"}</strong>
                            <small>Tipo</small>
                        </div>
                        <div>
                            <strong>{receta.usuario?.name || "Usuario"}</strong>
                            <small>Autor</small>
                        </div>
                    </div>
                </div>

                <div className="detalle-author-card">
                    <div className="detalle-avatar">{iniciales(receta.usuario?.name)}</div>
                    <h2>{receta.usuario?.name || "Usuario"}</h2>
                    <p>Publicada el {formatearFecha(receta.updated_at)}</p>
                    {receta.es_premium && <span>{formatearDinero(receta.precio)}</span>}
                </div>
            </section>

            {receta.imagen && (
                <section className="detalle-image-panel">
                    <img src={receta.imagen} alt={receta.titulo} />
                </section>
            )}

            {receta.bloqueada ? (
                <section className="detalle-locked">
                    <span>Receta premium</span>
                    <h2>Compra esta receta para ver ingredientes y pasos.</h2>
                    <p>
                        Esta receta esta bloqueada porque es contenido premium.
                        Al comprarla se desbloquea para tu cuenta.
                    </p>
                    <button type="button" onClick={handleComprar} disabled={comprando}>
                        {comprando ? "Comprando..." : `Comprar por ${formatearDinero(receta.precio)}`}
                    </button>
                    {errorCompra && <p className="detalle-inline-error">{errorCompra}</p>}
                </section>
            ) : (
                <section className="detalle-content-grid">
                    <article className="detalle-panel">
                        <span>Preparacion</span>
                        <h2>Ingredientes</h2>
                        <ul className="detalle-list">
                            {ingredientes.map((ingrediente, index) => (
                                <li key={`${ingrediente}-${index}`}>{ingrediente}</li>
                            ))}
                        </ul>
                    </article>

                    <article className="detalle-panel">
                        <span>Paso a paso</span>
                        <h2>Instrucciones</h2>
                        <ol className="detalle-steps">
                            {pasos.map((paso, index) => (
                                <li key={`${paso}-${index}`}>{paso}</li>
                            ))}
                        </ol>
                    </article>
                </section>
            )}

            <section className="detalle-comments-panel">
                <div className="detalle-section-heading">
                    <span>Comunidad</span>
                    <h2>Comentarios</h2>
                </div>

                {receta.comentarios?.length > 0 ? (
                    <div className="detalle-comments-list">
                        {receta.comentarios.map((comentario) => (
                            <article key={comentario.id} className="detalle-comment">
                                <span>{iniciales(comentario.usuario?.name)}</span>
                                <div>
                                    <strong>{comentario.usuario?.name || "Usuario"}</strong>
                                    <p>{comentario.contenido}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="detalle-empty">Aun no hay comentarios en esta receta.</p>
                )}

                <form className="detalle-comment-form" onSubmit={handleComentar}>
                    <textarea
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder={`Comentar como ${user?.name || "usuario"}...`}
                        rows={3}
                    />
                    <button type="submit" disabled={enviandoComentario || !nuevoComentario.trim()}>
                        {enviandoComentario ? "Publicando..." : "Publicar comentario"}
                    </button>
                    {errorComentario && <p className="detalle-inline-error">{errorComentario}</p>}
                </form>
            </section>
        </div>
    );
};

export default DetalleReceta;
