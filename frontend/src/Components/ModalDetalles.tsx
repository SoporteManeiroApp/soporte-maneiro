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
}

interface FormData {
    subject: string;
    description: string;
    note: string;
    department: string;
    technician: string;
}

interface ModalInformeProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: FormData) => void;
    onSuccess?: () => void;
}

export default function ModalInforme({ isOpen, onClose, onSubmit, onSuccess }: ModalInformeProps) {
    // Estados del formulario
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [note, setNote] = useState('');
    const [department, setDepartment] = useState('');
    const [technician, setTechnician] = useState('');

    // Estados para datos externos y carga
    const [departments, setDepartments] = useState<Department[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Referencia para detectar clics fuera del modal
    const modalContentRef = useRef<HTMLDivElement>(null);

    // Efecto para cargar datos iniciales (departamentos y técnicos) cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            setLoadingData(true);
            setFetchError(null);

            const authToken = localStorage.getItem("authToken");

            if (!authToken) {
                showErrorAlert("Error de Autenticación", "No estás autenticado. Por favor, inicia sesión.");
                setFetchError("No estás autenticado. Por favor, inicia sesión.");
                setLoadingData(false);
                return;
            }

            const fetchInitialData = async () => {
                try {
                    // Obtener departamentos
                    const departmentsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${authToken}`,
                        },
                    });
                    if (departmentsRes.status === 401 || departmentsRes.status === 403) {
                        localStorage.removeItem("authToken");
                        localStorage.removeItem("user");
                        showErrorAlert("Sesión Expirada", "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.");
                        onClose();
                        return;
                    }
                    if (!departmentsRes.ok) {
                        const errorData = await departmentsRes.json().catch(() => ({}));
                        const detail = errorData.detail || `Error HTTP: ${departmentsRes.status}`;
                        throw new Error(`Error al obtener departamentos: ${detail}`);
                    }
                    const departmentsData: Department[] = await departmentsRes.json();
                    setDepartments(departmentsData);

                    // Obtener técnicos (usuarios)
                    const usersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${authToken}`,
                        },
                    });
                    if (usersRes.status === 401 || usersRes.status === 403) {
                        localStorage.removeItem("authToken");
                        localStorage.removeItem("user");
                        showErrorAlert("Sesión Expirada", "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.");
                        onClose()
                        return;
                    }
                    if (!usersRes.ok) {
                        const errorData = await usersRes.json().catch(() => ({}));
                        const detail = errorData.detail || `Error HTTP: ${usersRes.status}`;
                        throw new Error(`Error al obtener usuarios: ${detail}`);
                    }
                    const usersData: User[] = await usersRes.json();
                    // Filtrar usuarios que son técnicos (asumiendo is_staff para técnicos)
                    const actualTechnicians = usersData.filter(user => user.is_staff);
                    setTechnicians(actualTechnicians);

                } catch (error: unknown) {
                    let errorMessage = "Error desconocido al cargar datos. Por favor, recarga.";
                    if (error instanceof Error) {
                        errorMessage = `Error al cargar datos: ${error.message}`;
                    } else if (typeof error === "string") {
                        errorMessage = `Error al cargar datos: ${error}`;
                    }
                    setFetchError(errorMessage);
                    showErrorAlert("Error al Cargar Datos", errorMessage);
                } finally {
                    setLoadingData(false);
                }
            };

            fetchInitialData();

            // Reiniciar estados del formulario cuando el modal se abre
            setSubject('');
            setDescription('');
            setNote('');
            setDepartment('');
            setTechnician('');
        }
    }, [isOpen, onClose]);

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

    // Manejador del envío del formulario
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showErrorAlert("Error de Autenticación", "No estás autenticado. Por favor, inicia sesión.");
            setFetchError("No estás autenticado para crear el informe.");
            return;
        }

        const informeData: FormData = {
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
                showErrorAlert("Error al Crear Informe", `Detalles: ${JSON.stringify(errorData)}`); // Mostrar todos los detalles del error del backend
                return;
            } else {
                showSuccessAlert("¡Éxito!", "Informe creado con éxito!");
                onSubmit?.(informeData);
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

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 backdrop-blur flex items-center justify-center">
            <div ref={modalContentRef} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-[#023059]">Crear Informe</h3>

                {/* Mostrar estado de carga o error de carga */}
                {loadingData && (
                    <div className="text-center py-4 text-gray-700">Cargando datos...</div>
                )}
                {fetchError && !loadingData && ( // Solo muestra el error si no está cargando
                    <div className="text-red-500 text-center py-4">{fetchError}</div>
                )}

                {/* Renderizar formulario solo si no hay carga y no hay error de carga */}
                {!loadingData && !fetchError && (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                                placeholder="Escribe el asunto del informe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 w-full resize-none h-20  border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                                rows={4}
                                placeholder="Describe el problema o la solicitud"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700">Nota</label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="mt-1 w-full h-20 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                                rows={4}
                                placeholder="Añade cualquier nota adicional aquí"
                            />
                        </div>
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                            <select
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                                required
                            >
                                <option value="">Selecciona un departamento</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="technician" className="block text-sm font-medium text-gray-700">Técnico Asignado</label>
                            <select
                                id="technician"
                                value={technician}
                                onChange={(e) => setTechnician(e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#049DD9]"
                                required
                            >
                                <option value="">Selecciona un técnico</option>
                                {technicians.map((tech) => (
                                    <option key={tech.id} value={tech.id}>{tech.first_name} {tech.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >Cancelar</button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm text-white bg-[#049DD9] hover:bg-[#037bb1] rounded-lg"
                            >Crear Informe</button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}