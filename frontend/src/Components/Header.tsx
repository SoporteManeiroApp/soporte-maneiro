import Image from "next/image";

export default function Header() {
  return (
    <header className="py-3 px-4 md:px-6 bg-[rgba(255,255,255,0.1)] backdrop-blur-md text-white shadow-md relative z-40">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo y Nombre */}
          <div className="flex items-center">
            <Image
              src={"/logo.png"}
              width={50}
              height={50}
              alt="logo"
              className="mr-3"
            />
            <div>
              <h1 className="text-xl font-bold flex items-center">
                Soporte Maneiro
              </h1>
              <p className="text-xs opacity-80">
                Gestión de historial de soporte técnico
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center bg-gradient-to-r from-[#049DD9] to-[#023059] text-white border-none rounded-lg py-2 px-4 font-semibold transition-all duration-300 relative overflow-hidden hover:shadow-lg hover:shadow-[#049DD9]/30">
              <i className="fas fa-plus-circle mr-2"></i>
              Crear Informe
            </button>

            {/* Dropdown */}
            <div className="relative inline-block group z-50">
              <button className="flex items-center bg-white text-[#023059] border border-[#e5e7eb] rounded-lg py-2 px-4 font-medium transition-all duration-300 hover:bg-[#f9fafb] hover:shadow-sm">
                <i className="fas fa-user-circle mr-2"></i>
                Perfil
                <i className="fas fa-chevron-down ml-2 text-xs"></i>
              </button>
              <div className="hidden absolute right-0 bg-white min-w-[200px] shadow-lg rounded-lg z-50 overflow-hidden group-hover:block">
                <a
                  href="#"
                  className="flex items-center text-[#023059] py-3 px-4 no-underline  transition-colors duration-200 hover:bg-[#f9fafb]"
                >
                  <i className="fas fa-file-alt mr-2 text-[#049DD9]"></i>
                  Crear Informe Técnico
                </a>
                <a
                  href="#"
                  className="flex items-center text-[#023059] py-3 px-4 no-underline transition-colors duration-200 hover:bg-[#f9fafb]"
                >
                  <i className="fas fa-chart-bar mr-2 text-[#049DD9]"></i>
                  Crear Reporte
                </a>
                <a
                  href="#"
                  className="flex items-center text-[#023059] py-3 px-4 no-underline  transition-colors duration-200 hover:bg-[#f9fafb]"
                >
                  <i className="fas fa-user mr-2 text-[#049DD9]"></i>
                  Mi Perfil
                </a>
                <a
                  href="#"
                  className="flex items-center border-t border-gray-200 text-[#023059] py-3 px-4 no-underline transition-colors duration-200 hover:bg-[#f9fafb]"
                >
                  <i className="fas fa-sign-out-alt mr-2 text-red-500"></i>
                  Cerrar Sesión
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
