"use client";

import React, { useState, useEffect } from "react";
import CardSolution from "@/Components/CardSolution";
import ModalInforme from "@/Components/Modalinforme";
import { useRouter } from "next/navigation";
import { showSuccessAlert, showErrorAlert, showInfoAlert, showConfirmAlert } from "../../utils/alerts";

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

interface Request {
  id: string;
  subject: string;
  description: string;
  note: string;
  department: string;
  technician: string;
  department_name?: string;
  technician_full_name?: string;
  created_at: string;
}

export default function HomePage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<Request | null>(null);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allTechnicians, setAllTechnicians] = useState<User[]>([]);
  const router = useRouter();

  const handleAuthError = (message: string = "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.") => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    showErrorAlert("Acceso Denegado", message);
    router.push("/");
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const userString = localStorage.getItem("user");
      let user = null;

      if (userString) {
        try {
          user = JSON.parse(userString);
          setIsSuperuser(user.is_superuser || false);
        } catch (e) {
          console.error("Error al parsear los datos del usuario de localStorage:", e);
          user = null;
          setIsSuperuser(false);
        }
      } else {
        setIsSuperuser(false);
      }

      if (!authToken) {
        showErrorAlert("Acceso Requerido", "Debes iniciar sesión para acceder a esta página.");
        router.push("/");
        setLoading(false);
        return;
      }

      if (user && user.is_active === false) {
        showInfoAlert("Cuenta Desactivada", "Tu cuenta ha sido desactivada. Por favor, contacta al administrador.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        router.push("/");
        setLoading(false);
        return;
      }

      await fetchDepartmentsAndTechnicians(authToken);

      if (validateDates()) {
        await fetchRequests();
      } else {
        setRequests([]);
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [router]);

  const fetchDepartmentsAndTechnicians = async (authToken: string) => {
    try {
      const departmentsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (!departmentsRes.ok) throw new Error("Failed to fetch departments");
      const departmentsData: Department[] = await departmentsRes.json();
      setAllDepartments(departmentsData);

      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData: User[] = await usersRes.json();
      const actualTechnicians = usersData.filter(user => user.is_staff);
      setAllTechnicians(actualTechnicians);
    } catch (err: unknown) {
      showErrorAlert("Error de Carga", "No se pudieron cargar los departamentos o técnicos.");
      let errorMessageForState = "Un error desconocido ocurrió.";
      if (err instanceof Error) {
        errorMessageForState = err.message;
      } else if (typeof err === 'string') {
        errorMessageForState = err;
      }
      setError(errorMessageForState);
    }
  };

  const validateDates = (): boolean => {
    if (!startDate && !endDate) {
      setDateError("");
      return true;
    }
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) {
      setDateError("Formato de fecha inválido.");
      showErrorAlert("Error de Fecha", "El formato de la fecha es inválido. Por favor, revisa.");
      return false;
    }
    if (start && end && start > end) {
      setDateError("La fecha de inicio no puede ser mayor que la de fin.");
      showErrorAlert("Error de Fecha", "La fecha de inicio no puede ser mayor que la fecha de fin.");
      return false;
    }
    setDateError("");
    return true;
  };

  const fetchRequests = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      handleAuthError("No estás autenticado para obtener solicitudes. Redirigiendo al inicio de sesión.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requests/`;

      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${authToken}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessageDetail =
          errorData.detail ||
          errorData.message ||
          `Error desconocido. Código: ${res.status}`;
        throw new Error(errorMessageDetail);
      }

      const data: Request[] = await res.json();
      setRequests(Array.isArray(data) ? data : []);

    } catch (err: unknown) {
      console.error("Error al obtener los datos:", err);
      let errorMessage = "Error desconocido al obtener los datos.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      if (!(errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("acceso denegado"))) {
        showErrorAlert("Error de Red", `Hubo un problema al cargar los datos: ${errorMessage}`);
      }
      setError(errorMessage);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      if (validateDates()) {
        fetchRequests();
      } else {
        setRequests([]);
        setLoading(false);
      }
    }
  }, [startDate, endDate]);

  const handleApplyFilters = () => {
    if (validateDates()) {
      fetchRequests();
    } else {
      setRequests([]);
      setLoading(false);
    }
  };

  const generateReportByDates = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      handleAuthError("No estás autenticado para generar reportes.");
      return;
    }

    if (!isSuperuser) {
      showErrorAlert("Permiso Denegado", "Solo los superusuarios pueden generar informes.");
      return;
    }

    if (!validateDates()) {
      showErrorAlert("Error de Fechas", "Por favor corrige las fechas antes de generar el reporte.");
      return;
    }
    if (!startDate || !endDate) {
      showInfoAlert("Fechas Requeridas", "Por favor selecciona una fecha de inicio y una fecha de fin para generar el reporte.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requests/generate_report/?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            "Authorization": `Token ${authToken}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        handleAuthError("Tu sesión ha expirado o no tienes permisos para generar reportes.");
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
      link.download = `reporte_tecnico_fechas_${startDate}_a_${endDate}.docx`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccessAlert("¡Reporte Generado!", "El reporte técnico por fechas ha sido descargado exitosamente.");
    } catch (err: unknown) {
      console.error("Error al descargar el reporte por fechas:", err);
      let errorMessage = "Hubo un problema desconocido al generar el reporte por fechas.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      showErrorAlert("Error al Generar Reporte por Fechas", errorMessage);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      handleAuthError("No estás autenticado para eliminar reportes.");
      return;
    }

    // Usamos tu función showConfirmAlert
    const confirmed = await showConfirmAlert(
      "Confirmar Eliminación",
      "¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer.",
      "Sí, eliminar", // Texto para el botón de confirmación
      "Cancelar"    // Texto para el botón de cancelar
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requests/${reportId}/`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Token ${authToken}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleAuthError("Tu sesión ha expirado o no tienes permisos para eliminar este reporte.");
        return;
      }

      if (!res.ok && res.status !== 204) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessageDetail =
          errorData.detail ||
          errorData.message ||
          `Error desconocido. Código: ${res.status}`;
        throw new Error(errorMessageDetail);
      }

      showSuccessAlert("¡Eliminado!", "El reporte ha sido eliminado exitosamente.");
      fetchRequests();
    } catch (err: unknown) {
      console.error("Error al eliminar el reporte:", err);
      let errorMessage = "Hubo un problema desconocido al eliminar el reporte.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      showErrorAlert("Error al Eliminar Reporte", errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleNewReportCreated = () => {
    setIsModalOpen(false);
    setSelectedRequestData(null);
    fetchRequests();
  };

  const handleViewDetails = (requestData: Request) => {
    setSelectedRequestData(requestData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequestData(null);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-end mb-4 space-x-2">
        {isSuperuser && (
          <button
            onClick={generateReportByDates}
            className="flex items-center bg-white text-[#023059] border border-[#e5e7eb] rounded-lg py-2 px-4 font-medium hover:bg-[#f9fafb] transition"
          >
            <i className="fas fa-file-alt mr-2"></i>
            Generar Informe Trimestral
          </button>
        )}
        <button
          onClick={() => {
            setSelectedRequestData(null);
            setIsModalOpen(true);
          }}
          className="flex items-center bg-white text-[#023059] border border-[#e5e7eb] rounded-lg py-2 px-4 font-medium hover:bg-[#f9fafb] transition"
        >
          Crear Reporte
        </button>
      </div>

      <section className="bg-white shadow p-4 rounded-lg mb-6">
        <h2 className="font-semibold text-lg mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-2 py-1 rounded-lg focus:ring-2 focus:ring-[rgba(4,157,217,0.2)] focus:border-[var(--secondary)] outline-none"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border px-2 py-1 rounded-lg focus:ring-2 focus:ring-[rgba(4,157,217,0.2)] focus:border-[var(--secondary)] outline-none"
            />
          </div>
        </div>
        {dateError && (
          <p className="text-red-500 text-sm mt-2">{dateError}</p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleApplyFilters}
            className="flex items-center bg-gradient-to-r from-[#049DD9] to-[#023059] text-white border-none rounded-lg py-2 px-4 font-semibold transition-all duration-300 relative overflow-hidden hover:shadow-lg hover:shadow-[#049DD9]/30"
          >
            Aplicar Filtros
          </button>
        </div>
      </section>

      <section>
        {loading && <p className="text-center text-gray-700">Cargando...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && requests.length === 0 && (
          <p className="text-center text-gray-500">No se encontraron informes para los filtros seleccionados.</p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((requestItem) => (
            <CardSolution
              key={requestItem.id}
              id={requestItem.id}
              Date={new Date(requestItem.created_at).toLocaleDateString()}
              Title={requestItem.subject}
              Description={requestItem.description}
              Department={requestItem.department}
              Technician={requestItem.technician}
              Note={requestItem.note}
              CreatedAtRaw={requestItem.created_at}
              allDepartments={allDepartments}
              allTechnicians={allTechnicians}
              onViewDetailsClick={() => handleViewDetails(requestItem)}
              onDeleteClick={handleDeleteReport}
            />
          ))}
        </div>
      </section>

      <ModalInforme
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleNewReportCreated}
        initialData={selectedRequestData}
        allDepartments={allDepartments}
        allTechnicians={allTechnicians}
      />
    </main>
  );
}