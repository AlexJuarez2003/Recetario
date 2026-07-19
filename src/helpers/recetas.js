export const getRecetas = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recetas`, {
            method: 'GET',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Error al traer las recetas: ${data.message}`);
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getReceta = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recetas/${id}`, {
            method: 'GET',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Error al traer la receta: ${data.message}`);
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const createReceta = async (receta) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recetas`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(receta)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al crear la receta");
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const updateReceta = async (id, receta) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recetas/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(receta)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al actualizar la receta");
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteReceta = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recetas/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al eliminar la receta");
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default { getRecetas, getReceta, createReceta, updateReceta, deleteReceta };
