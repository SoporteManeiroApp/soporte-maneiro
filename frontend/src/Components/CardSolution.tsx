"use client";

import React from 'react';

// Interfaces de datos
interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

interface CardSolutionProps {
  id: string;
  Date: string;
  Title: string
  Description: string
  Department: string;
  Technician: string;
  Note: string;
  CreatedAtRaw: string;
  allDepartments: Department[];
  allTechnicians: User[];
  onViewDetailsClick: () => void;
  onDeleteClick: (id: string) => void;
}

export default function CardSolution({
  id,
  Date,
  Title,
  Description,
  Department,
  Technician,
  // Note,
  allDepartments,
  allTechnicians,
  onViewDetailsClick,
  onDeleteClick
}: CardSolutionProps) {

  // Helpers para obtener nombres legibles a partir de IDs
  const getDepartmentName = (deptId: string) => {
    return allDepartments.find(dept => dept.id === deptId)?.name || 'Desconocido';
  };

  const getTechnicianName = (techId: string) => {
    const tech = allTechnicians.find(user => user.id === techId);
    return tech ? `${tech.first_name} ${tech.last_name}` : 'Desconocido';
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
    >
      <div>
        <p className="text-gray-500 text-sm mb-1">{Date}</p>
        <h3 className="text-lg font-semibold text-[#023059] mb-2 truncate">{Title}</h3>
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{Description}</p>
      </div>
      <div className="space-y-1 text-sm text-gray-800 mb-4">
        <p><span className="font-medium">Departamento:</span> {getDepartmentName(Department)}</p>
        <p><span className="font-medium">Técnico:</span> {getTechnicianName(Technician)}</p>
      </div>
      <div className="flex gap-2 mt-auto">
        {/* Botón "Ver Más" */}
        <button
          onClick={onViewDetailsClick}
          className="flex-1 px-4 py-2 text-sm text-white bg-[#049DD9] hover:bg-[#037bb1] rounded-lg transition-colors"
        >
          Ver Más
        </button>
        {/* Botón "Eliminar" */}
        <button
          onClick={() => onDeleteClick(id)}
          className="flex-1 px-4 py-2 text-sm bg-red-700 text-white hover:bg-red-800 rounded-lg transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}