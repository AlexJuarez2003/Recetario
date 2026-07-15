export const getComentarios = async (id) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Error al traer los comentarios: ", data.message);
        }

        return data;
    } catch (error) {
        return error;
    }
}

export const deleteComentario = async (id) => {
    try {
        const token = localStorage.getItem("token");
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Error al eliminar comentario: ", data.message);
        }

        return data.message;
    } catch (error) {
        return error;
    }
}