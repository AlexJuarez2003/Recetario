export const getUsuarios = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`,{
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Error al traer lista de usuarios: ", data.message);
        }

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
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: role
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.log(error);
            throw new Error(error.message);
        }

        const data = await response.json();
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

        if (!response.ok) {
            const error = await response.json();
            throw new Error("Error al borrar usuario: ", error.message);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.log(error);
    }
}

export default { getUsuarios, createUser };