export const comprarReceta = async (receta_id) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compras`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ receta_id })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al comprar la receta");
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default { comprarReceta };