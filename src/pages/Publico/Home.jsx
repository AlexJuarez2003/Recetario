import { useEffect, useState } from "react";
import { getRecetas } from "../../helpers/recetas";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";

const NUM_RECETAS_HOME = 10;

const mezclarArray = (arr) => {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
};

const Home = () => {
    const [todasLasRecetas, setTodasLasRecetas] = useState([]);
    const [recetasAleatorias, setRecetasAleatorias] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarRecetas = async () => {
            const data = await getRecetas();
            if (!data) {
                setError("No se pudieron cargar las recetas.");
                setLoading(false);
                return;
            }
            setTodasLasRecetas(data);
            setRecetasAleatorias(mezclarArray(data).slice(0, NUM_RECETAS_HOME));
            setLoading(false);
        };

        cargarRecetas();
    }, []);

    const resultadosBusqueda = busqueda.trim()
        ? todasLasRecetas.filter((receta) =>
            receta.titulo.toLowerCase().includes(busqueda.toLowerCase())
        )
        : null;

    const recetasAMostrar = resultadosBusqueda ?? recetasAleatorias;

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#ddc9a8] to-[#c9a876]">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-stone-800">ChefIA</h1>

                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar receta por nombre..."
                    className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-lg px-4 py-2 mb-8
                     placeholder-stone-600 text-stone-800 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-white/70"
                />

                {error && <p className="text-red-700">{error}</p>}

                {!error && recetasAMostrar.length === 0 && (
                    <p className="text-stone-700">
                        {busqueda ? "No se encontraron recetas con ese nombre." : "Aún no hay recetas."}
                    </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recetasAMostrar.map((receta) => (
                        <Link
                            key={receta.id}
                            to={`/recetas/${receta.id}`}
                            className="block bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl
                         overflow-hidden shadow-lg hover:bg-white/55 transition-colors"
                        >
                            {receta.imagen && (
                                <img src={receta.imagen} alt={receta.titulo} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-4">
                                <h2 className="text-lg font-semibold text-stone-800">{receta.titulo}</h2>
                                <p className="text-sm text-stone-700 line-clamp-2">{receta.descripcion}</p>
                                {receta.es_premium && (
                                    <span className="inline-block mt-2 text-xs bg-amber-200/70 text-amber-900 px-2 py-1 rounded-full">
                                        Premium
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;