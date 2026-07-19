import { useContext, useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, getUsuarios, updateUser } from "../../helpers/usuarios";
import FormUsuarios from "../../components/FormUsuarios";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import "./Usuarios.css";

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

const estaSuspendido = (usuario) => {
    if (usuario.suspended_indefinitely) return true;
    if (!usuario.suspended_until) return false;

    return new Date(usuario.suspended_until) > new Date();
};

const estadoSuspension = (usuario) => {
    if (usuario.suspended_indefinitely) return "Indefinida";
    if (usuario.suspended_until && new Date(usuario.suspended_until) > new Date()) {
        return `Hasta ${formatDate(usuario.suspended_until)}`;
    }

    return "Activa";
};

const Usuarios = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [modal, setModal] = useState({ open: false, data: null });
    const [suspensionModal, setSuspensionModal] = useState({ open: false, data: null });
    const [suspensionData, setSuspensionData] = useState({
        tipo: "7",
        fecha: "",
        motivo: "",
    });
    const { user } = useContext(UserContext);

    const resumen = useMemo(() => {
        const admins = users.filter((item) => item.role === "admin").length;
        const usuarios = users.filter((item) => item.role === "usuario").length;
        const suspendidos = users.filter((item) => estaSuspendido(item)).length;

        return {
            total: users.length,
            admins,
            usuarios,
            suspendidos,
        };
    }, [users]);

    const traerUsuarios = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getUsuarios();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("No pude cargar los usuarios. Revisa que tu sesion admin siga activa.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        traerUsuarios();
    }, []);

    const guardarUsuario = async (formData) => {
        setSaving(true);
        setError("");

        try {
            if (formData.id) {
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                };

                if (formData.password) {
                    payload.password = formData.password;
                }

                const actualizado = await updateUser(formData.id, payload);
                setUsers((prev) => prev.map((item) => (item.id === actualizado.id ? actualizado : item)));
            } else {
                const creado = await createUser(formData.name, formData.email, formData.password, formData.role);
                setUsers((prev) => [creado, ...prev]);
            }

            setModal({ open: false, data: null });
        } catch (err) {
            setError(err.message || "No se pudo guardar el usuario.");
        } finally {
            setSaving(false);
        }
    };

    const eliminarUsuario = async (usuario) => {
        if (user?.id === usuario.id) return;

        const ok = window.confirm(`Quieres eliminar a ${usuario.name}? Tambien se eliminaran sus recetas y actividad.`);
        if (!ok) return;

        setSaving(true);
        setError("");

        try {
            await deleteUser(usuario.id);
            setUsers((prev) => prev.filter((item) => item.id !== usuario.id));
        } catch (err) {
            setError(err.message || "No se pudo eliminar el usuario.");
        } finally {
            setSaving(false);
        }
    };

    const abrirSuspension = (usuario) => {
        setSuspensionData({
            tipo: "7",
            fecha: "",
            motivo: usuario.suspension_reason || "",
        });
        setSuspensionModal({ open: true, data: usuario });
    };

    const reactivarUsuario = async (usuario) => {
        if (user?.id === usuario.id) return;

        setSaving(true);
        setError("");

        try {
            const actualizado = await updateUser(usuario.id, {
                suspended_until: null,
                suspended_indefinitely: false,
                suspension_reason: null,
            });
            setUsers((prev) => prev.map((item) => (item.id === actualizado.id ? actualizado : item)));
        } catch (err) {
            setError(err.message || "No se pudo reactivar el usuario.");
        } finally {
            setSaving(false);
        }
    };

    const guardarSuspension = async (e) => {
        e.preventDefault();
        const usuario = suspensionModal.data;
        if (!usuario || user?.id === usuario.id) return;

        let suspendedUntil = null;
        const indefinitely = suspensionData.tipo === "indefinido";

        if (!indefinitely) {
            if (suspensionData.tipo === "custom") {
                suspendedUntil = suspensionData.fecha ? new Date(suspensionData.fecha).toISOString() : null;
            } else {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() + Number(suspensionData.tipo));
                suspendedUntil = fecha.toISOString();
            }
        }

        setSaving(true);
        setError("");

        try {
            const actualizado = await updateUser(usuario.id, {
                suspended_until: suspendedUntil,
                suspended_indefinitely: indefinitely,
                suspension_reason: suspensionData.motivo || "Suspendido desde el panel admin",
            });
            setUsers((prev) => prev.map((item) => (item.id === actualizado.id ? actualizado : item)));
            setSuspensionModal({ open: false, data: null });
        } catch (err) {
            setError(err.message || "No se pudo suspender el usuario.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="admin-crud-page">
            <div className="admin-crud-hero">
                <div>
                    <span>Control de accesos</span>
                    <h1>Usuarios registrados</h1>
                    <p>
                        Administra quien puede entrar a ChefIA, cambia roles y crea nuevas cuentas desde el panel.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => setModal({ open: true, data: null })}
                    disabled={saving}
                >
                    Nuevo usuario
                </button>
            </div>

            <div className="admin-crud-metrics">
                <article>
                    <span>Total</span>
                    <strong>{resumen.total}</strong>
                    <small>cuentas creadas</small>
                </article>
                <article>
                    <span>Admins</span>
                    <strong>{resumen.admins}</strong>
                    <small>con acceso completo</small>
                </article>
                <article>
                    <span>Usuarios</span>
                    <strong>{resumen.usuarios}</strong>
                    <small>panel de recetas</small>
                </article>
                <article>
                    <span>Suspendidos</span>
                    <strong>{resumen.suspendidos}</strong>
                    <small>acceso bloqueado</small>
                </article>
            </div>

            {error && <div className="admin-crud-alert">{error}</div>}

            <div className="admin-crud-panel">
                <div className="admin-crud-panel-head">
                    <div>
                        <span>Directorio</span>
                        <h2>Cuentas del sistema</h2>
                    </div>
                    {saving && <small>Guardando cambios...</small>}
                </div>

                {loading ? (
                    <Loading message="Cargando usuarios" />
                ) : users.length === 0 ? (
                    <div className="admin-crud-empty">Todavia no hay usuarios registrados.</div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <span>{usuario.name?.charAt(0)?.toUpperCase() || "U"}</span>
                                                <div>
                                                    <strong>
                                                        {usuario.name}
                                                        {user?.id === usuario.id ? " (Yo)" : ""}
                                                    </strong>
                                                    <small>#{usuario.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{usuario.email}</td>
                                        <td>
                                            <span className={`admin-pill admin-pill-${usuario.role}`}>
                                                {usuario.role === "admin" ? "Administrador" : "Usuario"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`admin-pill ${estaSuspendido(usuario) ? "admin-pill-suspended" : "admin-pill-active"}`}>
                                                {estadoSuspension(usuario)}
                                            </span>
                                            {usuario.suspension_reason && (
                                                <small className="admin-status-note">{usuario.suspension_reason}</small>
                                            )}
                                        </td>
                                        <td>{formatDate(usuario.created_at)}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <button
                                                    type="button"
                                                    className="admin-action-btn"
                                                    onClick={() => setModal({ open: true, data: usuario })}
                                                >
                                                    Editar
                                                </button>
                                                {user?.id !== usuario.id && (
                                                    <>
                                                        {estaSuspendido(usuario) ? (
                                                            <button
                                                                type="button"
                                                                className="admin-action-btn"
                                                                onClick={() => reactivarUsuario(usuario)}
                                                            >
                                                                Reactivar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="admin-action-btn admin-action-warn"
                                                                onClick={() => abrirSuspension(usuario)}
                                                            >
                                                                Suspender
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn admin-action-danger"
                                                            onClick={() => eliminarUsuario(usuario)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <FormUsuarios
                isOpen={modal.open}
                onClose={() => setModal({ open: false, data: null })}
                onSave={guardarUsuario}
                data={modal.data}
            />

            {suspensionModal.open && (
                <div className="admin-modal-backdrop" onClick={() => setSuspensionModal({ open: false, data: null })}>
                    <form className="admin-modal" onSubmit={guardarSuspension} onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-heading">
                            <span>Suspension</span>
                            <h2>Suspender usuario</h2>
                            <p>
                                La cuenta de {suspensionModal.data?.name} no podra iniciar sesion hasta que termine el plazo o la reactives.
                            </p>
                        </div>

                        <div className="admin-form">
                            <label>
                                <span>Duracion</span>
                                <select
                                    value={suspensionData.tipo}
                                    onChange={(e) => setSuspensionData((prev) => ({ ...prev, tipo: e.target.value }))}
                                >
                                    <option value="1">1 dia</option>
                                    <option value="7">7 dias</option>
                                    <option value="30">30 dias</option>
                                    <option value="custom">Fecha personalizada</option>
                                    <option value="indefinido">Indefinida</option>
                                </select>
                            </label>

                            {suspensionData.tipo === "custom" && (
                                <label>
                                    <span>Suspender hasta</span>
                                    <input
                                        type="datetime-local"
                                        value={suspensionData.fecha}
                                        onChange={(e) => setSuspensionData((prev) => ({ ...prev, fecha: e.target.value }))}
                                        required
                                    />
                                </label>
                            )}

                            <label>
                                <span>Motivo</span>
                                <textarea
                                    rows="3"
                                    value={suspensionData.motivo}
                                    onChange={(e) => setSuspensionData((prev) => ({ ...prev, motivo: e.target.value }))}
                                    placeholder="Ej. actividad sospechosa, spam, incumplimiento..."
                                />
                            </label>
                        </div>

                        <div className="admin-modal-actions">
                            <button
                                type="button"
                                className="admin-btn admin-btn-ghost"
                                onClick={() => setSuspensionModal({ open: false, data: null })}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                {saving ? "Guardando..." : "Suspender"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
};

export default Usuarios;
