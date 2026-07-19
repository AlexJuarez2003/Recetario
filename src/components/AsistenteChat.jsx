import { useContext, useMemo, useState } from "react";
import { UserContext } from "../context/UserProvider";
import { preguntarAsistente } from "../helpers/asistente";
import "./AsistenteChat.css";

const sugerencias = [
    "Que puedo cocinar rapido?",
    "Dame ideas saludables",
    "Que recetas premium tengo compradas?",
    "Sustituye crema en una receta",
];

const AsistenteChat = () => {
    const { user } = useContext(UserContext);
    const [abierto, setAbierto] = useState(false);
    const [pregunta, setPregunta] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensajes, setMensajes] = useState([
        {
            role: "assistant",
            content: "Hola, soy ChefIA. Puedo ayudarte a elegir recetas, resolver dudas de cocina y sugerir sustituciones.",
        },
    ]);

    const historialApi = useMemo(
        () => mensajes.map((mensaje) => ({ role: mensaje.role, content: mensaje.content })),
        [mensajes],
    );

    const enviarPregunta = async (textoManual) => {
        const texto = (textoManual || pregunta).trim();
        if (!texto || enviando) return;

        const mensajeUsuario = { role: "user", content: texto };
        setMensajes((prev) => [...prev, mensajeUsuario]);
        setPregunta("");
        setEnviando(true);

        try {
            const respuesta = await preguntarAsistente(texto, [...historialApi, mensajeUsuario]);
            setMensajes((prev) => [...prev, { role: "assistant", content: respuesta }]);
        } catch (err) {
            setMensajes((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: err.message || "No pude conectar con el asistente. Revisa la configuracion del backend.",
                    error: true,
                },
            ]);
        } finally {
            setEnviando(false);
        }
    };

    if (!user) return null;

    return (
        <div className={`chefia-chat ${abierto ? "open" : ""}`}>
            {abierto && (
                <section className="chefia-chat-panel">
                    <header>
                        <div>
                            <span>C</span>
                            <div>
                                <strong>ChefIA asistente</strong>
                                <small>{enviando ? "Pensando..." : "Listo para cocinar"}</small>
                            </div>
                        </div>
                        <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
                            x
                        </button>
                    </header>

                    <div className="chefia-chat-messages">
                        {mensajes.map((mensaje, index) => (
                            <div
                                key={`${mensaje.role}-${index}`}
                                className={`chefia-chat-message ${mensaje.role === "user" ? "user" : "assistant"} ${mensaje.error ? "error" : ""}`}
                            >
                                {mensaje.content}
                            </div>
                        ))}
                    </div>

                    <div className="chefia-chat-suggestions">
                        {sugerencias.map((item) => (
                            <button key={item} type="button" onClick={() => enviarPregunta(item)} disabled={enviando}>
                                {item}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            enviarPregunta();
                        }}
                    >
                        <input
                            value={pregunta}
                            onChange={(e) => setPregunta(e.target.value)}
                            placeholder="Preguntale algo a ChefIA..."
                        />
                        <button type="submit" disabled={enviando || !pregunta.trim()}>
                            Enviar
                        </button>
                    </form>
                </section>
            )}

            <button type="button" className="chefia-chat-toggle" onClick={() => setAbierto((prev) => !prev)}>
                {abierto ? "x" : "IA"}
            </button>
        </div>
    );
};

export default AsistenteChat;
