import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Comentarios from "../../components/Comentarios";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import { getComentarios } from "../../helpers/comentarios";
import { comprarRecetas } from "../../helpers/compras";
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
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [tiempoFiltro, setTiempoFiltro] = useState("todos");
    const [tipoFiltro, setTipoFiltro] = useState("todas");
    const [ordenFiltro, setOrdenFiltro] = useState("recientes");
    const [loading, setLoading] = useState(true);
    const [accionFavorito, setAccionFavorito] = useState(null);
    const [comprando, setComprando] = useState(false);
    const [mensajeCompra, setMensajeCompra] = useState("");
    const [modal, setModal] = useState({ open: false, receta: null });
    const [carrito, setCarrito] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("chefia_carrito") || "[]");
        } catch {
            return [];
        }
    });

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
            setCarrito((prev) =>
                prev.filter((item) => {
                    const recetaActual = recetasData?.find((receta) => receta.id === item.id);
                    return recetaActual?.bloqueada;
                })
            );
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        localStorage.setItem("chefia_carrito", JSON.stringify(carrito));
    }, [carrito]);

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

    const categoriasDisponibles = useMemo(() => {
        const nombres = recetas
            .map((receta) => receta.categoria?.nombre)
            .filter(Boolean);

        return [...new Set(nombres)].sort((a, b) => a.localeCompare(b));
    }, [recetas]);

    const recetasFiltradas = useMemo(() => {
        const filtro = busqueda.trim().toLowerCase();

        const filtradas = recetas.filter((receta) => {
            const coincideTexto = !filtro
                || receta.titulo?.toLowerCase().includes(filtro)
                || receta.descripcion?.toLowerCase().includes(filtro)
                || receta.categoria?.nombre?.toLowerCase().includes(filtro)
                || receta.usuario?.name?.toLowerCase().includes(filtro);

            const coincideCategoria = categoriaFiltro === "todas"
                || receta.categoria?.nombre === categoriaFiltro;

            const minutos = Number(receta.tiempo_preparacion || 0);
            const coincideTiempo = tiempoFiltro === "todos"
                || (tiempoFiltro === "rapidas" && minutos <= 20)
                || (tiempoFiltro === "medias" && minutos > 20 && minutos <= 45)
                || (tiempoFiltro === "largas" && minutos > 45);

            const coincideTipo = tipoFiltro === "todas"
                || (tipoFiltro === "gratis" && !receta.es_premium)
                || (tipoFiltro === "premium" && receta.es_premium)
                || (tipoFiltro === "compradas" && receta.comprada);

            return coincideTexto && coincideCategoria && coincideTiempo && coincideTipo;
        });

        return [...filtradas].sort((a, b) => {
            if (ordenFiltro === "populares") {
                return Number(b.favoritos_count || favoritosPorReceta[b.id] || 0)
                    - Number(a.favoritos_count || favoritosPorReceta[a.id] || 0);
            }

            if (ordenFiltro === "comentadas") {
                return Number(b.comentarios_count || comentariosPorReceta[b.id] || 0)
                    - Number(a.comentarios_count || comentariosPorReceta[a.id] || 0);
            }

            if (ordenFiltro === "tiempo") {
                return Number(a.tiempo_preparacion || 0) - Number(b.tiempo_preparacion || 0);
            }

            return new Date(b.updated_at) - new Date(a.updated_at);
        });
    }, [
        busqueda,
        categoriaFiltro,
        comentariosPorReceta,
        favoritosPorReceta,
        ordenFiltro,
        recetas,
        tiempoFiltro,
        tipoFiltro,
    ]);

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

    const estaEnCarrito = (recetaId) => carrito.some((receta) => receta.id === recetaId);

    const toggleCarrito = (receta) => {
        setMensajeCompra("");
        setCarrito((prev) => {
            if (prev.some((item) => item.id === receta.id)) {
                return prev.filter((item) => item.id !== receta.id);
            }

            return [
                ...prev,
                {
                    id: receta.id,
                    titulo: receta.titulo,
                    precio: receta.precio,
                },
            ];
        });
    };

    const comprarCarrito = async () => {
        if (carrito.length === 0) return;

        setComprando(true);
        setMensajeCompra("");

        try {
            await comprarRecetas(carrito.map((receta) => receta.id));
            setCarrito([]);
            setMensajeCompra("Compra simulada lista. Tus recetas quedaron desbloqueadas.");
            await cargarDatos();
        } catch (err) {
            setMensajeCompra(err.message || "No se pudo completar la compra.");
        } finally {
            setComprando(false);
        }
    };

    const totalCarrito = carrito.reduce((total, receta) => total + Number(receta.precio || 0), 0);

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
                        Mira publicaciones, guarda favoritas, comenta y compra recetas premium
                        sin perder tu lugar en el feed.
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
                    <div className="recetas-filter-grid">
                        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                            <option value="todas">Todas las categorias</option>
                            {categoriasDisponibles.map((categoria) => (
                                <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                        </select>
                        <select value={tiempoFiltro} onChange={(e) => setTiempoFiltro(e.target.value)}>
                            <option value="todos">Cualquier tiempo</option>
                            <option value="rapidas">Rapidas: 20 min o menos</option>
                            <option value="medias">Medias: 21 a 45 min</option>
                            <option value="largas">Largas: mas de 45 min</option>
                        </select>
                        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                            <option value="todas">Gratis y premium</option>
                            <option value="gratis">Solo gratis</option>
                            <option value="premium">Solo premium</option>
                            <option value="compradas">Compradas</option>
                        </select>
                        <select value={ordenFiltro} onChange={(e) => setOrdenFiltro(e.target.value)}>
                            <option value="recientes">Mas recientes</option>
                            <option value="populares">Mas guardadas</option>
                            <option value="comentadas">Mas comentadas</option>
                            <option value="tiempo">Menor tiempo</option>
                        </select>
                    </div>
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
                    <div className="recetas-side-card recetas-cart-card">
                        <div className="recetas-cart-head">
                            <span>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M6.2 6h15.1l-1.8 8.1a2.2 2.2 0 0 1-2.1 1.7H9.1a2.2 2.2 0 0 1-2.1-1.7L4.8 3.8H2.5" />
                                    <circle cx="9.3" cy="20" r="1.2" />
                                    <circle cx="17.4" cy="20" r="1.2" />
                                </svg>
                                Carrito
                            </span>
                            <strong>{carrito.length}</strong>
                        </div>
                        {carrito.length > 0 ? (
                            <div className="recetas-cart-list">
                                {carrito.map((item) => (
                                    <div key={item.id}>
                                        <p>{item.titulo}</p>
                                        <b>${Number(item.precio || 0).toFixed(2)}</b>
                                        <button type="button" onClick={() => toggleCarrito(item)}>
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="recetas-cart-empty">Agrega recetas premium para comprarlas juntas.</p>
                        )}
                        <p className="recetas-cart-total">${totalCarrito.toFixed(2)} MXN</p>
                        <button type="button" onClick={comprarCarrito} disabled={comprando || carrito.length === 0}>
                            {comprando ? "Procesando..." : "Pagar tarjeta demo"}
                        </button>
                        {mensajeCompra && <small>{mensajeCompra}</small>}
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
                            const totalFavoritos = receta.favoritos_count ?? favoritosPorReceta[receta.id] ?? 0;
                            const totalComentarios = receta.comentarios_count ?? comentariosPorReceta[receta.id] ?? 0;
                            const bloqueada = receta.es_premium && receta.bloqueada;
                            const comprada = receta.es_premium && receta.comprada;

                            return (
                                <article key={receta.id} className="receta-post">
                                    <header className="receta-post-header">
                                        <div className="receta-author">
                                            <span>{iniciales(receta.usuario?.name)}</span>
                                            <div>
                                                <h2>{receta.usuario?.name || "Usuario"}</h2>
                                                <p>{formatearFecha(receta.updated_at)} - {receta.categoria?.nombre || "Sin categoria"}</p>
                                            </div>
                                        </div>

                                        <div className="receta-post-meta">
                                            {comprada && <span className="comprada">Comprada</span>}
                                            {receta.es_premium && !comprada && <span>Premium ${receta.precio}</span>}
                                            <small>{receta.tiempo_preparacion || "--"} min</small>
                                        </div>
                                    </header>

                                    <div className="receta-post-body">
                                        <h3>{receta.titulo}</h3>
                                        <p>{receta.descripcion}</p>
                                        {bloqueada ? (
                                            <div className="receta-premium-lock">
                                                <strong>Contenido premium bloqueado</strong>
                                                <span>Compra esta receta para ver ingredientes y pasos completos.</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="receta-post-detail">
                                                    <strong>Ingredientes:</strong> {textoCorto(receta.ingredientes)}
                                                </div>
                                                <div className="receta-post-detail">
                                                    <strong>Pasos:</strong> {textoCorto(receta.pasos)}
                                                </div>
                                            </>
                                        )}
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

                                    <footer className={`receta-actions ${bloqueada ? "has-cart" : ""}`}>
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
                                            <span>●</span>
                                            Comentar
                                        </button>
                                        <Link className="receta-detail-link" to={`/recetas/${receta.id}`}>
                                            <span>↗</span>
                                            Ver detalle
                                        </Link>
                                        {bloqueada && (
                                            <button
                                                type="button"
                                                className={estaEnCarrito(receta.id) ? "in-cart" : ""}
                                                onClick={() => toggleCarrito(receta)}
                                            >
                                                <span>$</span>
                                                {estaEnCarrito(receta.id) ? "En carrito" : "Agregar"}
                                            </button>
                                        )}
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
