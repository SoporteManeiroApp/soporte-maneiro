"use client";

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";

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
  is_superuser?: boolean;
}

// Estructura de datos para un reporte
interface ReportData {
  id?: string;
  subject: string;
  description: string;
  note: string;
  department: string;
  technician: string;
  created_at?: string;
}

interface ModalInformeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ReportData) => void;
  initialData?: ReportData | null;
  onSuccess?: () => void;
  allDepartments: Department[];
  allTechnicians: User[];
}

export default function ModalInforme({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  initialData,
  allDepartments,
  allTechnicians,
}: ModalInformeProps) {
  // Estados de los campos del formulario
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [department, setDepartment] = useState('');
  const [technician, setTechnician] = useState('');

  // Estado para determinar si el modal está en modo "vista/edición" o "creación"
  const isViewMode = initialData !== undefined && initialData !== null;

  // Referencia para detectar clics fuera del modal
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Efecto para rellenar los campos del formulario cuando initialData cambia (para modo vista/edición)
  useEffect(() => {
    if (isOpen) {
      if (isViewMode && initialData) {
        setSubject(initialData.subject || '');
        setDescription(initialData.description || '');
        setNote(initialData.note || '');
        setDepartment(initialData.department || '');
        setTechnician(initialData.technician || '');
      } else {
        // Reiniciar campos para el modo "crear" cuando el modal se abre sin initialData
        setSubject('');
        setDescription('');
        setNote('');
        setDepartment('');
        setTechnician('');
      }
    }
  }, [isOpen, initialData, isViewMode]);

  // Efecto para cerrar el modal con Escape o clic fuera
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    function onClickOutside(e: MouseEvent) {
      if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen, onClose]);

  // Helper para obtener el nombre del departamento a partir del ID
  const getDepartmentName = (id: string) => {
    return allDepartments.find(dept => dept.id === id)?.name || 'N/A';
  };

  // Helper para obtener el nombre del técnico a partir del ID
  const getTechnicianName = (id: string) => {
    const tech = allTechnicians.find(user => user.id === id);
    return tech ? `${tech.first_name} ${tech.last_name}` : 'N/A';
  };

  // envio del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isViewMode || !onSubmit) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      showErrorAlert("Error de Autenticación", "No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    const informeData: ReportData = {
      subject,
      description,
      note,
      department,
      technician,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify(informeData),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        showErrorAlert("Sesión Expirada", "Tu sesión ha expirado o no tienes permisos para crear informes. Por favor, inicia sesión de nuevo.");
        onClose();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showErrorAlert("Error al Crear Informe", `Detalles: ${JSON.stringify(errorData)}`);
        return;
      } else {
        showSuccessAlert("¡Éxito!", "Informe creado con éxito!");
        onSubmit(informeData);
        onSuccess?.();
        onClose();
      }
    } catch (error: unknown) {
      let errorMessage = "No se pudo conectar con el servidor. Error de red.";
      if (error instanceof Error) {
        errorMessage = `Error de red al crear informe: ${error.message}`;
      } else if (typeof error === "string") {
        errorMessage = `Error de red al crear informe: ${error}`;
      }
      showErrorAlert("Error de Conexión", errorMessage);
    }
  };

  const handleGenerateSingleReportClick = async () => {
    if (!initialData || !initialData.id) {
      showErrorAlert("Error", "ID de informe no disponible para generar el reporte.");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      showErrorAlert("Error de Autenticación", "No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requests/${initialData.id}/generate_single_report/`,
        {
          headers: {
            "Authorization": `Token ${authToken}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        showErrorAlert("Acceso Denegado", "No tienes permisos o tu sesión ha expirado.");
        onClose();
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        let errorDetail = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.detail || errorJson.message || errorText;
        } catch (e) {
          console.error("Error al parsear el JSON de error:", e);
        }
        throw new Error(`Error al generar el reporte: ${res.status} - ${errorDetail}`);
      }

      const blob = await res.blob();
      // Verifica el tipo de contenido para asegurar que es un documento
      if (!blob.type.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
        let errorMsg = "El servidor no devolvió un documento válido. Podría haber un error interno.";
        if (blob.type.includes("application/json")) {
          const text = await blob.text();
          try {
            const jsonError = JSON.parse(text);
            errorMsg = jsonError.detail || jsonError.message || errorMsg;
          } catch (e) {
            console.error("Error al parsear el JSON del blob:", e);
          }
        }
        throw new Error(errorMsg);
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `informe_solicitud_${initialData.id}.docx`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccessAlert("¡Reporte Generado!", "El informe técnico de la solicitud ha sido descargado exitosamente.");
      onClose();
    } catch (error: unknown) {
      let errorMessage = "Hubo un problema desconocido al generar el reporte.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      showErrorAlert("Error al Generar Reporte", errorMessage);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 backdrop-blur flex items-center justify-center">
      <div ref={modalContentRef} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-[#023059]">
          {isViewMode ? "Detalles del Informe" : "Crear Reporte"}
        </h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
            {isViewMode ? (
              <p className="mt-1">{subject}</p>
            ) : (
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                placeholder="Escribe el asunto del informe"
                required
              />
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            {isViewMode ? (
              <p className="mt-1 whitespace-pre-wrap">{description}</p>
            ) : (
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full resize-none h-20 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                rows={4}
                placeholder="Describe el problema o la solicitud"
                required
              />
            )}
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">Nota</label>
            {isViewMode ? (
              <p className="mt-1 whitespace-pre-wrap">{note || "—"}</p>
            ) : (
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full h-20 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                rows={4}
                placeholder="Añade cualquier nota adicional aquí"
              />
            )}
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
            {isViewMode ? (
              <p className="mt-1">{getDepartmentName(department)}</p>
            ) : (
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                required
              >
                <option value="">Selecciona un departamento</option>
                {allDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label htmlFor="technician" className="block text-sm font-medium text-gray-700">Técnico Asignado</label>
            {isViewMode ? (
              <p className="mt-1">{getTechnicianName(technician)}</p>
            ) : (
              <select
                id="technician"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                required
              >
                <option value="">Selecciona un técnico</option>
                {allTechnicians
                  .filter((tech) => !tech.is_superuser)
                  .map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.first_name} {tech.last_name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {isViewMode && initialData && initialData.created_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
              <p className="mt-1">{new Date(initialData.created_at).toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            {isViewMode ? (
              <>
                {/* Botón para generar informe por ID, solo visible en modo vista */}
                <button
                  type="button"
                  onClick={handleGenerateSingleReportClick}
                  className="mr-2 px-4 py-2 text-sm text-white bg-[#049DD9] hover:bg-[#037bb1] rounded-lg"
                >
                  Generar Informe Técnico
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
                >Cancelar</button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-[#049DD9] hover:bg-[#037bb1] rounded-lg"
                >Crear Reporte</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}