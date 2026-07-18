import { useEffect, useMemo, useState } from "react";
import {
    createCategoria,
    deleteCategoria,
    getCategorias,
    updateCategoria,
} from "../../helpers/categorias.js";
import FormCategoria from "../../components/FormCategoria.jsx";
import Loading from "../../components/Loading.jsx";
import "./Categorias.css";

const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [modal, setModal] = useState({ open: false, data: null });

    const resumen = useMemo(() => {
        const recientes = categorias.filter((categoria) => {
            if (!categoria.created_at) return false;
            const created = new Date(categoria.created_at).getTime();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            return Date.now() - created < sevenDays;
        }).length;

        return {
            total: categorias.length,
            recientes,
            editadas: categorias.filter((categoria) => categoria.updated_at && categoria.updated_at !== categoria.created_at).length,
        };
    }, [categorias]);

    const traerCategorias = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getCategorias();
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("No pude cargar las categorias. Revisa la conexion con el backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        traerCategorias();
    }, []);

    const guardarCategoria = async (datos) => {
        setSaving(true);
        setError("");

        try {
            if (datos.id) {
                const actualizada = await updateCategoria(datos.id, datos.nombre, datos.descripcion);
                setCategorias((prev) => prev.map((item) => (item.id === actualizada.id ? actualizada : item)));
            } else {
                const creada = await createCategoria(datos.nombre, datos.descripcion);
                setCategorias((prev) => [creada, ...prev]);
            }

            setModal({ open: false, data: null });
        } catch (err) {
            setError(err.message || "No se pudo guardar la categoria.");
        } finally {
            setSaving(false);
        }
    };

    const eliminarCategoria = async (categoria) => {
        const ok = window.confirm(`Quieres eliminar la categoria "${categoria.nombre}"? Sus recetas relacionadas tambien pueden eliminarse.`);
        if (!ok) return;

        setSaving(true);
        setError("");

        try {
            await deleteCategoria(categoria.id);
            setCategorias((prev) => prev.filter((item) => item.id !== categoria.id));
        } catch (err) {
            setError(err.message || "No se pudo eliminar la categoria.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="admin-crud-page">
            <div className="admin-crud-hero">
                <div>
                    <span>Catalogo de recetas</span>
                    <h1>Categorias disponibles</h1>
                    <p>
                        Ordena el recetario con categorias claras para que los usuarios encuentren ideas rapido.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => setModal({ open: true, data: null })}
                    disabled={saving}
                >
                    Nueva categoria
                </button>
            </div>

            <div className="admin-crud-metrics">
                <article>
                    <span>Total</span>
                    <strong>{resumen.total}</strong>
                    <small>categorias activas</small>
                </article>
                <article>
                    <span>Recientes</span>
                    <strong>{resumen.recientes}</strong>
                    <small>creadas esta semana</small>
                </article>
                <article>
                    <span>Editadas</span>
                    <strong>{resumen.editadas}</strong>
                    <small>con ajustes guardados</small>
                </article>
            </div>

            {error && <div className="admin-crud-alert">{error}</div>}

            <div className="admin-crud-panel">
                <div className="admin-crud-panel-head">
                    <div>
                        <span>Organizacion</span>
                        <h2>Lista de categorias</h2>
                    </div>
                    {saving && <small>Guardando cambios...</small>}
                </div>

                {loading ? (
                    <Loading message="Cargando categorias" />
                ) : categorias.length === 0 ? (
                    <div className="admin-crud-empty">Todavia no hay categorias registradas.</div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Categoria</th>
                                    <th>Descripcion</th>
                                    <th>Creacion</th>
                                    <th>Modificacion</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map((categoria) => (
                                    <tr key={categoria.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <span>{categoria.nombre?.charAt(0)?.toUpperCase() || "C"}</span>
                                                <div>
                                                    <strong>{categoria.nombre}</strong>
                                                    <small>#{categoria.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-muted-cell">{categoria.descripcion || "Sin descripcion"}</td>
                                        <td>{formatDate(categoria.created_at)}</td>
                                        <td>{formatDate(categoria.updated_at)}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <button
                                                    type="button"
                                                    className="admin-action-btn"
                                                    onClick={() => setModal({ open: true, data: categoria })}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-action-btn admin-action-danger"
                                                    onClick={() => eliminarCategoria(categoria)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <FormCategoria
                isOpen={modal.open}
                onClose={() => setModal({ open: false, data: null })}
                onSave={guardarCategoria}
                data={modal.data}
            />
        </section>
    );
};

export default Categorias;
