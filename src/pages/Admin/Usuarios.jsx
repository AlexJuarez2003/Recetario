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

const Usuarios = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [modal, setModal] = useState({ open: false, data: null });
    const { user } = useContext(UserContext);

    const resumen = useMemo(() => {
        const admins = users.filter((item) => item.role === "admin").length;
        const usuarios = users.filter((item) => item.role === "usuario").length;

        return {
            total: users.length,
            admins,
            usuarios,
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
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn admin-action-danger"
                                                        onClick={() => eliminarUsuario(usuario)}
                                                    >
                                                        Eliminar
                                                    </button>
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
        </section>
    );
};

export default Usuarios;
