import { useEffect, useRef, useState } from "react";

const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "usuario",
};

const FormUsuarios = ({ isOpen, onClose, onSave, data }) => {
    const inputRef = useRef(null);
    const isEditing = Boolean(data?.id);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        if (!isOpen) return;

        setFormData({
            id: data?.id ?? "",
            name: data?.name ?? "",
            email: data?.email ?? "",
            password: "",
            role: data?.role ?? "usuario",
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
                    <span>{isEditing ? "Editar acceso" : "Nuevo acceso"}</span>
                    <h2>{isEditing ? "Editar usuario" : "Crear usuario"}</h2>
                    <p>
                        {isEditing
                            ? "Actualiza los datos principales de esta cuenta."
                            : "Agrega una cuenta nueva para entrar al panel de ChefIA."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <label>
                        <span>Nombre</span>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            ref={inputRef}
                            required
                        />
                    </label>

                    <label>
                        <span>Correo electronico</span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        <span>{isEditing ? "Nueva contrasena opcional" : "Contrasena"}</span>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required={!isEditing}
                            placeholder={isEditing ? "Dejala vacia para conservarla" : "Minimo 6 caracteres"}
                        />
                    </label>

                    <label>
                        <span>Rol</span>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="usuario">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
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

export default FormUsuarios;
