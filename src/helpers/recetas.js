export const getRecetas = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recetas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = response.json();

        if (!response.ok) {
            throw new Error("Error al traer las recetas: ", data.message);
        }

        return data;
    } catch (error) {
        console.log(error);
    }
}

export default { getRecetas };