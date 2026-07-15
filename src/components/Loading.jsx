const Loading = ({ message = "Cargando..." }) => {
    return (
        <div className="flex flex-col justify-center items-center w-full h-full gap-4 bg-gray-50">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <div className="absolute inset-0 rounded-full border-4 border-gray-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-500 font-medium animate-pulse">{message}</p>
        </div>
    );
};

export default Loading;