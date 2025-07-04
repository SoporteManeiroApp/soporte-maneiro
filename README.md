> Sistema de Gestión de Tickets para el registro, seguimiento y resolución de incidencias y solicitudes de soporte técnico interno en la Alcaldía de Maneiro.

Este proyecto es una aplicación web diseñada para centralizar y gestionar eficientemente las solicitudes de soporte técnico. Permite a los empleados de la institución crear **"tickets"** para reportar incidencias (ej. problemas con equipos, software o acceso a redes) y al equipo de TI gestionarlos, asignarlos y resolverlos de forma ordenada.

---

## ✨ Características Principales

### 👤 Portal de Usuario (Empleados)
* **Autenticación segura** para registrarse e iniciar sesión.
* Creación de nuevos tickets de soporte, especificando categoría (**Hardware, Software, Redes**) y nivel de prioridad.
* Posibilidad de **adjuntar archivos** o capturas de pantalla a los tickets.
* Visualización del historial y estado de sus tickets personales: `Abierto`, `En Progreso`, `Cerrado`.

### ⚙️ Panel de Soporte (Equipo de TI)
* **Dashboard con métricas clave:** tickets abiertos, tickets por técnico, tiempo de resolución promedio.
* Vista centralizada de todos los tickets, con opciones de **búsqueda y filtrado avanzado**.
* **Asignación de tickets** a técnicos específicos del equipo de soporte.
* Capacidad para **añadir comentarios internos**, actualizar el estado y comunicarse con el usuario a través de la plataforma.

### 🌐 Generales
* Interfaz de usuario **intuitiva, moderna y completamente responsiva**.
* **API RESTful robusta y segura** para toda la gestión de datos.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto está dividido en dos componentes principales: un **frontend** y un **backend**.

#### 💻 Frontend (Cliente)
* **Framework:** Next.js
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS
