import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../../context/UserProvider.jsx";
import "./AuthPage.css";

const mensajeError = (data, fallback) => {
    if (data?.errors) {
        const primerError = Object.values(data.errors).flat()[0];
        if (primerError) return primerError;
    }

    return data?.message || fallback;
};

const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const [panelActivo, setPanelActivo] = useState(searchParams.get("modo") === "registro");
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registroData, setRegistroData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        setPanelActivo(searchParams.get("modo") === "registro");
        setMensaje("");
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensaje(mensajeError(data, "No pudimos iniciar sesion. Revisa tus datos o contacta al administrador."));
                return;
            }

            localStorage.setItem("token", data.token);
            setUser(data.user);
            navigate(data.user.role === "admin" ? "/dashboard" : "/recetas", { replace: true });
        } catch (error) {
            setMensaje("No pudimos conectar con el servidor. Intenta de nuevo.");
            console.log(error);
        } finally {
            setCargando(false);
        }
    };

    const handleRegistro = async (e) => {
        e.preventDefault();

        if (registroData.password.length < 6) {
            setMensaje("La contrasena debe tener al menos 6 caracteres.");
            return;
        }

        if (registroData.password !== registroData.password_confirmation) {
            setMensaje("Las contrasenas no coinciden.");
            return;
        }

        setCargando(true);
        setMensaje("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registroData),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensaje(mensajeError(data, "No pudimos crear la cuenta. Revisa tus datos."));
                return;
            }

            localStorage.setItem("token", data.token);
            setUser(data.user);
            navigate("/recetas", { replace: true });
        } catch (error) {
            setMensaje("No pudimos conectar con el servidor. Intenta de nuevo.");
            console.log(error);
        } finally {
            setCargando(false);
        }
    };

    if (user) {
        return <Navigate to={user.role === "admin" ? "/dashboard" : "/recetas"} replace />;
    }

    return (
        <div className="auth-body">
            <div className="auth-welcome">
                <span>ChefIA</span>
                <h2>Bienvenido a tu recetario inteligente</h2>
                <p>Inicia sesion o crea una cuenta para guardar, comprar y publicar recetas.</p>
            </div>

            <div className="auth-mobile-switch">
                <button
                    type="button"
                    className={!panelActivo ? "active" : ""}
                    onClick={() => {
                        setPanelActivo(false);
                        setMensaje("");
                    }}
                >
                    Iniciar sesion
                </button>
                <button
                    type="button"
                    className={panelActivo ? "active" : ""}
                    onClick={() => {
                        setPanelActivo(true);
                        setMensaje("");
                    }}
                >
                    Crear cuenta
                </button>
            </div>

            <div className={`contenedor-principal ${panelActivo ? "panel-activo" : ""}`}>

                {/* Registro */}
                <div className="contenedor-formulario registrar">
                    <form onSubmit={handleRegistro}>
                        <h1>Crear Cuenta</h1>
                        <span>Registrate con tu correo electronico</span>
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            required
                            value={registroData.name}
                            onChange={(e) => setRegistroData({ ...registroData, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Correo electronico"
                            required
                            value={registroData.email}
                            onChange={(e) => setRegistroData({ ...registroData, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Contrasena"
                            required
                            value={registroData.password}
                            onChange={(e) => setRegistroData({ ...registroData, password: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Repetir contrasena"
                            required
                            value={registroData.password_confirmation}
                            onChange={(e) => setRegistroData({ ...registroData, password_confirmation: e.target.value })}
                        />
                        {panelActivo && mensaje && <p className="auth-alert">{mensaje}</p>}
                        <button type="submit" disabled={cargando}>
                            {cargando ? "Registrando..." : "Registrarse"}
                        </button>
                    </form>
                </div>

                {/* Login */}
                <div className="contenedor-formulario ingresar">
                    <form onSubmit={handleLogin}>
                        <h1>Iniciar Sesion</h1>
                        <span>Ingresa con tu cuenta</span>
                        <input
                            type="email"
                            placeholder="Correo electronico"
                            required
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Contrasena"
                            required
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                        {!panelActivo && mensaje && <p className="auth-alert">{mensaje}</p>}
                        <button type="submit" disabled={cargando}>
                            {cargando ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </div>

                {/* Panel lateral animado */}
                <div className="contenedor-lateral">
                    <div className="panel-lateral">
                        <div className="panel-izquierdo">
                            <h1>Bienvenido de nuevo</h1>
                            <p>Para continuar, ingresa con tus datos</p>
                            <button
                                type="button"
                                className="transparente"
                                onClick={() => {
                                    setPanelActivo(false);
                                    setMensaje("");
                                }}
                            >
                                Iniciar Sesion
                            </button>
                        </div>
                        <div className="panel-derecho">
                            <h1>Hola, nuevo usuario</h1>
                            <p>Registrate para comenzar tu experiencia con nosotros</p>
                            <button
                                type="button"
                                className="transparente"
                                onClick={() => {
                                    setPanelActivo(true);
                                    setMensaje("");
                                }}
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;
