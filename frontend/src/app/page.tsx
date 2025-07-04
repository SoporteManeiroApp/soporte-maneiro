"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { showSuccessAlert, showErrorAlert, showInfoAlert } from "../utils/alerts";

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Manejador del envío del formulario de inicio de sesión
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Verificar si la cuenta está inactiva
        if (data.user && data.user.is_active === false) {
          showInfoAlert(
            "Cuenta Desactivada",
            "Tu cuenta ha sido desactivada. Por favor, contacta al administrador para más información."
          );
          setLoading(false);
          return;
        }

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showSuccessAlert("¡Inicio de sesión exitoso!", "Bienvenido de nuevo.");
        router.push("/Home");
      } else {
        const errorData = await response.json().catch(() => ({}));

        const errorMessage = errorData.non_field_errors?.[0] ||
          errorData.detail ||
          "Credenciales inválidas. Por favor, verifica tu usuario y contraseña.";

        showErrorAlert("Error al Iniciar Sesión", errorMessage);
      }
    } catch (error: unknown) {
      let userErrorMessage = "Error de conexión: No se pudo conectar con el servidor. Intenta de nuevo más tarde.";
      if (error instanceof Error) {
        userErrorMessage = `Error durante el inicio de sesión: ${error.message}.`;
      } else if (typeof error === "string") {
        userErrorMessage = `Error durante el inicio de sesión: ${error}.`;
      }
      showErrorAlert("Problema de Conexión", userErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-lg w-full max-w-md p-8 z-10 overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-52 h-36 mx-auto relative overflow-hidden mb-4">
            <Image
              src={"/logo.png"}
              alt="Logo"
              width={150}
              height={140}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-2xl font-bold flex items-center justify-center text-[var(--primary)]">
            Soporte Maneiro
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de historial de soporte técnico
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              required
              autoComplete="username"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition focus:border-[var(--secondary)] focus:ring-4 focus:ring-[rgba(4,157,217,0.2)] outline-none bg-[var(--white)] placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative mb-6">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition focus:border-[var(--secondary)] focus:ring-4 focus:ring-[rgba(4,157,217,0.2)] outline-none bg-[var(--white)] placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center mt-6 bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] text-[var(--white)] rounded-lg py-3 font-semibold relative overflow-hidden hover:shadow-md hover:shadow-[rgba(4,157,217,0.3)] transition"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}