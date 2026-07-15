import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserProvider.jsx";
import "./AuthPage.css";

const AuthPage = () => {
    const [panelActivo, setPanelActivo] = useState(false);
    const [cargando, setCargando] = useState(false);

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registroData, setRegistroData] = useState({ name: "", email: "", password: "" });

    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Credenciales incorrectas");
                return;
            }

            localStorage.setItem("token", data.token);
            setUser(data.user);
            navigate("/");
        } catch (error) {
            alert("Error al iniciar sesión");
            console.log(error);
        } finally {
            setCargando(false);
        }
    };

    const handleRegistro = async (e) => {
        e.preventDefault();

        if (registroData.password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setCargando(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registroData),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Error al registrarse");
                return;
            }

            localStorage.setItem("token", data.token);
            setUser(data.user);
            navigate("/");
        } catch (error) {
            alert("Error al registrarse");
            console.log(error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-body">
            <h2>Bienvenido - Inicia Sesión o Regístrate</h2>

            <div className={`contenedor-principal ${panelActivo ? "panel-activo" : ""}`}>

                {/* Registro */}
                <div className="contenedor-formulario registrar">
                    <form onSubmit={handleRegistro}>
                        <h1>Crear Cuenta</h1>
                        <span>Regístrate con tu correo electrónico</span>
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            required
                            value={registroData.name}
                            onChange={(e) => setRegistroData({ ...registroData, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            required
                            value={registroData.email}
                            onChange={(e) => setRegistroData({ ...registroData, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            required
                            value={registroData.password}
                            onChange={(e) => setRegistroData({ ...registroData, password: e.target.value })}
                        />
                        <button type="submit" disabled={cargando}>
                            {cargando ? "Registrando..." : "Registrarse"}
                        </button>
                    </form>
                </div>

                {/* Login */}
                <div className="contenedor-formulario ingresar">
                    <form onSubmit={handleLogin}>
                        <h1>Iniciar Sesión</h1>
                        <span>Ingresa con tu cuenta</span>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            required
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            required
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                        <button type="submit" disabled={cargando}>
                            {cargando ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </div>

                {/* Panel lateral animado */}
                <div className="contenedor-lateral">
                    <div className="panel-lateral">
                        <div className="panel-izquierdo">
                            <h1>¡Bienvenido de nuevo!</h1>
                            <p>Para continuar, ingresa con tus datos</p>
                            <button
                                type="button"
                                className="transparente"
                                onClick={() => setPanelActivo(false)}
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                        <div className="panel-derecho">
                            <h1>¡Hola, nuevo usuario!</h1>
                            <p>Regístrate para comenzar tu experiencia con nosotros</p>
                            <button
                                type="button"
                                className="transparente"
                                onClick={() => setPanelActivo(true)}
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