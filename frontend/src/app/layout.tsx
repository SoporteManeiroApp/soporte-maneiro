import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>

        {/* Diseño del fondo */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div
            className="absolute rounded-full opacity-10"
            style={{
              width: "30vw",
              height: "30vw",
              maxWidth: "300px",
              maxHeight: "300px",
              background:
                "linear-gradient(45deg, var(--secondary), var(--accent))",
              top: "10%",
              left: "10%",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full opacity-10"
            style={{
              width: "40vw",
              height: "40vw",
              maxWidth: "400px",
              maxHeight: "400px",
              background:
                "linear-gradient(45deg, var(--secondary), var(--accent))",
              bottom: "10%",
              right: "10%",
              animation: "float 8s ease-in-out infinite",
            }}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
