export const getCompras = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compras`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al traer tus compras");
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

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

export const comprarRecetas = async (receta_ids) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compras/lote`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ receta_ids })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al comprar las recetas");
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getReporteVentas = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compras/reporte/ventas`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al traer las ventas");
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteCompra = async (id) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compras/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al eliminar la venta");
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default { getCompras, comprarReceta, comprarRecetas, getReporteVentas, deleteCompra };
