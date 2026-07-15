import { createContext, useEffect, useState } from "react";
import updatePerfil from "../helpers/me.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                await updatePerfil(setUser);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        cargarPerfil();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }} >
            {children}
        </UserContext.Provider>
    )
}