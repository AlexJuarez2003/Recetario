import { useEffect, useRef, useState } from "react";

const emptyForm = {
    nombre: "",
    descripcion: "",
};

const FormCategoria = ({ isOpen, onClose, onSave, data }) => {
    const inputRef = useRef(null);
    const isEditing = Boolean(data?.id);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        if (!isOpen) return;

        setFormData({
            id: data?.id ?? "",
            nombre: data?.nombre ?? "",
            descripcion: data?.descripcion ?? "",
        });

        setTimeout(() => inputRef.current?.focus(), 0);
    }, [isOpen, data]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-heading">
                    <span>{isEditing ? "Editar categoria" : "Nueva categoria"}</span>
                    <h2>{isEditing ? "Actualizar categoria" : "Crear categoria"}</h2>
                    <p>
                        {isEditing
                            ? "Ajusta el nombre y la descripcion que veran los usuarios."
                            : "Organiza las recetas para que sean faciles de encontrar."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <label>
                        <span>Nombre</span>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            ref={inputRef}
                            required
                        />
                    </label>

                    <label>
                        <span>Descripcion</span>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="4"
                            required
                        />
                    </label>

                    <div className="admin-modal-actions">
                        <button type="button" className="admin-btn admin-btn-ghost" onClick={handleCancel}>
                            Cancelar
                        </button>
                        <button type="submit" className="admin-btn admin-btn-primary">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormCategoria;
