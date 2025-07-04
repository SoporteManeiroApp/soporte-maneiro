"use client";

import React, { useState, FormEvent } from "react";
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";

// Propiedades del componente DepartmentForm
interface DepartmentFormProps {
    onDepartmentCreated?: () => void;
}

export default function DepartmentForm({ onDepartmentCreated }: DepartmentFormProps) {
    // Estados para los campos del formulario
    const [name, setName] = useState("");
    const [director, setDirector] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manejador del envío del formulario
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const departmentData = { name, director };

        try {
            const authToken = localStorage.getItem("authToken"); // Obtener el token

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authToken && { 'Authorization': `Token ${authToken}` }),
                },
                body: JSON.stringify(departmentData),
            });

            // Manejo de errores de autenticación/permisos si se implementa el token
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                showErrorAlert("Sesión Expirada", "Tu sesión ha expirado o no tienes permisos para crear departamentos. Por favor, inicia sesión de nuevo.");
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const errorMessageDetail =
                    errorData.detail ||
                    errorData.name?.[0] ||
                    errorData.director?.[0] ||
                    errorData.non_field_errors?.[0] ||
                    `Error desconocido al crear departamento. Código: ${res.status}`;
                showErrorAlert("Error al Crear Departamento", errorMessageDetail);
                return;
            }

            await res.json();
            showSuccessAlert("¡Éxito!", "Departamento creado exitosamente!");
            setName("");
            setDirector("");
            onDepartmentCreated?.();
        } catch (error: unknown) {
            let errorMessage = "Error desconocido al crear el departamento.";
            if (error instanceof Error) {
                errorMessage = `Error de conexión o inesperado: ${error.message}`;
            } else if (typeof error === "string") {
                errorMessage = `Error de conexión o inesperado: ${error}`;
            }
            console.error("Error al crear departamento:", error);
            showErrorAlert("Error de Conexión", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-[rgba(255,255,255,0.9)] backdrop-blur-md rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-end gap-4"
        >
            {/* Campo: Nombre del Departamento */}
            <div className="flex-1 w-full">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Departamento
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Recursos Humanos"
                    className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
                    required
                />
            </div>

            {/* Campo: Director */}
            <div className="flex-1 w-full">
                <label htmlFor="director" className="block text-sm font-medium text-gray-700 mb-1">
                    Director
                </label>
                <input
                    type="text"
                    id="director"
                    name="director"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
                    required
                />
            </div>

            {/* Botón de envío */}
            <button
                type="submit"
                className="bg-gradient-to-r from-[#049DD9] to-[#023059] text-white rounded-lg py-2 px-4 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#049DD9]/30 w-full md:w-auto"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creando...' : 'Crear Departamento'}
            </button>
        </form>
    );
}