import { useEffect, useOptimistic, useState, useTransition } from "react";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from "../../helpers/categorias.js";
import FormCategoria from "../../components/FormCategoria.jsx";
import Loading from "../../components/Loading.jsx";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState({ open: false, mode: null, data: null });

  const [categoriasOptimistas, dispatchOptimista] = useOptimistic(
    categorias,
    (state, action) => {
      switch (action.type) {
        case "add":
          return [...state, action.categoria];

        case "edit":
          return state.map(cat =>
            cat.id === action.categoria.id ? {...cat, ...action.categoria} : cat
          );
        case "delete":
          return state.filter(cat => cat.id !== action.id);
        default:
          return state;
      }
    }
  );

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        if (data) {
          setCategorias(data);
        }
      } catch (error) {
        console.log("Error al traer categorias: ", error);
      }
    };

    fetchCategorias();
  }, []);

  const guardarCategoria = async (datos) => {
    const { nombre, descripcion } = datos;

    const nuevaCategoria = {
      id: crypto.randomUUID(),
      nombre,
      descripcion,
      pending: true,
    };

    startTransition(async () => {
      dispatchOptimista({type: "add", categoria: nuevaCategoria});

      try {
        const categoriaCreada = await createCategoria(nombre, descripcion);
        setCategorias((prev) => [...prev, categoriaCreada]);
      } catch (error) {
        console.log(error);
      }
    });

    setModal((prev) => [{ ...prev, open: false }]);
  };

  const handleEdit = (id, nombre, descripcion) => {
    setModal({ open: true, mode: "Edit", data: { id, nombre, descripcion } });
  };

  const actualizarCategoria = async (datos) => {
    const { id, nombre, descripcion } = datos;

    startTransition(async () => {
      dispatchOptimista({ type: "edit", categoria: {...datos, pending: true}});
      try {
        const categoriaActualizada = await updateCategoria(
          id,
          nombre,
          descripcion,
        );
        setCategorias((prev) => 
            prev.map(cat => (cat.id === id ? categoriaActualizada : cat))
        );
      } catch (error) {
        console.log(error);
      }
    });

    setModal({ open: false });
  };

  const handleDelete = async ( id ) => {
    startTransition(async () => {
      dispatchOptimista({ type: "delete", id});

      try {
          const data = await deleteCategoria(id);
          console.log(data);
          setCategorias(prev => prev.filter(cat => cat.id !== id));
      } catch (error) {
        console.log(error);
      }
  });
  };

  return (
    <>
      <div className="flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold text-center">
          Categorías disponibles
        </h1>
        
        {
          categorias.length === 0
          ? <Loading message="Cargando categorias" />
          : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold">
                    <th className="p-1">Nombre</th>
                    <th className="p-1">Descripción</th>
                    <th className="p-1">Fecha de creación</th>
                    <th className="p-1">Fecha de Modificación</th>
                    <th className="p-1">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasOptimistas.map((categoria) => (
                    <tr
                      key={categoria.id}
                      style={{ color: categoria.pending ? "gray" : "black" }}
                      className="border-b border-gray-200 text-center"
                    >
                      <td className="p-3">{categoria.nombre}</td>
                      <td className="p-3">{categoria.descripcion}</td>
                      <td className="p-3">
                        {categoria.created_at
                          ? new Date(categoria.created_at).toLocaleDateString(
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
                      <td className="p-3">
                        {categoria.updated_at
                          ? new Date(categoria.updated_at).toLocaleDateString(
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
                        <button
                          onClick={() =>
                            handleEdit(
                              categoria.id,
                              categoria.nombre,
                              categoria.descripcion,
                            )
                          }
                          className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(categoria.id)}
                          className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
        <button
          onClick={() => setModal({ open: true })}
          className="p-1 rounded-2xl w-1/4 cursor-pointer bg-gray-300"
        >
          Nueva
        </button>

        <FormCategoria
          isOpen={modal.open}
          onClose={() => setModal({ open: false })}
          onSave={
            modal.mode === "Edit" ? actualizarCategoria : guardarCategoria
          }
          data={modal.data}
        />
      </div>
    </>
  );
};

export default Categorias;
