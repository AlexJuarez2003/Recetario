import { useEffect, useMemo, useState } from "react";
import Loading from "../../components/Loading";
import { deleteCompra, getReporteVentas } from "../../helpers/compras";
import "./Ventas.css";

const dinero = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });

const fecha = (valor) =>
    new Date(valor).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const Ventas = () => {
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const cargarVentas = async () => {
        setError("");
        try {
            const data = await getReporteVentas();
            setReporte(data);
        } catch (err) {
            setError(err.message || "No se pudieron cargar las ventas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarVentas();
    }, []);

    const eliminarVenta = async (compra) => {
        const ok = window.confirm(`Quieres eliminar la venta de "${compra.receta?.titulo || "esta receta"}"?`);
        if (!ok) return;

        setSaving(true);
        try {
            await deleteCompra(compra.id);
            await cargarVentas();
        } catch (err) {
            setError(err.message || "No se pudo eliminar la venta.");
        } finally {
            setSaving(false);
        }
    };

    const ventasPorReceta = reporte?.ventas_por_receta || [];
    const compras = reporte?.compras_recientes || [];
    const resumen = reporte?.resumen || {};

    const ticketPromedio = useMemo(() => {
        if (!resumen.total_compras) return 0;
        return Number(resumen.total_ventas || 0) / Number(resumen.total_compras);
    }, [resumen]);

    if (loading) return <Loading message="Cargando ventas" />;

    return (
        <section className="admin-crud-page ventas-page">
            <div className="admin-crud-hero">
                <div>
                    <span>Administracion</span>
                    <h1>Ventas premium</h1>
                    <p>Revisa las compras simuladas, ingresos generados y recetas premium con mejor movimiento.</p>
                </div>
            </div>

            <div className="admin-crud-metrics">
                <article>
                    <span>Ingresos</span>
                    <strong>{dinero(resumen.total_ventas)}</strong>
                    <small>total simulado</small>
                </article>
                <article>
                    <span>Compras</span>
                    <strong>{resumen.total_compras || 0}</strong>
                    <small>ventas registradas</small>
                </article>
                <article>
                    <span>Ticket</span>
                    <strong>{dinero(ticketPromedio)}</strong>
                    <small>promedio por compra</small>
                </article>
            </div>

            {error && <div className="admin-crud-alert">{error}</div>}

            <div className="ventas-grid">
                <article className="admin-crud-panel">
                    <div className="admin-crud-panel-head">
                        <div>
                            <span>Ranking</span>
                            <h2>Mas vendidas</h2>
                        </div>
                    </div>

                    {ventasPorReceta.length === 0 ? (
                        <p className="admin-crud-empty">Aun no hay ventas registradas.</p>
                    ) : (
                        <div className="ventas-ranking">
                            {ventasPorReceta.map((venta, index) => (
                                <div key={venta.receta_id}>
                                    <span>{index + 1}</span>
                                    <div>
                                        <strong>{venta.receta?.titulo || "Receta sin titulo"}</strong>
                                        <small>{venta.veces_comprada} compra{venta.veces_comprada === 1 ? "" : "s"}</small>
                                    </div>
                                    <b>{dinero(venta.total_generado)}</b>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article className="admin-crud-panel ventas-table-panel">
                    <div className="admin-crud-panel-head">
                        <div>
                            <span>Actividad</span>
                            <h2>Compras recientes</h2>
                        </div>
                        {saving && <small>Actualizando...</small>}
                    </div>

                    {compras.length === 0 ? (
                        <p className="admin-crud-empty">Todavia no hay compras recientes.</p>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Receta</th>
                                        <th>Monto</th>
                                        <th>Fecha</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compras.map((compra) => (
                                        <tr key={compra.id}>
                                            <td>{compra.usuario?.name || "Usuario"}</td>
                                            <td>{compra.receta?.titulo || "Receta eliminada"}</td>
                                            <td>{dinero(compra.precio_pagado)}</td>
                                            <td>{fecha(compra.created_at)}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="admin-action-btn admin-action-danger"
                                                    onClick={() => eliminarVenta(compra)}
                                                    disabled={saving}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </article>
            </div>
        </section>
    );
};

export default Ventas;
