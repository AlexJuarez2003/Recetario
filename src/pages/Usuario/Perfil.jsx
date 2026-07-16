import { useContext } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";
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
    const { user, loading } = useContext(UserContext);

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
                        podremos agregar foto de perfil, recetas guardadas y edicion de datos.
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
                        <button type="button">Editar perfil</button>
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
        </div>
    );
};

export default Perfil;
