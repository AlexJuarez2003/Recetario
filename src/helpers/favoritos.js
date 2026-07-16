export const getFavoritos = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favoritos`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al traer favoritos");
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const addFavorito = async (usuario_id, receta_id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favoritos`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario_id, receta_id })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al agregar a favoritos");
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const removeFavorito = async (favoritoId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favoritos/${favoritoId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al quitar de favoritos");
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default { getFavoritos, addFavorito, removeFavorito };
