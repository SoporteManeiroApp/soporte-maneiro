"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";

// Interfaz para los datos que se enviarán a la API al actualizar
interface UpdatedDepartmentData {
  name: string;
  director?: string;
}

// Propiedades del componente EditDepartmentModal
interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: string;
  currentDepartmentName: string;
  currentDirectorName: string;
  onDepartmentUpdated?: () => void;
}

export default function EditDepartmentModal({
  isOpen,
  onClose,
  departmentId,
  currentDepartmentName,
  currentDirectorName,
  onDepartmentUpdated,
}: EditDepartmentModalProps) {
  // Estados para los campos del formulario
  const [newDepartmentName, setNewDepartmentName] = useState(currentDepartmentName);
  const [newDirectorName, setNewDirectorName] = useState(currentDirectorName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincroniza los estados del formulario con las props al abrir el modal
  useEffect(() => {
    setNewDepartmentName(currentDepartmentName);
    setNewDirectorName(currentDirectorName);
  }, [currentDepartmentName, currentDirectorName]);

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
    const updatedData: UpdatedDepartmentData = {
      name: newDepartmentName,
      director: newDirectorName,
    };

    try {
      // Llamada a la API para actualizar el departamento
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${departmentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`, // token de autorización
        },
        body: JSON.stringify(updatedData),
      });

      // Manejo de errores HTTP
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        showErrorAlert("Sesión Expirada", "Tu sesión ha expirado o no tienes permisos para actualizar departamentos. Por favor, inicia sesión de nuevo.");
        onClose();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessageDetail =
          errorData.detail ||
          errorData.name?.[0] ||
          errorData.director?.[0] ||
          errorData.non_field_errors?.[0] ||
          `Error desconocido al actualizar departamento. Código: ${res.status}`;
        showErrorAlert("Error al Actualizar Departamento", errorMessageDetail);
        return;
      }

      await res.json();
      showSuccessAlert('¡Éxito!', 'Departamento actualizado con éxito!');
      onClose();
      onDepartmentUpdated?.();
    } catch (error: unknown) {
      let errorMessage = "Error desconocido al actualizar el departamento.";
      if (error instanceof Error) {
        errorMessage = `Error al actualizar el departamento: ${error.message}`;
      } else if (typeof error === "string") {
        errorMessage = `Error al actualizar el departamento: ${error}`;
      }
      showErrorAlert("Error de Conexión", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[#023059] mb-4">
          Editar Departamento
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
          {/* Campo: Nuevo Nombre del Departamento */}
          <div className="mb-4">
            <label
              htmlFor="newDepartmentName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nuevo Nombre del Departamento
            </label>
            <input
              type="text"
              id="newDepartmentName"
              name="newDepartmentName"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="Ej: Marketing Digital"
              className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
              required
            />
          </div>

          {/* Campo: Nombre del Director */}
          <div className="mb-6">
            <label
              htmlFor="directorName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Director
            </label>
            <input
              type="text"
              id="directorName"
              name="directorName"
              value={newDirectorName}
              onChange={(e) => setNewDirectorName(e.target.value)}
              placeholder="Ej: María García"
              className="border border-[#e5e7eb] rounded-lg py-2 px-3 w-full text-sm bg-white transition-all duration-300 focus:border-[#049DD9] focus:ring-3 focus:ring-[#049DD9]/20 outline-none"
              required
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
              className="bg-gradient-to-r from-[#049DD9] to-[#023059] text-white rounded-lg py-2 px-4 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#049DD9]/30"
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