"use client";

import React from "react";
import { showConfirmAlert } from "../utils/alerts";

// Propiedades del componente CardUser
interface CardUserProps {
  id: string;
  User: string;
  Name: string;
  LastName: string;
  isActive: boolean;
  onEdit: (user: { id: string; username: string; first_name: string; last_name: string }) => void;
  onDelete: (userId: string) => Promise<void>;
  onToggleActive: (userId: string) => Promise<void>;
}

export default function CardUser({
  id,
  User,
  Name,
  LastName,
  isActive,
  onEdit,
  onDelete,
  onToggleActive,
}: CardUserProps) {

  const handleDeleteClick = async () => {
    const confirmed = await showConfirmAlert(
      "¿Estás seguro?",
      `Estás a punto de eliminar al usuario "${User}". Esta acción no se puede deshacer.`,
      "Sí, eliminar",
      "Cancelar"
    );

    if (confirmed) {
      await onDelete(id);
    }
  };

  const handleToggleActiveClick = async () => {
    const actionText = isActive ? "desactivar" : "activar";
    const confirmed = await showConfirmAlert(
      "Confirmar Acción",
      `¿Estás seguro de que quieres ${actionText} al usuario "${User}"?`,
      `Sí, ${actionText}`,
      "Cancelar"
    );

    if (confirmed) {
      await onToggleActive(id);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-[rgba(255,255,255,0.9)] backdrop-blur-sm rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md mb-2">
      <div className="flex items-center gap-3">
        <p className="font-semibold text-[#023059]">{User}</p>
        <p className="text-gray-600">{Name}</p>
        <p className="text-gray-600">{LastName}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleToggleActiveClick}
          className={`rounded-lg p-2 text-white transition-colors ${isActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
            }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </button>
        <button
          onClick={() => onEdit({ id, username: User, first_name: Name, last_name: LastName })}
          className="bg-yellow-500 rounded-lg p-2 text-white hover:bg-yellow-600 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={handleDeleteClick}
          className="bg-red-700 rounded-lg p-2 text-white hover:bg-red-800 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}