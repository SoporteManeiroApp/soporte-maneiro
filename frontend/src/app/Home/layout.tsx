"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ProfileDropdown from "@/Components/ProfileDropdown";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Verifica el rol del usuario
  const checkUserRole = () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setIsAdmin(user.is_superuser || false);
      } catch (e) {
        console.error("Error al parsear los datos del usuario de localStorage", e);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkUserRole();
    const handleStorageChange = () => {
      checkUserRole();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // const closeModal = () => setIsModalOpen(false);

  // cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <body className="min-h-screen bg-blue-500">
      <header className="py-3 px-4 md:px-6 bg-[rgba(255,255,255,0.1)] backdrop-blur-md text-white shadow-md relative">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              width={50}
              height={50}
              alt="logo"
              className="mr-3"
            />
            <div>
              <h1 className="text-xl font-bold">Soporte Maneiro</h1>
              <p className="text-xs opacity-80">
                Gestión de historial de soporte técnico
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ProfileDropdown
              isAdmin={isAdmin}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <main
        className={`container mx-auto p-4 md:p-6 transition-all ${isModalOpen ? "filter blur-md" : ""
          }`}
      >
        {children}
      </main>

      {/* {isModalOpen && (
        <Modalinforme
          isOpen={isModalOpen}
          onClose={closeModal}
          allDepartments={[]} // Pass your departments data here
          allTechnicians={[]} // Pass your technicians data here
        />
      )} */}
    </body>
  );
}
