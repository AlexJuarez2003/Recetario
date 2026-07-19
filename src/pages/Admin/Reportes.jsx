import { useEffect, useMemo, useState } from "react";
import Loading from "../../components/Loading";
import { getCategorias } from "../../helpers/categorias";
import { getComentarios } from "../../helpers/comentarios";
import { getReporteVentas } from "../../helpers/compras";
import { getFavoritos } from "../../helpers/favoritos";
import { getRecetas } from "../../helpers/recetas";
import { getUsuarios } from "../../helpers/usuarios";
import "./Reportes.css";

const dinero = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });

const descargar = (nombre, contenido) => {
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(url);
};

const limpiar = (valor = "") =>
    String(valor).replaceAll('"', '""').replace(/\r?\n/g, " ");

const csv = (headers, rows) => [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${limpiar(cell)}"`).join(",")),
].join("\n");

const Reportes = () => {
    const [datos, setDatos] = useState({
        recetas: [],
        categorias: [],
        usuarios: [],
        comentarios: [],
        favoritos: [],
        ventas: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarReportes = async () => {
            try {
                const [recetas, categorias, usuarios, comentarios, favoritos, ventas] = await Promise.all([
                    getRecetas(),
                    getCategorias(),
                    getUsuarios(),
                    getComentarios(),
                    getFavoritos(),
                    getReporteVentas(),
                ]);

                setDatos({
                    recetas: Array.isArray(recetas) ? recetas : [],
                    categorias: Array.isArray(categorias) ? categorias : [],
                    usuarios: Array.isArray(usuarios) ? usuarios : [],
                    comentarios: Array.isArray(comentarios) ? comentarios : [],
                    favoritos: Array.isArray(favoritos) ? favoritos : [],
                    ventas,
                });
            } catch (err) {
                setError(err.message || "No se pudieron cargar los reportes.");
            } finally {
                setLoading(false);
            }
        };

        cargarReportes();
    }, []);

    const resumen = useMemo(() => {
        const premium = datos.recetas.filter((receta) => receta.es_premium).length;
        return {
            recetas: datos.recetas.length,
            premium,
            gratis: datos.recetas.length - premium,
            usuarios: datos.usuarios.length,
            categorias: datos.categorias.length,
            interacciones: datos.comentarios.length + datos.favoritos.length,
            ventas: datos.ventas?.resumen?.total_compras || 0,
            ingresos: datos.ventas?.resumen?.total_ventas || 0,
        };
    }, [datos]);

    const descargarRecetas = () => {
        descargar("chefia-recetas.csv", csv(
            ["id", "titulo", "categoria", "autor", "tipo", "precio", "favoritos", "comentarios", "compras"],
            datos.recetas.map((receta) => [
                receta.id,
                receta.titulo,
                receta.categoria?.nombre || "Sin categoria",
                receta.usuario?.name || "Sin autor",
                receta.es_premium ? "Premium" : "Gratis",
                receta.precio || 0,
                receta.favoritos_count || 0,
                receta.comentarios_count || 0,
                receta.compras_count || 0,
            ]),
        ));
    };

    const descargarVentas = () => {
        const compras = datos.ventas?.compras_recientes || [];
        descargar("chefia-ventas.csv", csv(
            ["id", "usuario", "receta", "monto", "fecha"],
            compras.map((compra) => [
                compra.id,
                compra.usuario?.name || "Usuario",
                compra.receta?.titulo || "Receta",
                compra.precio_pagado,
                compra.created_at,
            ]),
        ));
    };

    const descargarUsuarios = () => {
        descargar("chefia-usuarios.csv", csv(
            ["id", "nombre", "email", "rol", "fecha_registro"],
            datos.usuarios.map((usuario) => [
                usuario.id,
                usuario.name,
                usuario.email,
                usuario.role,
                usuario.created_at,
            ]),
        ));
    };

    if (loading) return <Loading message="Generando reportes" />;

    return (
        <section className="reportes-page">
            <div className="reportes-hero">
                <div>
                    <span>Administracion</span>
                    <h1>Reportes ChefIA</h1>
                    <p>Genera reportes de recetas, ventas y usuarios con los datos actuales del sistema.</p>
                </div>
                <button type="button" onClick={() => window.print()}>
                    Imprimir resumen
                </button>
            </div>

            {error && <div className="reportes-alert">{error}</div>}

            <div className="reportes-metrics">
                <article>
                    <span>Recetas</span>
                    <strong>{resumen.recetas}</strong>
                    <small>{resumen.premium} premium / {resumen.gratis} gratis</small>
                </article>
                <article>
                    <span>Ingresos</span>
                    <strong>{dinero(resumen.ingresos)}</strong>
                    <small>{resumen.ventas} compras</small>
                </article>
                <article>
                    <span>Usuarios</span>
                    <strong>{resumen.usuarios}</strong>
                    <small>{resumen.categorias} categorias</small>
                </article>
                <article>
                    <span>Interacciones</span>
                    <strong>{resumen.interacciones}</strong>
                    <small>favoritos y comentarios</small>
                </article>
            </div>

            <div className="reportes-grid">
                <article>
                    <span>Contenido</span>
                    <h2>Reporte de recetas</h2>
                    <p>Incluye titulo, categoria, autor, tipo, precio y conteos de actividad.</p>
                    <button type="button" onClick={descargarRecetas}>Descargar CSV</button>
                </article>
                <article>
                    <span>Ventas</span>
                    <h2>Reporte de compras</h2>
                    <p>Incluye compras simuladas, usuario, receta, monto y fecha.</p>
                    <button type="button" onClick={descargarVentas}>Descargar CSV</button>
                </article>
                <article>
                    <span>Accesos</span>
                    <h2>Reporte de usuarios</h2>
                    <p>Incluye usuarios registrados, correo, rol y fecha de alta.</p>
                    <button type="button" onClick={descargarUsuarios}>Descargar CSV</button>
                </article>
            </div>
        </section>
    );
};

export default Reportes;
