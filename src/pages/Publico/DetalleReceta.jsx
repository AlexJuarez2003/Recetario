import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getReceta } from "../../helpers/recetas";
import { storeComentario } from "../../helpers/comentarios";
import { comprarReceta } from "../../helpers/compras";
import { UserContext } from "../../context/UserProvider";
import Loading from "../../components/Loading";

const DetalleReceta = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);

  const [receta, setReceta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [comprando, setComprando] = useState(false);
  const [errorCompra, setErrorCompra] = useState(null);

  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState(null);

  const cargarReceta = async () => {
    const data = await getReceta(id);
    if (!data) {
      setError("No se pudo cargar la receta.");
    } else {
      setReceta(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarReceta();
  }, [id]);

  const handleComprar = async () => {
    setComprando(true);
    setErrorCompra(null);
    try {
      await comprarReceta(receta.id);
      await cargarReceta(); // recarga para que el backend ya no la muestre bloqueada
    } catch (err) {
      setErrorCompra(err.message);
    } finally {
      setComprando(false);
    }
  };

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setEnviandoComentario(true);
    setErrorComentario(null);
    try {
      await storeComentario(receta.id, user.id, nuevoComentario.trim());
      setNuevoComentario("");
      await cargarReceta(); // recarga para traer el comentario nuevo
    } catch (err) {
      setErrorComentario(err.message);
    } finally {
      setEnviandoComentario(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-red-700 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#ddc9a8] to-[#c9a876]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="text-stone-700 underline">&larr; Volver</Link>

        {receta.imagen && (
          <img src={receta.imagen} alt={receta.titulo} className="w-full h-64 object-cover rounded-2xl mt-4" />
        )}

        <h1 className="text-3xl font-bold text-stone-800 mt-4">{receta.titulo}</h1>
        <p className="text-sm text-stone-600 mt-1">
          {receta.categoria?.nombre} · {receta.tiempo_preparacion} min · por {receta.usuario?.name}
        </p>
        <p className="text-stone-700 mt-4">{receta.descripcion}</p>

        {receta.bloqueada ? (
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 mt-6">
            <p className="text-stone-800 font-semibold">
              Esta receta es premium (${receta.precio}). Cómprala para ver ingredientes y pasos.
            </p>
            {!user && (
              <p className="text-sm text-stone-600 mt-2">
                Debes <Link to="/auth" className="underline">iniciar sesión</Link> para comprarla.
              </p>
            )}
            {user && (
              <>
                <button
                  onClick={handleComprar}
                  disabled={comprando}
                  className="mt-3 bg-stone-800 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {comprando ? "Comprando..." : `Comprar por $${receta.precio}`}
                </button>
                {errorCompra && <p className="text-red-700 text-sm mt-2">{errorCompra}</p>}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-stone-800">Ingredientes</h2>
              <p className="text-stone-700 whitespace-pre-line">{receta.ingredientes}</p>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-stone-800">Pasos</h2>
              <p className="text-stone-700 whitespace-pre-line">{receta.pasos}</p>
            </div>
          </>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-stone-800 mb-3">Comentarios</h2>

          {receta.comentarios?.length > 0 ? (
            <ul className="space-y-3">
              {receta.comentarios.map((comentario) => (
                <li key={comentario.id} className="bg-white/40 backdrop-blur-md border border-white/50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-stone-800">{comentario.usuario?.name}</p>
                  <p className="text-stone-700">{comentario.contenido}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-stone-600">Aún no hay comentarios.</p>
          )}

          {user ? (
            <form onSubmit={handleComentar} className="mt-4">
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-lg px-4 py-2
                           text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-white/70"
                rows={3}
              />
              <button
                type="submit"
                disabled={enviandoComentario}
                className="mt-2 bg-stone-800 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {enviandoComentario ? "Publicando..." : "Publicar comentario"}
              </button>
              {errorComentario && <p className="text-red-700 text-sm mt-2">{errorComentario}</p>}
            </form>
          ) : (
            <p className="text-stone-600 mt-4">
              <Link to="/auth" className="underline">Inicia sesión</Link> para comentar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleReceta;