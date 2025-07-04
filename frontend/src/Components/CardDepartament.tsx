"use client";

import React from "react";

// Propiedades del componente CardDepartment
interface CardDepartmentProps {
  id: string;
  Departament: string;
  Director: string;
  onEdit: (departmentId: string, departmentName: string, directorName: string) => void;
  onDelete: (departmentId: string) => void;
}

export default function CardDepartment({
  id,
  Departament,
  Director,
  onEdit,
  onDelete,
}: CardDepartmentProps) {
  return (
    <div className="flex justify-between p-4 bg-[rgba(255,255,255,0.9)] backdrop-blur-sm rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform mb-2">
      <div className="flex items-center gap-3">
        <p className="font-semibold text-[#023059]">{Departament}</p>
        <p className="text-gray-600">{Director}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(id, Departament, Director)}
          className="bg-yellow-500 rounded-lg p-2 text-white hover:bg-yellow-600 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(id)}
          className="bg-red-700 rounded-lg p-2 text-white hover:bg-red-800 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}