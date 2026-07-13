import { useEffect, useRef, useState } from "react";

const FormCategoria = ({ isOpen, onClose, onSave, data })  => {

    const inputRef = useRef(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: ""
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({
            nombre: "",
            descripcion: ""
        });
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleCancelar = () => {
        onClose();
        setFormData({
            nombre: "",
            descripcion: ""
        });
    };

    useEffect(() => {
        if (isOpen) {
            setFormData({
                id: data?.id ?? "",
                nombre: data?.nombre ?? "",
                descripcion: data?.descripcion ?? ""
            });
        }
    }, [isOpen, data]);

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h2 className="text-xl font-bold mb-4">{data?.nombre ? "Editar categoría" : "Nueva categoría"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre:</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} ref={inputRef} className="w-full border rounded p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción:</label>
                        <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full border rounded p-2" required />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={handleCancelar} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormCategoria;