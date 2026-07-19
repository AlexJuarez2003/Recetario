import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
import { updateMe } from "../../helpers/me";
import "./Perfil.css";

const obtenerIniciales = (nombre = "Usuario") =>
    nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();

const formatearRol = (role = "usuario") =>
    role === "admin" ? "Administrador" : "Usuario";

const Perfil = () => {
    const { user, setUser, loading } = useContext(UserContext);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (!user || !modal) return;

        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
        });
        setError("");
    }, [user, modal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const guardarPerfil = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.password.trim()) {
                payload.password = formData.password;
            }

            const actualizado = await updateMe(payload);
            setUser(actualizado);
            setModal(false);
        } catch (err) {
            setError(err.message || "No se pudo actualizar el perfil.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading message="Cargando perfil" />;
    }

    if (!user) {
        return (
            <div className="perfil-page">
                <section className="perfil-empty">
                    <h1>Necesitas iniciar sesion</h1>
                    <p>Tu perfil solo esta disponible cuando entras con tu cuenta.</p>
                    <Link to="/auth?modo=login">Iniciar sesion</Link>
                </section>
            </div>
        );
    }

    return (
        <div className="perfil-page">
            <section className="perfil-hero">
                <div className="perfil-hero-copy">
                    <span>Mi cuenta</span>
                    <h1>Perfil de usuario</h1>
                    <p>
                        Revisa tu informacion principal dentro de ChefIA. Mas adelante aqui
                        Actualiza tus datos, revisa tu actividad y entra rapido a tus recetas dentro de ChefIA.
                    </p>
                </div>

                <div className="perfil-card">
                    <div className="perfil-avatar">{obtenerIniciales(user.name)}</div>
                    <div>
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                    </div>
                    <span className={`perfil-role ${user.role === "admin" ? "admin" : ""}`}>
                        {formatearRol(user.role)}
                    </span>
                </div>
            </section>

            <section className="perfil-content">
                <article className="perfil-info-panel">
                    <div className="perfil-panel-heading">
                        <span>Informacion personal</span>
                        <h2>Datos de la cuenta</h2>
                    </div>

                    <div className="perfil-info-grid">
                        <div className="perfil-info-item">
                            <small>Nombre</small>
                            <strong>{user.name}</strong>
                        </div>
                        <div className="perfil-info-item">
                            <small>Correo electronico</small>
                            <strong>{user.email}</strong>
                        </div>
                        <div className="perfil-info-item">
                            <small>Rol</small>
                            <strong>{formatearRol(user.role)}</strong>
                        </div>
                        <div className="perfil-info-item">
                            <small>ID de usuario</small>
                            <strong>#{user.id}</strong>
                        </div>
                    </div>

                    <div className="perfil-actions">
                        <button type="button" onClick={() => setModal(true)}>Editar perfil</button>
                        <Link to="/recetas">Ver recetas</Link>
                    </div>
                </article>

                <aside className="perfil-side-panel">
                    <span>Estado</span>
                    <h3>Cuenta activa</h3>
                    <p>
                        Tu sesion esta conectada correctamente con el backend de ChefIA.
                    </p>
                    {user.role === "admin" && (
                        <Link to="/dashboard">Abrir dashboard admin</Link>
                    )}
                </aside>
            </section>

            {modal && (
                <div className="perfil-modal-backdrop" onClick={() => setModal(false)}>
                    <section className="perfil-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="perfil-modal-heading">
                            <span>Mi informacion</span>
                            <h2>Editar perfil</h2>
                            <p>Cambia tu nombre, correo o contrasena. Si no quieres cambiar la contrasena, dejala vacia.</p>
                        </div>

                        <form className="perfil-form" onSubmit={guardarPerfil}>
                            <label>
                                <span>Nombre</span>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Correo electronico</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Nueva contrasena</span>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={6}
                                    placeholder="Opcional"
                                />
                            </label>

                            {error && <p className="perfil-error">{error}</p>}

                            <div className="perfil-modal-actions">
                                <button type="button" onClick={() => setModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Perfil;
