export const getComentarios = async (id = null) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Error al traer los comentarios: ${data.message}`);
        }

        if (id === null || id === undefined) {
            return data;
        }

        return data.filter((comentario) => comentario.receta_id === Number(id));
    } catch (error) {
        console.log(error);
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
            throw new Error(`Error al eliminar comentario: ${data.message}`);
        }

        return data.message;
    } catch (error) {
        console.log(error);
    }
}

export const storeComentario = async (receta_id, usuario_id, contenido) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ receta_id, usuario_id, contenido })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al publicar el comentario");
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default { getComentarios, deleteComentario, storeComentario };
