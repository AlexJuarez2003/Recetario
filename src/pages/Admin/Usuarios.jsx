import { act, useContext, useEffect, useOptimistic, useState, useTransition } from "react";
import { createUser, deleteUser, getUsuarios } from "../../helpers/usuarios";
import FormUsuarios from "../../components/FormUsuarios";
import Loading from "../../components/Loading";
import { UserContext } from "../../context/UserProvider";

const Usuarios = () => {
    const [users, setUsers] = useState([]);
    const [modal, setModal] = useState(false);
    const { user } = useContext(UserContext);

    const [usersOptimistas, dispatchOptimista] = useOptimistic(
        users,
        (state, action) => {
            switch (action.type) {
                case "add":
                    return [...state, action.user];
                case "delete":
                    return state.filter(user => user.id !== action.id);
                default:
                    return state;
            }
        }
    );

    const [isPending, startTransition] = useTransition();

    const traerUsuarios = async () => {
        try {
            const data = await getUsuarios();
            if (data) {
                setUsers(data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        traerUsuarios();
    }, []);

    const guardarUsuario = async (formData) => {
        const { name, email, password, role} = formData;

        const nuevoUsuario = {
            id: crypto.randomUUID(),
            name,
            email,
            password,
            role,
            pendig: true
        };

        startTransition(async () => {
            dispatchOptimista({ type: "add", user: nuevoUsuario});

            try {
                const usuarioCreado = await createUser(name, email, password, role);
                setUsers(prev => [...prev, usuarioCreado]);
            } catch (error) {
                console.log(error);
            }
        });

        setModal(false);
    };

    const eliminarUsuario = async (id) => {
        startTransition(async () => {
            dispatchOptimista({ type: "delete", id});

            try {
                const data = await deleteUser(id);
                setUsers(prev => prev.filter(user => user.id !== id))
            } catch (error) {
                console.log(error);
            }
        });
    }

    return (
        <div className="flex flex-col gap-6 items-center">
            <h1 className="text-2xl font-bold">Usuarios registrados</h1>
            {users.length === 0
            ? <Loading message="Cargando usuarios" />
            : (<table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-gray-700 font-semibold">
                        <th className="p-1">Nombre</th>
                        <th className="p-1">Email</th>
                        <th className="p-1">Rol</th>
                        <th className="p-1">Fecha de registro</th>
                        <th className="p-1">Accion</th>
                    </tr>
                </thead>
                <tbody>
                    {usersOptimistas.map((usuario) => (
                        <tr key={usuario.id} className="border-b border-gray-200 text-center" style={{ color: usuario.pendig ? "gray" : "black" }}>
                            <td className="p-3">{user?.id === usuario.id ? usuario.name + " (Yo)" : usuario.name}</td>
                            <td className="p-3">{usuario.email}</td>
                            <td className="p-3">{usuario.role}</td>
                            <td className="p-3">{usuario.created_at
                                    ? new Date(usuario.created_at).toLocaleDateString(
                                        "es-AR",
                                        {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        },
                                        )
                                    : "--"}
                            </td>
                            <td>
                                { user?.id !== usuario.id && <button 
                                    onClick={() => eliminarUsuario(usuario.id)}
                                    className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                                >
                                    Eliminar
                                </button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>)}

            <button 
                onClick={() => setModal(true)}
                className="p-1 rounded-2xl w-1/4 cursor-pointer bg-gray-300"
            >
                Nuevo
            </button>
            
            <FormUsuarios 
                isOpen={modal}
                onClose={() => setModal(false)}
                onSave={guardarUsuario}
            />
        </div>
    );
}

export default Usuarios;