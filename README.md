<!-- prettier-ignore -->
# 🖥️ CuchiNetworks

> Sistema integral para la gestión de laboratorios de redes — Inventario, reportes y mantenimiento.

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge) ![Licencia](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge) ![Versión](https://img.shields.io/badge/Versión-0.1.0-green?style=for-the-badge)

Breve: proyecto Full‑Stack containerizado pensado para centros educativos y laboratorios, con control de roles, registro de incidencias y panel administrativo.

--

**Tabla de contenidos**

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Arranque rápido (Docker)](#arranque-rápido-docker)
- [Desarrollo local](#desarrollo-local)
- [Base de datos & Seeds](#base-de-datos--seeds)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas y endpoints](#rutas-y-endpoints)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

--

## ✨ Características

- Gestión de equipos (inventario parcial)
- Autenticación con JWT y control de roles (Admin, Teacher/Student)
- Panel administrativo con métricas básicas
- Subida y almacenamiento de archivos en `public/uploads`
- Base de datos MySQL dockerizada con script de inicialización

## 🛠️ Tecnologías

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: MySQL (contenedor)
- Orquestación: `docker-compose`

## 📋 Requisitos

- Docker y Docker Compose instalados en tu sistema.
- Node.js (solo si quieres ejecutar frontend/backend localmente fuera de Docker).

## 🚀 Arranque rápido (Docker)

Levanta la aplicación (API, frontend y base de datos) con un solo comando:

```bash
docker-compose up --build
```

- Accede al frontend en `http://localhost:5173` (configurable en `vite.config.js`).
- La API escucha según la configuración en `backend/index.js` y `docker-compose.yml`.

Para levantar en segundo plano:

```bash
docker-compose up -d --build
```

Detener y eliminar contenedores:

```bash
docker-compose down
```

## 🧩 Desarrollo local

Si prefieres ejecutar servicios por separado:

- Backend (desde la carpeta `backend`):

```bash
cd backend
npm install
npm run start
```

- Frontend (desde la carpeta `frontend`):

```bash
cd frontend
npm install
npm run dev
```

Configura las variables de entorno necesarias en el backend (si no usas Docker, crea un `.env` siguiendo el ejemplo en `backend/`).

## 🗄️ Base de datos & Seeds

El archivo `database/init.sql` contiene las tablas iniciales. Para poblar usuarios de ejemplo existe `backend/scripts/seedUsers.js`.

Si trabajas con Docker Compose, la DB se inicializa automáticamente al crear el contenedor.

## 📁 Estructura del proyecto (resumen)

- `backend/` — API REST, controladores, rutas y middleware.
- `frontend/` — Aplicación React con Vite y Tailwind.
- `database/` — Script `init.sql` para inicializar la base.
- `docker-compose.yml` — Orquesta contenedores (frontend, backend, db).

## 🔌 Rutas y endpoints (rápido)

Algunas rutas principales (ver `backend/routes/` para la lista completa):

- `POST /api/auth/login` — Autenticación
- `GET /api/equipos` — Listar equipos
- `POST /api/equipos` — Crear equipo (Admin)
- `GET /api/ubicaciones` — Listar ubicaciones
- `POST /api/bitacora` — Registrar incidencia

> Revisa `backend/routes` y `backend/controllers` para detalles y parámetros.

## 🧰 Comandos útiles

- Levantar todo: `docker-compose up --build`
- Levantar solo backend: `cd backend && npm run start`
- Levantar solo frontend: `cd frontend && npm run dev`
- Ejecutar seed de usuarios: `node backend/scripts/seedUsers.js` (asegúrate de variables/DB)

## 🤝 Contribuir

1. Haz fork y crea una rama con tu feature: `git checkout -b feat/mi-feature`
2. Crea cambios claros y pruebas si aplica
3. Abre un PR describiendo los cambios

Para contribuciones mayores, abre un issue primero para discutir el diseño.