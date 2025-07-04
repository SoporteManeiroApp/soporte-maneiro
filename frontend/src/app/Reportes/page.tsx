"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CardUser from "@/Components/CardUser";
import CardDepartment from "@/Components/CardDepartament";
import DepartmentForm from "@/Components/DepartmentForm";
import UserForm from "@/Components/UserForm";
import EditDepartmentModal from "@/Components/EditDepartmentModal";
import EditUserModal from "@/Components/EditUserModal";
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "../../utils/alerts";

// Interfaces para la estructura de los datos
interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_active: boolean;
}

interface Department {
  id: string;
  name: string;
  director?: string;
}

export default function ReportesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Estados para controlar el modal de edición de departamento
  const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>("");
  const [selectedDirectorName, setSelectedDirectorName] = useState<string>("");

  // Estados para controlar el modal de edición de usuario
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redirige por error de autenticación/autorización
  const handleAuthError = (message: string = "Tu sesión ha expirado o no tienes permisos de administrador. Por favor, inicia sesión de nuevo.") => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    showErrorAlert("Acceso Denegado", message);
    router.push("/");
  };

  // Obtener todos los datos (usuarios y departamentos)
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      handleAuthError("No se encontró tu token de autenticación. Por favor, inicia sesión.");
      return;
    }

    try {
      const [usersRes, departmentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
          },
        }),
      ]);

      // Manejo de errores de autenticación/autorización
      if (usersRes.status === 401 || usersRes.status === 403 || departmentsRes.status === 401 || departmentsRes.status === 403) {
        handleAuthError();
        return;
      }

      if (!usersRes.ok) {
        const errorData = await usersRes.json().catch(() => ({}));
        throw new Error(`Error al obtener usuarios: ${usersRes.status} - ${errorData.detail || 'Error desconocido'}`);
      }
      if (!departmentsRes.ok) {
        const errorData = await departmentsRes.json().catch(() => ({}));
        throw new Error(`Error al obtener departamentos: ${departmentsRes.status} - ${errorData.detail || 'Error desconocido'}`);
      }

      const usersData: User[] = await usersRes.json();
      const departmentsData: Department[] = await departmentsRes.json();

      setUsers(usersData);
      setDepartments(departmentsData);

    } catch (err: unknown) {
      let errorMessage = "Hubo un error al cargar los datos.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
      showErrorAlert("Error de Carga", `Hubo un problema al cargar los datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para la comprobación inicial de autenticación y carga de datos
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const userString = localStorage.getItem("user");
    let isSuperuser = false;

    if (userString) {
      try {
        const user = JSON.parse(userString);
        isSuperuser = user.is_superuser || false;
      } catch (e) {
        console.error("Error al parsear datos de usuario de localStorage:", e);
        isSuperuser = false;
      }
    }

    if (!authToken || !isSuperuser) {
      handleAuthError("No tienes los permisos necesarios para acceder a esta página de administración.");
      return;
    }

    fetchAllData();
  }, [router]);

  // Funciones para el control del modal de edición de departamento
  const handleEditDepartment = (id: string, name: string, director: string) => {
    setSelectedDepartmentId(id);
    setSelectedDepartmentName(name);
    setSelectedDirectorName(director);
    setIsEditDepartmentModalOpen(true);
  };

  const handleCloseEditDepartmentModal = () => {
    setIsEditDepartmentModalOpen(false);
    setSelectedDepartmentId(null);
    setSelectedDepartmentName("");
    setSelectedDirectorName("");
  };

  const handleDepartmentUpdated = () => {
    fetchAllData();
  };

  const handleDeleteDepartment = async (id: string) => {
    const confirmed = await showConfirmAlert(
      "Eliminar Departamento",
      "¿Estás seguro de que quieres eliminar este departamento? Esta acción no se puede deshacer.",
      "Sí, Eliminar",
      "Cancelar"
    );

    if (!confirmed) {
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      handleAuthError();
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
          },
        }
      );

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

      showSuccessAlert("¡Éxito!", "Departamento eliminado con éxito!");
      fetchAllData();
    } catch (err: unknown) {
      let errorMessage = "Error desconocido al eliminar el departamento.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      showErrorAlert("Error al Eliminar", errorMessage);
    }
  };

  // Funciones para el control del modal de edición de usuario
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    fetchAllData();
  };

  const handleDeleteUser = async (id: string) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      handleAuthError();
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
          },
        }
      );

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

      showSuccessAlert("¡Éxito!", "Usuario eliminado con éxito!");
      fetchAllData();
    } catch (err: unknown) {
      let errorMessage = "Error desconocido al eliminar el usuario.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      showErrorAlert("Error al Eliminar", errorMessage);
    }
  };

  const handleToggleActive = async (userId: string) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      handleAuthError();
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/toggle-active/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
          },
        }
      );

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

      const updatedUser = await res.json();
      showSuccessAlert("Estado Actualizado", `Estado del usuario "${updatedUser.username}" cambiado a ${updatedUser.is_active ? 'Activo' : 'Inactivo'}.`);

      // Actualiza el estado local para reflejar el cambio
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, is_active: updatedUser.is_active } : u
        )
      );
    } catch (err: unknown) {
      let errorMessage = "No se pudo cambiar el estado del usuario.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      showErrorAlert("Error al Cambiar Estado", errorMessage);
    }
  };

  // Renderizado condicional basado en el estado de carga y error
  if (loading) {
    return (
      <main className="relative container mx-auto py-6 px-4 md:px-6 text-center text-gray-700">
        Cargando datos de administración...
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative container mx-auto py-6 px-4 md:px-6 text-center text-red-500">
        {error}
        <p className="mt-4">Por favor, intenta de nuevo o contacta al soporte.</p>
      </main>
    );
  }

  // Filtra el usuario 'admin' de la lista de usuarios a mostrar
  const filteredUsers = users.filter((user) => user.username !== "admin");

  return (
    <main className="relative container mx-auto py-6 px-4 md:px-6">
      {/* Sección para Añadir Departamento */}
      <section className="p-4 mb-6 bg-[rgba(255,255,255,0.9)] backdrop-blur-md rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-[#023059] mb-4">
          Añadir Nuevo Departamento
        </h2>
        <DepartmentForm onDepartmentCreated={fetchAllData} />
      </section>

      {/* Lista de Departamentos */}
      <section className="p-4 mb-6 bg-[rgba(255,255,255,0.9)] backdrop-blur-md rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-[#023059] mb-4">
          Departamentos
        </h2>
        {departments.length > 0 ? (
          departments.map((dept) => (
            <CardDepartment
              key={dept.id}
              id={dept.id}
              Departament={dept.name}
              Director={dept.director || "N/A"}
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
            />
          ))
        ) : (
          <p className="text-gray-500">No hay departamentos disponibles.</p>
        )}
      </section>

      {/* Sección para Añadir Usuario */}
      <section className="p-4 mb-6 bg-[rgba(255,255,255,0.9)] backdrop-blur-md rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-[#023059] mb-4">
          Añadir Nuevo Usuario
        </h2>
        <UserForm onUserCreated={fetchAllData} />
      </section>

      {/* Lista de Usuarios */}
      <section className="p-4 mb-6 bg-[rgba(255,255,255,0.9)] backdrop-blur-md rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-[#023059] mb-4">Usuarios</h2>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <CardUser
              key={user.id}
              id={user.id}
              User={user.username}
              Name={user.first_name}
              LastName={user.last_name}
              isActive={user.is_active}
              onEdit={() => handleEditUser(user)}
              onDelete={handleDeleteUser}
              onToggleActive={handleToggleActive}
            />
          ))
        ) : (
          <p className="text-gray-500">No hay usuarios disponibles para mostrar.</p>
        )}
      </section>

      {/* Botón Volver */}
      <div className="flex justify-end mb-4">
        <Link
          href="/Home"
          className="inline-block bg-red-600 text-white rounded-lg py-2 px-4 font-semibold hover:bg-red-700 transition"
        >
          Volver
        </Link>
      </div>

      {/* Modal de Edición de Departamento */}
      {isEditDepartmentModalOpen && selectedDepartmentId && (
        <EditDepartmentModal
          isOpen={isEditDepartmentModalOpen}
          onClose={handleCloseEditDepartmentModal}
          departmentId={selectedDepartmentId}
          currentDepartmentName={selectedDepartmentName}
          currentDirectorName={selectedDirectorName}
          onDepartmentUpdated={handleDepartmentUpdated}
        />
      )}

      {/* Modal de Edición de Usuario */}
      {isEditUserModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={handleCloseEditUserModal}
          currentUser={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </main>
  );
}