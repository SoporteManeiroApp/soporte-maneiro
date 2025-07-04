Sistema de Gestión de Tickets - Soporte Técnico Maneiro
Sistema de Gestión de Tickets para el registro, seguimiento y resolución de incidencias y solicitudes de soporte técnico interno en la Alcaldía de Maneiro.

Este proyecto es una aplicación web diseñada para centralizar y gestionar eficientemente las solicitudes de soporte técnico. Permite a los empleados de la institución crear "tickets" para reportar incidencias (ej. problemas con equipos, software o acceso a redes) y al equipo de TI gestionarlos, asignarlos y resolverlos de forma ordenada.

✨ Características Principales
Portal de Usuario (Empleados):

Autenticación segura para registrarse e iniciar sesión.

Creación de nuevos tickets de soporte, especificando categoría (Hardware, Software, Redes) y nivel de prioridad.

Posibilidad de adjuntar archivos o capturas de pantalla a los tickets.

Visualización del historial y estado de sus tickets personales (Abierto, En Progreso, Cerrado).

Panel de Soporte (Equipo de TI):

Dashboard con métricas clave: tickets abiertos, tickets por técnico, tiempo de resolución promedio.

Vista centralizada de todos los tickets, con opciones de búsqueda y filtrado avanzado.

Asignación de tickets a técnicos específicos del equipo de soporte.

Capacidad para añadir comentarios internos, actualizar el estado y comunicarse con el usuario a través de la plataforma.

Generales:

Interfaz de usuario intuitiva, moderna y completamente responsiva.

API RESTful robusta y segura para toda la gestión de datos.

🛠️ Tecnologías Utilizadas
Este proyecto está dividido en dos componentes principales: un frontend y un backend.

Frontend (Cliente)
Framework: Next.js

Lenguaje: TypeScript

Estilos: Tailwind CSS

Gestión de Estado: React Context / SWR

Librería de Peticiones: Axios

Backend (Servidor)
Framework: Django

API: Django REST Framework

Base de Datos: PostgreSQL (Recomendado) / SQLite3 (Desarrollo)

Autenticación: Simple JWT (JSON Web Tokens)

🚀 Puesta en Marcha
Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

Prerrequisitos
Asegúrate de tener instalado lo siguiente:

Node.js (v18.x o superior)

npm o yarn

Python (v3.9 o superior)

pip y venv

Git

Instalación
Clona el repositorio:

Bash

git clone https://github.com/SoporteManeiroApp/soporte-maneiro.git
cd soporte-maneiro
Configura el Backend (Django):

Bash

# Navega a la carpeta del backend
cd backend

# Crea y activa un entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instala las dependencias
pip install -r requirements.txt

# Ejecuta las migraciones de la base de datos
python manage.py migrate

# Crea un superusuario para acceder al panel de admin de Django
python manage.py createsuperuser
Configura el Frontend (Next.js):

Bash

# Desde la raíz del proyecto, navega a la carpeta del frontend
cd ../frontend

# Instala las dependencias
npm install
# o si usas yarn:
# yarn install
🏃‍♂️ Ejecución del Proyecto
Debes tener ambos servidores (backend y frontend) ejecutándose simultáneamente.

Para ejecutar el Backend (Django):
Asegúrate de estar en la carpeta backend/ con el entorno virtual activado.

Bash

python manage.py runserver
El servidor de Django estará disponible en http://127.0.0.1:8000.

Para ejecutar el Frontend (Next.js):
Abre otra terminal y navega a la carpeta frontend/.

Bash

npm run dev
# o si usas yarn:
# yarn dev
La aplicación estará disponible en http://localhost:3000.

📄 Endpoints de la API (Ejemplos)
La API sigue los principios REST. Aquí algunos de los endpoints principales:

POST /api/token/: Obtiene el token de autenticación (JWT).

POST /api/register/: Registro de un nuevo usuario/empleado.

GET /api/tickets/: Lista todos los tickets (para admin) o los del usuario autenticado.

POST /api/tickets/: Crea un nuevo ticket.

GET /api/tickets/{id}/: Obtiene los detalles de un ticket específico.

PATCH /api/tickets/{id}/: Actualiza un ticket (usado por el equipo de soporte).

🤝 Contribuciones
Las contribuciones son bienvenidas. Si deseas mejorar este proyecto, por favor sigue estos pasos:

Haz un "Fork" del proyecto.

Crea una nueva rama para tu funcionalidad (git checkout -b feature/AmazingFeature).

Realiza tus cambios (git commit -m 'Add some AmazingFeature').

Sube tus cambios a la rama (git push origin feature/AmazingFeature).

Abre un "Pull Request".

📄 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

Hecho con ❤️ para el equipo de Soporte Técnico de la Alcaldía de Maneiro.
