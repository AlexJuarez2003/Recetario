const updatePerfil = async ( setUser, token ) => {

  try {
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
    console.log(error);
  }
};

export default updatePerfil;
