import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import { getCompras } from "../../helpers/compras";
import "./MisCompras.css";

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

const MisCompras = () => {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarCompras = async () => {
            try {
                const data = await getCompras();
                setCompras(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "No pude cargar tus compras.");
            } finally {
                setLoading(false);
            }
        };

        cargarCompras();
    }, []);

    const total = useMemo(
        () => compras.reduce((sum, compra) => sum + Number(compra.precio_pagado || 0), 0),
        [compras],
    );

    if (loading) return <Loading message="Cargando tus compras" />;

    return (
        <section className="mis-compras-page">
            <div className="mis-compras-hero">
                <div>
                    <span>Recibos</span>
                    <h1>Tus compras</h1>
                    <p>Consulta las recetas premium que compraste y guarda el recibo visual de cada compra simulada.</p>
                </div>
                <div className="mis-compras-total">
                    <small>Total pagado</small>
                    <strong>{dinero(total)}</strong>
                    <p>{compras.length} compra{compras.length === 1 ? "" : "s"} registrada{compras.length === 1 ? "" : "s"}</p>
                </div>
            </div>

            {error && <div className="mis-compras-alert">{error}</div>}

            {compras.length === 0 ? (
                <div className="mis-compras-empty">
                    <span>Sin compras todavia</span>
                    <h2>Aun no tienes recibos.</h2>
                    <p>Cuando compres una receta premium, su comprobante aparecera aqui.</p>
                    <Link to="/recetas">Explorar recetas</Link>
                </div>
            ) : (
                <div className="mis-compras-list">
                    {compras.map((compra) => (
                        <article key={compra.id} className="mis-compra-recibo">
                            <header>
                                <div>
                                    <span>Recibo ChefIA</span>
                                    <h2>Compra #{compra.id}</h2>
                                    <p>{fecha(compra.created_at)}</p>
                                </div>
                                <strong>{dinero(compra.precio_pagado)}</strong>
                            </header>

                            <div className="mis-compra-body">
                                <img src={compra.receta?.imagen || "/img/fondo-login.webp"} alt={compra.receta?.titulo || "Receta"} />
                                <div>
                                    <small>{compra.receta?.categoria?.nombre || "Premium"}</small>
                                    <h3>{compra.receta?.titulo || "Receta premium"}</h3>
                                    <p>{compra.receta?.descripcion || "Receta desbloqueada para tu cuenta."}</p>
                                    <dl>
                                        <div>
                                            <dt>Estado</dt>
                                            <dd>Pagado demo</dd>
                                        </div>
                                        <div>
                                            <dt>Metodo</dt>
                                            <dd>Tarjeta simulada</dd>
                                        </div>
                                        <div>
                                            <dt>Acceso</dt>
                                            <dd>Receta completa</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <footer>
                                <span>Gracias por cocinar con ChefIA</span>
                                <Link to={`/recetas/${compra.receta_id}`}>Ver receta</Link>
                            </footer>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default MisCompras;
