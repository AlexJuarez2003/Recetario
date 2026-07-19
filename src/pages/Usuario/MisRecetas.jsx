import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import { getCategorias } from "../../helpers/categorias";
import { createReceta, getRecetas } from "../../helpers/recetas";
import "./MisRecetas.css";

const formInicial = {
    titulo: "",
    descripcion: "",
    ingredientes: "",
    pasos: "",
    categoria_id: "",
    tiempo_preparacion: "",
    imagen: "/img/fondo-login.webp",
    es_premium: false,
    precio: "",
};

const fecha = (valor) =>
    new Date(valor).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const MisRecetas = () => {
    const { user } = useContext(UserContext);
    const [recetas, setRecetas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [formData, setFormData] = useState(formInicial);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const cargarDatos = async () => {
        setError("");
        try {
            const [recetasData, categoriasData] = await Promise.all([
                getRecetas(),
                getCategorias(),
            ]);

            const listaCategorias = Array.isArray(categoriasData) ? categoriasData : [];
            setCategorias(listaCategorias);
            setRecetas(Array.isArray(recetasData) ? recetasData : []);
            setFormData((prev) => ({
                ...prev,
                categoria_id: prev.categoria_id || listaCategorias[0]?.id || "",
            }));
        } catch (err) {
            setError(err.message || "No pude cargar tus recetas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const misRecetas = useMemo(
        () => recetas.filter((receta) => Number(receta.usuario_id) === Number(user?.id)),
        [recetas, user?.id],
    );

    const premium = misRecetas.filter((receta) => receta.es_premium).length;
    const gratis = misRecetas.length - premium;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const abrirFormulario = () => {
        setFormData({
            ...formInicial,
            categoria_id: categorias[0]?.id || "",
        });
        setError("");
        setModal(true);
    };

    const guardarReceta = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                ...formData,
                categoria_id: Number(formData.categoria_id),
                tiempo_preparacion: Number(formData.tiempo_preparacion || 0),
                precio: formData.es_premium ? Number(formData.precio || 0) : null,
            };

            const receta = await createReceta(payload);
            setRecetas((prev) => [receta, ...prev]);
            setModal(false);
        } catch (err) {
            setError(err.message || "No se pudo publicar la receta.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading message="Cargando tus recetas" />;

    return (
        <section className="mis-recetas-page">
            <div className="mis-recetas-hero">
                <div>
                    <span>Mi cocina</span>
                    <h1>Tus recetas</h1>
                    <p>Administra las recetas que subiste a ChefIA y publica nuevas ideas desde esta misma ventana.</p>
                </div>
                <button type="button" onClick={abrirFormulario}>
                    Subir receta
                </button>
            </div>

            <div className="mis-recetas-metrics">
                <article>
                    <span>Total</span>
                    <strong>{misRecetas.length}</strong>
                    <small>recetas publicadas</small>
                </article>
                <article>
                    <span>Gratis</span>
                    <strong>{gratis}</strong>
                    <small>visibles completas</small>
                </article>
                <article>
                    <span>Premium</span>
                    <strong>{premium}</strong>
                    <small>con venta simulada</small>
                </article>
            </div>

            {error && <div className="mis-recetas-alert">{error}</div>}

            {misRecetas.length === 0 ? (
                <div className="mis-recetas-empty">
                    <span>Sin publicaciones</span>
                    <h2>Aun no has subido recetas.</h2>
                    <p>Cuando publiques una receta aparecera aqui con sus visitas, favoritos y compras.</p>
                    <button type="button" onClick={abrirFormulario}>Publicar primera receta</button>
                </div>
            ) : (
                <div className="mis-recetas-grid">
                    {misRecetas.map((receta) => (
                        <article key={receta.id} className="mis-receta-card">
                            <img src={receta.imagen || "/img/fondo-login.webp"} alt={receta.titulo} />
                            <div>
                                <small>{receta.categoria?.nombre || "Sin categoria"} · {fecha(receta.created_at)}</small>
                                <h2>{receta.titulo}</h2>
                                <p>{receta.descripcion}</p>
                                <div className="mis-receta-stats">
                                    <span>{receta.favoritos_count || 0} me gusta</span>
                                    <span>{receta.comentarios_count || 0} comentarios</span>
                                    <span>{receta.compras_count || 0} compras</span>
                                </div>
                                <footer>
                                    <b>{receta.es_premium ? `Premium $${receta.precio}` : "Gratis"}</b>
                                    <Link to={`/recetas/${receta.id}`}>Ver detalle</Link>
                                </footer>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {modal && (
                <div className="mis-recetas-modal-backdrop" onClick={() => setModal(false)}>
                    <form className="mis-recetas-form" onSubmit={guardarReceta} onClick={(e) => e.stopPropagation()}>
                        <div className="mis-recetas-form-head">
                            <span>Nueva receta</span>
                            <h2>Publicar en ChefIA</h2>
                            <p>Llena los datos principales. Si marcas premium, ingredientes y pasos se bloquean hasta la compra.</p>
                        </div>

                        <label>
                            <span>Titulo</span>
                            <input name="titulo" value={formData.titulo} onChange={handleChange} required />
                        </label>

                        <label>
                            <span>Descripcion</span>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" required />
                        </label>

                        <div className="mis-recetas-form-grid">
                            <label>
                                <span>Categoria</span>
                                <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>Minutos</span>
                                <input type="number" min="1" name="tiempo_preparacion" value={formData.tiempo_preparacion} onChange={handleChange} required />
                            </label>
                        </div>

                        <label>
                            <span>Imagen</span>
                            <input name="imagen" value={formData.imagen} onChange={handleChange} />
                        </label>

                        <label>
                            <span>Ingredientes</span>
                            <textarea name="ingredientes" value={formData.ingredientes} onChange={handleChange} rows="5" required />
                        </label>

                        <label>
                            <span>Pasos</span>
                            <textarea name="pasos" value={formData.pasos} onChange={handleChange} rows="5" required />
                        </label>

                        <label className="mis-recetas-check">
                            <input type="checkbox" name="es_premium" checked={formData.es_premium} onChange={handleChange} />
                            <span>Receta premium</span>
                        </label>

                        {formData.es_premium && (
                            <label>
                                <span>Precio</span>
                                <input type="number" min="1" step="0.01" name="precio" value={formData.precio} onChange={handleChange} required />
                            </label>
                        )}

                        <div className="mis-recetas-form-actions">
                            <button type="button" onClick={() => setModal(false)}>Cancelar</button>
                            <button type="submit" disabled={saving}>{saving ? "Publicando..." : "Publicar receta"}</button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
};

export default MisRecetas;
