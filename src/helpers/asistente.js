export const preguntarAsistente = async (pregunta, historial = []) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/asistente/preguntar`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ pregunta, historial }),
    });

    const data = await response.json();
    const primerError = data.errors ? Object.values(data.errors).flat()[0] : null;

    if (!response.ok) {
        throw new Error(primerError || data.message || "No pude responder ahora.");
    }

    return data.respuesta;
};

export default { preguntarAsistente };
