export const getUsuarios = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al traer usuarios");
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const createUser = async (name, email, password, role) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al crear usuario");
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const deleteUser = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al borrar usuario");
        return data;
    } catch (error) {
        console.log(error);
    }
}

export default { getUsuarios, createUser, deleteUser };