"use client";

import React, { useState, FormEvent } from "react";
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";

interface UserFormProps {
    onUserCreated?: () => void;
}

export default function UserForm({ onUserCreated }: UserFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
            showErrorAlert("Error de Autenticación", "No estás autenticado. Por favor, inicia sesión.");
            setIsSubmitting(false);
            return;
        }

        const userData = {
            username,
            password,
            first_name: firstName,
            last_name: lastName,
            is_active: true,
            is_staff: false,
            is_superuser: false,
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${authToken}`, // Añadir encabezado de autorización
                },
                body: JSON.stringify(userData),
            });

            // Manejar errores de autenticación/permiso
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                showErrorAlert("Sesión Expirada", "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.");
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const errorMessageDetail =
                    errorData.detail ||
                    errorData.username?.[0] ||
                    errorData.password?.[0] ||
                    errorData.first_name?.[0] ||
                    errorData.last_name?.[0] ||
                    errorData.non_field_errors?.[0] ||
                    "Error desconocido al crear usuario.";
                throw new Error(errorMessageDetail);
            }

            // En caso de éxito
            await res.json();
            showSuccessAlert("¡Éxito!", "Usuario creado exitosamente.");

            // Limpiar el formulario
            setUsername("");
            setPassword("");
            setFirstName("");
            setLastName("");

            onUserCreated?.();
        } catch (error: unknown) {
            let errorMessage = "Error desconocido al crear el usuario.";
            if (error instanceof Error) {
                errorMessage = `Error al crear usuario: ${error.message}`;
            } else if (typeof error === 'string') {
                errorMessage = `Error al crear usuario: ${error}`;
            }
            showErrorAlert("Error", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-[rgba(255,255,255,0.9)] backdrop-blur-md rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
            {/* Se eliminan los divs de error y éxito ya que SweetAlert2 los manejará */}

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: jdoe123"
                    className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
                    required
                />
            </div>
            <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                </label>
                <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej: Juan"
                    className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
                    required
                />
            </div>
            <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                </label>
                <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej: Pérez"
                    className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
                    required
                />
            </div>
            <div className="md:col-span-2 flex justify-end">
                <button
                    type="submit"
                    className="bg-gradient-to-r from-[#049DD9] to-[#023059] text-white rounded-lg py-2 px-4 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#049DD9]/30"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creando..." : "Crear Usuario"}
                </button>
            </div>
        </form>
    );
}