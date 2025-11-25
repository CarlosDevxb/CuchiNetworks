# 🌐 CuchiNetworks

> **Plataforma Integral de Gestión, Auditoría y Control para Laboratorios de Redes de Computadoras.**

![Estado](https://img.shields.io/badge/Estado-Alpha%20v1.0-blue?style=for-the-badge)
![Arquitectura](https://img.shields.io/badge/Arquitectura-Microservicios%20Docker-blueviolet?style=for-the-badge)
![Seguridad](https://img.shields.io/badge/Seguridad-OWASP%20Standard-green?style=for-the-badge)

---

## 💡 Visión del Proyecto

**CuchiNetworks** nace de la necesidad de modernizar la administración de infraestructura educativa y empresarial. No es solo un inventario; es un **Sistema Operativo para Laboratorios** que conecta el hardware físico con la actividad académica.

El sistema permite una trazabilidad completa: desde saber qué router específico se utilizó en una práctica de "Enrutamiento Dinámico", hasta gestionar el ciclo de vida de una falla técnica reportada por un alumno.

---

## 🚀 Características Principales

### 1. 🛡️ Gestión de Identidad y Seguridad (RBAC)
El sistema implementa un control de acceso estricto basado en roles, garantizando que cada usuario tenga una experiencia personalizada y segura.
* **Administrador:** Control total de infraestructura, usuarios y auditoría.
* **Docente:** Gestión de clases, asistencia y reporte de incidentes.
* **Alumno:** Acceso a perfil y herramientas de reporte.
* **Seguridad:** Protección contra ataques de fuerza bruta, inyección SQL y XSS.

### 2. 🖥️ Inventario de Infraestructura Inteligente
Más allá de una lista plana, CuchiNetworks entiende la naturaleza de los equipos de red.
* **Especificaciones Dinámicas (JSON):** El sistema adapta los campos según el dispositivo. Si registras un *Router*, te pide interfaces y cables; si es una *PC*, te pide RAM y periféricos.
* **Geolocalización Lógica:** Mapeo exacto de dispositivos por Zona (Isla, Rack, Mesa Central) y Posición Física.
* **Evidencia Visual:** Registro fotográfico de cada activo.

### 3. 📅 Bitácora Académica y Auditoría
El corazón operativo del laboratorio.
* **Registro Dual:** Diferenciación entre clases **Teóricas** y **Prácticas**.
* **Trazabilidad de Hardware:** En las sesiones prácticas, el docente registra qué equipos específicos se utilizaron, permitiendo auditar quién fue el último responsable de un dispositivo antes de una falla.

### 4. 🎨 Experiencia de Usuario "Soft UI"
Una interfaz moderna, limpia y responsiva diseñada para reducir la carga cognitiva.
* **Diseño Visual:** Paleta de colores profesional (*Cuchi Blue*) y componentes visuales intuitivos.
* **Feedback Inmediato:** Sistema de notificaciones (Toasts) no intrusivas.
* **Navegación Contextual:** Menús que se adaptan dinámicamente al rol del usuario.

---

## 📸 Galería de la Interfaz

| **Acceso Seguro** | **Gestión de Inventario** |
| :---: | :---: |
| ![Login](/frontend/src/assets/githubImages/Login.png) | ![Inventario](/frontend/src/assets/githubImages/Inventarios.png) |
| *Autenticación JWT con protección Anti-Bruteforce* | *Vista de tarjetas con estado en tiempo real* |

| **Ficha Técnica** | **Bitácora Docente** |
| :---: | :---: |
| ![Detalle](/frontend/src/assets/githubImages/Detalles.png) | ![Bitacora](/frontend/src/assets/githubImages/Bitacora.png) |
| *Datos técnicos dinámicos y edición visual* | *Control de asistencia y recursos usados* |

---

## 🛠️ Arquitectura Tecnológica

CuchiNetworks está construido sobre un stack moderno, escalable y contenerizado, listo para despliegue en la nube (AWS).



### 🔹 Frontend (Cliente)
* **React 18 + Vite:** Para una experiencia de usuario ultra rápida (SPA).
* **Tailwind CSS:** Diseño atómico y consistente.
* **Axios Interceptors:** Gestión centralizada de seguridad y tokens.

### 🔹 Backend (API RESTful)
* **Node.js + Express:** Lógica de negocio asíncrona y veloz.
* **Middleware de Seguridad:** `Helmet` (Headers), `Express-Validator` (Sanitización), `Rate-Limit`.
* **Gestión de Archivos:** `Multer` para el manejo seguro de evidencias fotográficas.

### 🔹 Base de Datos (Persistencia)
* **MySQL 8.0:** Motor relacional robusto.
* **JSON Native Support:** Almacenamiento híbrido para especificaciones técnicas flexibles.
* **Transacciones ACID:** Integridad garantizada en operaciones críticas (como el registro de bitácoras complejas).

### 🔹 Infraestructura (DevOps)
* **Docker & Docker Compose:** Entorno de desarrollo y producción replicable al 100%.
* **Volúmenes Persistentes:** Seguridad de datos ante reinicios.

---

## 🌟 Futuro del Proyecto (Roadmap)

El desarrollo continúa con módulos avanzados planeados:
* [ ] **Tablero Kanban:** Gestión visual del flujo de reparaciones.
* [ ] **Generador de QR:** Etiquetas físicas para escaneo rápido de inventario.
* [ ] **Dashboard Analítico:** Métricas de uso de laboratorio y equipos más solicitados.

---

### 👨‍💻 Equipo de Desarrollo

Diseñado y Desarrollado por **CarlosDevxb**.
*Líder Técnico y Arquitecto de Software Full-Stack.*

&copy; 2025 CuchiNetworks.
