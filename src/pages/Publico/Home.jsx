import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import { getCategorias } from "../../helpers/categorias";
import { getRecetas } from "../../helpers/recetas";
import "./Home.css";

const NUM_RECETAS_HOME = 10;

const categoriasBase = [
    { nombre: "Desayunos", inicial: "D" },
    { nombre: "Comidas", inicial: "C" },
    { nombre: "Postres", inicial: "P" },
    { nombre: "Saludable", inicial: "S" },
    { nombre: "Rapidas", inicial: "R" },
    { nombre: "Premium", inicial: "$" },
];

const mezclarArray = (arr) => {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
};

const normalizar = (texto = "") => texto.toString().toLowerCase().trim();

const obtenerIniciales = (nombre = "Usuario") =>
    nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();

const Home = () => {
    const { user, setUser } = useContext(UserContext);
    const [todasLasRecetas, setTodasLasRecetas] = useState([]);
    const [recetasAleatorias, setRecetasAleatorias] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [categoriaActiva, setCategoriaActiva] = useState("");
    const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            const [recetasData, categoriasData] = await Promise.all([
                getRecetas(),
                getCategorias(),
            ]);

            if (!recetasData) {
                setError("No se pudieron cargar las recetas.");
                setLoading(false);
                return;
            }

            setTodasLasRecetas(recetasData);
            setRecetasAleatorias(mezclarArray(recetasData).slice(0, NUM_RECETAS_HOME));
            setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
            setLoading(false);
        };

        cargarDatos();
    }, []);

    const categoriasParaMostrar = categorias.length
        ? categorias.slice(0, 8).map((categoria) => ({
            nombre: categoria.nombre,
            inicial: categoria.nombre?.charAt(0)?.toUpperCase() || "C",
        }))
        : categoriasBase;

    const recetasAMostrar = useMemo(() => {
        const texto = normalizar(busqueda);
        const categoria = normalizar(categoriaActiva);
        const listaBase = texto || categoria ? todasLasRecetas : recetasAleatorias;

        return listaBase.filter((receta) => {
            const coincideTexto = !texto
                || normalizar(receta.titulo).includes(texto)
                || normalizar(receta.descripcion).includes(texto)
                || normalizar(receta.categoria?.nombre).includes(texto);

            const coincideCategoria = !categoria
                || normalizar(receta.categoria?.nombre).includes(categoria)
                || (categoria === "premium" && receta.es_premium);

            return coincideTexto && coincideCategoria;
        });
    }, [busqueda, categoriaActiva, recetasAleatorias, todasLasRecetas]);

    const recetasPremium = todasLasRecetas.filter((receta) => receta.es_premium).length;
    const totalCategorias = categorias.length || new Set(
        todasLasRecetas.map((receta) => receta.categoria?.nombre).filter(Boolean)
    ).size;

    const cerrarSesion = async () => {
        try {
            const token = localStorage.getItem("token");

            if (token) {
                await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
        } catch (errorLogout) {
            console.log(errorLogout);
        } finally {
            localStorage.removeItem("token");
            setUser(null);
            setMenuUsuarioAbierto(false);
        }
    };

    if (loading) {
        return (
            <div className="home-loading">
                <Loading message="Preparando ChefIA" />
            </div>
        );
    }

    return (
        <div className="home-page">
            <header className="home-header">
                <div className="home-header-inner">
                    <Link to="/" className="home-brand">
                        <span className="home-brand-mark">C</span>
                        <span>
                            <strong>ChefIA</strong>
                            <small>Recetas con sabor inteligente</small>
                        </span>
                    </Link>

                    <nav className="home-nav">
                        <a href="#recetas">Recetas</a>
                        <a href="#categorias">Categorias</a>
                        <a href="#inspiracion">Inspiracion</a>
                    </nav>

                    <div className="home-session">
                        {user ? (
                            <div className="home-user-menu">
                                <button
                                    type="button"
                                    className="home-user-button"
                                    onClick={() => setMenuUsuarioAbierto((abierto) => !abierto)}
                                >
                                    <span className="home-user-avatar">{obtenerIniciales(user.name)}</span>
                                    <span className="home-user-name">{user.name}</span>
                                    <span className="home-user-arrow">v</span>
                                </button>

                                {menuUsuarioAbierto && (
                                    <div className="home-user-dropdown">
                                        <Link to="/perfil">Ver cuenta</Link>
                                        <Link to={user.role === "admin" ? "/dashboard" : "/recetas"}>
                                            Ir al panel
                                        </Link>
                                        <button type="button" onClick={cerrarSesion}>
                                            Cerrar sesion
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="home-auth-actions">
                                <Link className="home-login-link" to="/auth?modo=login">
                                    Iniciar sesion
                                </Link>
                                <Link className="home-register-link" to="/auth?modo=registro">
                                    Crear cuenta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <section className="home-hero">
                    <div className="home-hero-overlay">
                        <div className="home-hero-inner">
                            <div className="home-hero-copy">
                                <span className="home-kicker">Recetario digital</span>
                                <h1>Encuentra, guarda y comparte tus mejores recetas.</h1>
                                <p>
                                    Una portada mas viva para ChefIA: busqueda rapida, recetas
                                    destacadas, categorias y accesos claros para empezar a cocinar.
                                </p>

                                <div className="home-hero-actions">
                                    <a href="#recetas">Ver recetas</a>
                                    {!user && <Link to="/auth?modo=registro">Crear cuenta</Link>}
                                </div>
                            </div>

                            <div className="home-search-panel">
                                <span>Buscar ahora</span>
                                <label htmlFor="buscar-receta">Que quieres cocinar?</label>
                                <div className="home-search-row">
                                    <input
                                        id="buscar-receta"
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        placeholder="Tacos, pasta, postre, ensalada..."
                                    />
                                    <a href="#recetas">Buscar</a>
                                </div>

                                <div className="home-stats">
                                    <div>
                                        <strong>{todasLasRecetas.length}</strong>
                                        <small>Recetas</small>
                                    </div>
                                    <div>
                                        <strong>{totalCategorias}</strong>
                                        <small>Categorias</small>
                                    </div>
                                    <div>
                                        <strong>{recetasPremium}</strong>
                                        <small>Premium</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="categorias" className="home-section home-categories-section">
                    <div className="home-section-heading">
                        <div>
                            <span>Explora</span>
                            <h2>Categorias populares</h2>
                        </div>
                        {categoriaActiva && (
                            <button
                                type="button"
                                className="home-clear-filter"
                                onClick={() => setCategoriaActiva("")}
                            >
                                Limpiar filtro
                            </button>
                        )}
                    </div>

                    <div className="home-category-grid">
                        {categoriasParaMostrar.map((categoria) => {
                            const activa = categoriaActiva === categoria.nombre;

                            return (
                                <button
                                    key={categoria.nombre}
                                    type="button"
                                    onClick={() => setCategoriaActiva(activa ? "" : categoria.nombre)}
                                    className={`home-category-card ${activa ? "active" : ""}`}
                                >
                                    <span>{categoria.inicial}</span>
                                    <strong>{categoria.nombre}</strong>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section id="recetas" className="home-section">
                    <div className="home-section-heading">
                        <div>
                            <span>ChefIA recomienda</span>
                            <h2>{busqueda || categoriaActiva ? "Resultados" : "Recetas destacadas"}</h2>
                        </div>
                        <p>
                            {recetasAMostrar.length} resultado{recetasAMostrar.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    {error && <div className="home-error">{error}</div>}

                    {!error && recetasAMostrar.length === 0 && (
                        <div className="home-empty-state">
                            <div>
                                <span>Aun no hay contenido</span>
                                <h3>Tu portada ya esta lista para lucir recetas.</h3>
                                <p>
                                    Cuando agregues recetas desde el backend o el panel, apareceran
                                    aqui en formato de tarjetas. Tambien podras filtrar por nombre,
                                    descripcion o categoria.
                                </p>
                                <div className="home-empty-actions">
                                    <Link to={user ? "/recetas" : "/auth?modo=login"}>
                                        Entrar al sistema
                                    </Link>
                                    <a href="#categorias">Ver categorias</a>
                                </div>
                            </div>
                            <div className="home-empty-image" aria-hidden="true" />
                        </div>
                    )}

                    {!error && recetasAMostrar.length > 0 && (
                        <div className="home-recipes-grid">
                            {recetasAMostrar.map((receta) => (
                                <Link key={receta.id} to={`/recetas/${receta.id}`} className="home-recipe-card">
                                    <div className="home-recipe-image">
                                        {receta.imagen ? (
                                            <img src={receta.imagen} alt={receta.titulo} />
                                        ) : (
                                            <span>ChefIA</span>
                                        )}
                                        {receta.es_premium && <b>Premium</b>}
                                    </div>
                                    <div className="home-recipe-body">
                                        <small>{receta.categoria?.nombre || "Sin categoria"}</small>
                                        <h3>{receta.titulo}</h3>
                                        <p>{receta.descripcion || "Receta lista para descubrir."}</p>
                                        <div>
                                            <span>{receta.tiempo_preparacion || "--"} min</span>
                                            <strong>Ver receta</strong>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section id="inspiracion" className="home-inspiration">
                    <div>
                        <span>Siguiente mejora</span>
                        <h2>Una base visual solida para seguir creciendo.</h2>
                        <p>
                            Esta pantalla ya puede recibir tus recetas reales. Despues podemos mejorar
                            el panel de admin para crear recetas con imagen, precio, categoria y vista previa.
                        </p>
                    </div>
                    <div className="home-quick-links">
                        <p>Acceso rapido</p>
                        <Link to={user ? "/recetas" : "/auth?modo=login"}>Panel de recetas</Link>
                        {user?.role === "admin" && <Link to="/dashboard">Dashboard admin</Link>}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
