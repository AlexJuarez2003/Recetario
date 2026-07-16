import { useEffect, useMemo, useState } from "react";
import Loading from "../../components/Loading";
import "./Dashboard.css";

const formatoDinero = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });

const contarPor = (lista, obtenerLlave) =>
    lista.reduce((acumulado, item) => {
        const llave = obtenerLlave(item);
        if (!llave) return acumulado;
        acumulado[llave] = (acumulado[llave] || 0) + 1;
        return acumulado;
    }, {});

const ordenarConteo = (conteo, resolverTitulo) =>
    Object.entries(conteo)
        .map(([id, total]) => ({
            id,
            total,
            titulo: resolverTitulo(id),
        }))
        .sort((a, b) => b.total - a.total);

const fetchJson = async (url, token) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "No se pudo cargar la informacion del dashboard");
    }

    return data;
};

const Dashboard = () => {
    const [datos, setDatos] = useState({
        recetas: [],
        categorias: [],
        usuarios: [],
        comentarios: [],
        favoritos: [],
        reporteVentas: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarDashboard = async () => {
            try {
                const token = localStorage.getItem("token");

                const [
                    recetas,
                    categorias,
                    usuarios,
                    comentarios,
                    favoritos,
                    reporteVentas,
                ] = await Promise.all([
                    fetchJson("/api/recetas", token),
                    fetchJson("/api/categorias", token),
                    fetchJson("/api/usuarios", token),
                    fetchJson("/api/comentarios", token),
                    fetchJson("/api/favoritos", token),
                    fetchJson("/api/compras/reporte/ventas", token),
                ]);

                setDatos({
                    recetas,
                    categorias,
                    usuarios,
                    comentarios,
                    favoritos,
                    reporteVentas,
                });
            } catch (err) {
                console.log(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        cargarDashboard();
    }, []);

    const metricas = useMemo(() => {
        const recetasPremium = datos.recetas.filter((receta) => receta.es_premium);
        const recetasGratis = datos.recetas.length - recetasPremium.length;
        const admins = datos.usuarios.filter((usuario) => usuario.role === "admin").length;
        const totalVentas = datos.reporteVentas?.resumen?.total_ventas || 0;
        const totalCompras = datos.reporteVentas?.resumen?.total_compras || 0;

        return {
            recetas: datos.recetas.length,
            recetasPremium: recetasPremium.length,
            recetasGratis,
            usuarios: datos.usuarios.length,
            admins,
            categorias: datos.categorias.length,
            comentarios: datos.comentarios.length,
            favoritos: datos.favoritos.length,
            totalVentas,
            totalCompras,
        };
    }, [datos]);

    const recetaPorId = useMemo(() => {
        const mapa = new Map();
        datos.recetas.forEach((receta) => mapa.set(String(receta.id), receta));
        return mapa;
    }, [datos.recetas]);

    const recetasMasGuardadas = useMemo(() => {
        const conteo = contarPor(datos.favoritos, (favorito) => favorito.receta_id);
        return ordenarConteo(conteo, (id) => recetaPorId.get(String(id))?.titulo || "Receta eliminada").slice(0, 5);
    }, [datos.favoritos, recetaPorId]);

    const recetasMasComentadas = useMemo(() => {
        const conteo = contarPor(datos.comentarios, (comentario) => comentario.receta_id);
        return ordenarConteo(conteo, (id) => recetaPorId.get(String(id))?.titulo || "Receta eliminada").slice(0, 5);
    }, [datos.comentarios, recetaPorId]);

    const recetasPorCategoria = useMemo(() => {
        const conteo = contarPor(datos.recetas, (receta) => receta.categoria?.nombre || "Sin categoria");
        return Object.entries(conteo)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => b.total - a.total);
    }, [datos.recetas]);

    const recetasRecientes = useMemo(() =>
        [...datos.recetas]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 5),
    [datos.recetas]);

    const ventasPorReceta = datos.reporteVentas?.ventas_por_receta || [];
    const comprasRecientes = datos.reporteVentas?.compras_recientes || [];
    const maxCategoria = Math.max(...recetasPorCategoria.map((categoria) => categoria.total), 1);

    if (loading) {
        return <Loading message="Cargando dashboard" />;
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-error">
                    <span>Error</span>
                    <h1>No se pudo cargar el dashboard</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <span>Panel administrativo</span>
                    <h1>Dashboard de ChefIA</h1>
                    <p>
                        Vista general del movimiento de tu recetario: ventas, recetas,
                        usuarios, favoritos y comentarios en un solo lugar.
                    </p>
                </div>

                <div className="dashboard-revenue-card">
                    <small>Ingresos por recetas premium</small>
                    <strong>{formatoDinero(metricas.totalVentas)}</strong>
                    <p>{metricas.totalCompras} compra{metricas.totalCompras === 1 ? "" : "s"} registrada{metricas.totalCompras === 1 ? "" : "s"}</p>
                </div>
            </section>

            <section className="dashboard-metrics">
                <article>
                    <span>Recetas</span>
                    <strong>{metricas.recetas}</strong>
                    <small>{metricas.recetasPremium} premium / {metricas.recetasGratis} gratis</small>
                </article>
                <article>
                    <span>Usuarios</span>
                    <strong>{metricas.usuarios}</strong>
                    <small>{metricas.admins} administrador{metricas.admins === 1 ? "" : "es"}</small>
                </article>
                <article>
                    <span>Categorias</span>
                    <strong>{metricas.categorias}</strong>
                    <small>Organizacion del recetario</small>
                </article>
                <article>
                    <span>Interacciones</span>
                    <strong>{metricas.favoritos + metricas.comentarios}</strong>
                    <small>{metricas.favoritos} favoritos / {metricas.comentarios} comentarios</small>
                </article>
            </section>

            <section className="dashboard-grid">
                <article className="dashboard-panel dashboard-large-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <span>Ventas</span>
                            <h2>Recetas mas vendidas</h2>
                        </div>
                    </div>

                    {ventasPorReceta.length === 0 ? (
                        <p className="dashboard-empty">Aun no hay ventas registradas.</p>
                    ) : (
                        <div className="dashboard-sales-list">
                            {ventasPorReceta.slice(0, 5).map((venta, index) => (
                                <div key={venta.receta_id} className="dashboard-sale-item">
                                    <span>{index + 1}</span>
                                    <div>
                                        <strong>{venta.receta?.titulo || "Receta sin titulo"}</strong>
                                        <small>{venta.veces_comprada} compra{venta.veces_comprada === 1 ? "" : "s"}</small>
                                    </div>
                                    <b>{formatoDinero(venta.total_generado)}</b>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <span>Favoritos</span>
                            <h2>Mas guardadas</h2>
                        </div>
                    </div>

                    <div className="dashboard-ranking">
                        {recetasMasGuardadas.length === 0 ? (
                            <p className="dashboard-empty">Aun no hay favoritos.</p>
                        ) : recetasMasGuardadas.map((receta, index) => (
                            <div key={receta.id}>
                                <span>{index + 1}</span>
                                <p>{receta.titulo}</p>
                                <strong>{receta.total}</strong>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <span>Comentarios</span>
                            <h2>Mas comentadas</h2>
                        </div>
                    </div>

                    <div className="dashboard-ranking">
                        {recetasMasComentadas.length === 0 ? (
                            <p className="dashboard-empty">Aun no hay comentarios.</p>
                        ) : recetasMasComentadas.map((receta, index) => (
                            <div key={receta.id}>
                                <span>{index + 1}</span>
                                <p>{receta.titulo}</p>
                                <strong>{receta.total}</strong>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <span>Categorias</span>
                            <h2>Distribucion</h2>
                        </div>
                    </div>

                    <div className="dashboard-bars">
                        {recetasPorCategoria.map((categoria) => (
                            <div key={categoria.nombre}>
                                <div>
                                    <span>{categoria.nombre}</span>
                                    <strong>{categoria.total}</strong>
                                </div>
                                <progress max={maxCategoria} value={categoria.total} />
                            </div>
                        ))}
                    </div>
                </article>

                <article className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <span>Contenido</span>
                            <h2>Recetas recientes</h2>
                        </div>
                    </div>

                    <div className="dashboard-recent-list">
                        {recetasRecientes.map((receta) => (
                            <div key={receta.id}>
                                <strong>{receta.titulo}</strong>
                                <small>{receta.categoria?.nombre || "Sin categoria"} · {receta.es_premium ? "Premium" : "Gratis"}</small>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="dashboard-panel dashboard-large-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <span>Actividad</span>
                            <h2>Compras recientes</h2>
                        </div>
                    </div>

                    {comprasRecientes.length === 0 ? (
                        <p className="dashboard-empty">Aun no hay compras recientes.</p>
                    ) : (
                        <div className="dashboard-purchases">
                            {comprasRecientes.slice(0, 6).map((compra) => (
                                <div key={compra.id}>
                                    <div>
                                        <strong>{compra.usuario?.name || "Usuario"}</strong>
                                        <small>compro {compra.receta?.titulo || "una receta"}</small>
                                    </div>
                                    <b>{formatoDinero(compra.precio_pagado)}</b>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>
        </div>
    );
};

export default Dashboard;
