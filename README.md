# Sistema de Gestión de Tickets - Soporte Técnico Maneiro

> Sistema de Gestión de Tickets para el registro, seguimiento y resolución de incidencias y solicitudes de soporte técnico interno en la Alcaldía de Maneiro.

Este proyecto es una aplicación web diseñada para centralizar y gestionar eficientemente las solicitudes de soporte técnico. Permite a los empleados de la institución crear **"tickets"** para reportar incidencias (ej. problemas con equipos, software o acceso a redes) y al equipo de TI gestionarlos, asignarlos y resolverlos de forma ordenada.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green)

## ✨ Características Principales

### 👤 Portal de Usuario (Empleados)
* **Autenticación segura** para registrarse e iniciar sesión.
* Creación de nuevos tickets de soporte, especificando categoría (**Hardware, Software, Redes**) y nivel de prioridad.
* Posibilidad de **adjuntar archivos** o capturas de pantalla a los tickets.

### ⚙️ Panel de Soporte (Equipo de TI)
* **Dashboard con métricas clave:** tickets abiertos, tickets por técnico, tiempo de resolución promedio.
* Vista centralizada de todos los tickets, con opciones de **búsqueda y filtrado avanzado**.
* **Asignación de tickets** a técnicos específicos del equipo de soporte.
* Capacidad para **añadir comentarios internos**, actualizar el estado y comunicarse con el usuario a través de la plataforma.

### 🌐 Generales
* Interfaz de usuario **intuitiva, moderna y completamente responsiva**.
* **API RESTful robusta y segura** para toda la gestión de datos.

## 🛠️ Tecnologías Utilizadas

Este proyecto está dividido en dos componentes principales: un **frontend** y un **backend**.

#### 💻 Frontend (Cliente)
* **Framework:** Next.js
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS

#### 🗄️ Backend (Servidor)
* **Framework:** Django
* **API:** Django REST Framework
* **Base de Datos:** PostgreSQL (Recomendado) / SQLite3 (Desarrollo)
* **Autenticación:** Simple JWT

## 🚀 Puesta en Marcha

### Prerrequisitos
Asegúrate de tener instalado: Node.js, npm/yarn, Python 3.9+, pip y Git.

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/SoporteManeiroApp/soporte-maneiro.git](https://github.com/SoporteManeiroApp/soporte-maneiro.git)
    cd soporte-maneiro
    ```

2.  **Configura el Backend (Django):**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # En Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py createsuperuser
    ```

3.  **Configura el Frontend (Next.js):**
    ```bash
    cd ../frontend
    npm install
    ```

## 🏃‍♂️ Ejecución del Proyecto

* **Backend:** En la carpeta `backend/`, ejecuta `python manage.py runserver`.
* **Frontend:** En la carpeta `frontend/`, ejecuta `npm run dev`.

La aplicación estará disponible en `http://localhost:3000`.

## 📄 Endpoints de la API (Ejemplos)

* `POST /api/token/`
* `POST /api/register/`
* `GET /api/tickets/`
* `POST /api/tickets/`
* `GET /api/tickets/{id}/`

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar este proyecto, por favor sigue el flujo estándar de `Fork` y `Pull Request`.

## ✍️ Autores

* **Oscar Aguiar** - *Frontend Developer* - [GitHub](https://github.com/xKouka)
* **Santiago Fermin** - *Backend Developer* - [GitHub](https://github.com/2004sfm)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---
**Hecho con ❤️ por el equipo de Soporte Técnico de la Alcaldía de Maneiro.**
