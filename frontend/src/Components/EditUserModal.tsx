"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";

// Interfaz para el formato de datos de usuario que espera la API
interface UserAPIFormat {
  username: string;
  first_name: string;
  last_name: string;
  password?: string;
}

// Propiedades del componente EditUserModal
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { // Datos del usuario actual a editar
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  onUserUpdated?: () => void;
}

export default function EditUserModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}: EditUserModalProps) {
  // Estados para los campos del formulario
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [newFirstName, setNewFirstName] = useState(currentUser.first_name);
  const [newLastName, setNewLastName] = useState(currentUser.last_name);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincroniza los estados del formulario con los datos del usuario actual al abrir el modal
  useEffect(() => {
    setNewUsername(currentUser.username);
    setNewFirstName(currentUser.first_name);
    setNewLastName(currentUser.last_name);
    setNewPassword("");
  }, [currentUser]);

  if (!isOpen) return null;

  // Manejador del envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Obtener el token de autenticación
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      showErrorAlert("No Autenticado", "No estás autenticado para realizar esta acción. Por favor, inicia sesión.");
      setIsSubmitting(false);
      return;
    }

    // Preparar datos para enviar a la API
    const updatedData: UserAPIFormat = {
      username: newUsername,
      first_name: newFirstName,
      last_name: newLastName,
    };

    // Incluir la contraseña solo si se ha modificado
    if (newPassword) {
      updatedData.password = newPassword;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${currentUser.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`, // Incluir el token de autorización
        },
        body: JSON.stringify(updatedData),
      });

      // Manejo de errores de autenticación/permisos
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        showErrorAlert("Sesión Expirada", "Tu sesión ha expirado o no tienes permisos para actualizar usuarios. Por favor, inicia sesión de nuevo.");
        onClose();
        return;
      }

      // Manejo de otros errores HTTP
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessageDetail =
          errorData.detail ||
          errorData.username?.[0] ||
          errorData.first_name?.[0] ||
          errorData.last_name?.[0] ||
          errorData.password?.[0] ||
          errorData.non_field_errors?.[0] ||
          `Error desconocido al actualizar usuario. Código: ${res.status}`;
        showErrorAlert("Error al Actualizar Usuario", errorMessageDetail);
        return;
      }

      await res.json();
      showSuccessAlert('¡Éxito!', 'Usuario actualizado con éxito!');
      onClose();
      onUserUpdated?.();
    } catch (error: unknown) {
      let errorMessage = "Error desconocido al guardar cambios.";
      if (error instanceof Error) {
        errorMessage = `Error al guardar cambios: ${error.message}`;
      } else if (typeof error === "string") {
        errorMessage = `Error al guardar cambios: ${error}`;
      }
      showErrorAlert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[#023059] mb-4">
          Editar Usuario
        </h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          aria-label="Cerrar"
          disabled={isSubmitting}
        >
          &times;
        </button>

        <form onSubmit={handleSubmit}>
          {/* Campo de Usuario (Username) */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuario (Username)
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Ej: jdoe123"
              className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
              required
            />
          </div>

          {/* Campo de Nombre */}
          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              placeholder="Ej: Juan"
              className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
              required
            />
          </div>

          {/* Campo de Apellido */}
          <div className="mb-4">
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Apellido
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              placeholder="Ej: Pérez"
              className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
              required
            />
          </div>

          {/* Campo de Contraseña (Opcional) */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nueva Contraseña (Dejar en blanco para no cambiar)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#049DD9] to-[#023059] text-white rounded-lg py-2 px-4 font-semibold hover:shadow-lg hover:shadow-[#049DD9]/30 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}