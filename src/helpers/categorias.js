export const getCategorias = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al traer categorías");
        }

        return data;
    } catch (error) {
        console.log(error);
    }
}

export const createCategoria = async (nombre, descripcion) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, descripcion })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al crear categoría");
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const updateCategoria = async (id, nombre, descripcion) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, descripcion })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al actualizar categoría");
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const deleteCategoria = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al eliminar categoría");
        return data;
    } catch (error) {
        console.log(error);
    }
}

export default { getCategorias, createCategoria, updateCategoria, deleteCategoria };