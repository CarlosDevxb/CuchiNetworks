# 🖥️ CuchiNetworks

> **Sistema Integral de Gestión para Laboratorios de Redes de Computadoras.**

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge)
![Versión](https://img.shields.io/badge/Versión-0.1.0-green?style=for-the-badge)

**CuchiNetworks** es una aplicación Full-Stack diseñada para administrar el inventario, reportes de fallas y mantenimiento de equipos en un laboratorio educativo o empresarial. Permite a los administradores gestionar incidencias en tiempo real y controlar el acceso mediante roles.

---

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura moderna basada en **contenedores** y separación de responsabilidades.

| Área | Tecnologías |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **Backend** | ![Nodejs](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat-square) ![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens) |
| **Base de Datos** | ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat-square&logo=mysql&logoColor=white) (Dockerizada) |
| **Infraestructura** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![Linux](https://img.shields.io/badge/Linux_Mint-87CF3E?style=flat-square&logo=linux-mint&logoColor=white) |

---

## 🚀 Funcionalidades (Roadmap)

### ✅ Implementado
- [x] **Entorno Dockerizado:** Base de datos MySQL autogestionada con scripts de inicialización (`init.sql`).
- [x] **Autenticación Segura:** Login con JWT, encriptación Bcrypt y protección de rutas (Middleware).
- [x] **Dashboard Administrativo:** Visualización de estadísticas en tiempo real (Equipos totales, reportes activos, mantenimientos).
- [x] **UI/UX Moderna:** Interfaz responsiva con Tailwind CSS, modo oscuro ("Dark Mode") y diseño personalizado.
- [x] **Gestión de Roles:** Redirección inteligente y vistas separadas para Admin y Alumnos.

### 🚧 En Progreso / Pendiente
- [ ] **Inventario (CRUD):** Tabla para agregar, editar y dar de baja equipos.
- [ ] **Sistema de Reportes:** Formulario para que alumnos reporten fallas en equipos específicos.
- [ ] **Tablero Kanban:** Gestión visual del flujo de reparaciones.
- [ ] **Perfiles de Usuario:** Edición de datos personales y avatares.

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno local de desarrollo.

### 1. Prerrequisitos
* Node.js (v18 o superior)
* Docker y Docker Compose
* Git

### 2. Clonar el repositorio
```bash
git clone [https://github.com/TU_USUARIO/cuchi-networks.git](https://github.com/TU_USUARIO/cuchi-networks.git)
cd cuchi-networks
3. Configurar Variables de Entorno
```
### Crea un archivo .env dentro de la carpeta backend/ con el siguiente contenido:
```bash
PORT=3000
DB_HOST=127.0.0.1
DB_USER=cuchi_admin
DB_PASSWORD=securepassword
DB_NAME=cuchi_networks_db
DB_PORT=3306
JWT_SECRET=pon_aqui_una_clave_super_secreta_y_larga
```
### 4. Iniciar la Base de Datos
```bash
docker compose up -d

    Nota: La primera vez que se ejecute, Docker creará el contenedor MySQL e importará automáticamente las tablas definidas en database/init.sql.
```
### 5. Instalar Dependencias

Backend:
Bash

cd backend
npm install

Frontend:
Bash

cd ../frontend
npm install

▶️ Ejecución

Para desarrollar, se recomienda tener 3 terminales abiertas:

Terminal 1 (Base de Datos - Solo si no está corriendo):
Bash

docker compose start

Terminal 2 (Backend API):
Bash

cd backend
npm run dev

Terminal 3 (Frontend React):
Bash

cd frontend
npm run dev

Accede a la aplicación en tu navegador: http://localhost:5173

📂 Estructura del Proyecto

Plaintext

cuchi-networks/
├── docker-compose.yml      # Orquestación de contenedores (MySQL)
├── database/
│   └── init.sql            # Esquema inicial de la BD (Tablas, Triggers)
├── backend/
│   ├── src/
│   ├── routes/             # Rutas de la API (Auth, Dashboard)
│   ├── middleware/         # Seguridad (Verificación JWT, Roles)
│   └── index.js            # Punto de entrada del servidor Express
└── frontend/
    ├── src/
    │   ├── components/     # Componentes reutilizables
    │   ├── context/        # Estado global (AuthContext)
    │   ├── layouts/        # Estructuras de página (DashboardLayout)
    │   ├── pages/          # Vistas (Login, AdminDashboard)
    │   └── App.jsx         # Enrutamiento principal
    └── tailwind.config.js  # Configuración de estilos y tema

🔑 Credenciales de Prueba

Para acceder como administrador (si has ejecutado el seed o creado el usuario):

    Email: jefe@cuchi.net

    Password: admin123

Hecho con 💻 y ☕.