const updatePerfil = async ( setUser ) => {

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al actualizar perfil");
    }

    const data = await response.json();
    setUser(data);
  } catch (error) {
    return error;
  }
};

export const updateMe = async (payload) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el perfil");
  }

  return data;
};

export default updatePerfil;
