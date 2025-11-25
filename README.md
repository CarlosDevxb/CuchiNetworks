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
Hecho con 💻 y ☕.
