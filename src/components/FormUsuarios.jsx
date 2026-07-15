import { useEffect, useRef, useState } from "react";

const FormUsuarios = ({ isOpen, onClose, onSave })  => {

    const inputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin"
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
            name: "",
            email: "",
            password: "",
            role: ""
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
            name: "",
            email: "",
            password: "",
            role: ""
        });
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h2 className="text-xl font-bold mb-4">{"Nuevo usuario"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} ref={inputRef} className="w-full border rounded p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email:</label>
                        <input type="text" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border rounded p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Rol:</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full border rounded p-2" >
                            <option value="admin">Administrador</option>
                            <option value="usuario">Usuario</option>
                        </select>
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

export default FormUsuarios;