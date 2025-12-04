-- -----------------------------------------------------------------
-- SCRIPT DE INICIALIZACIÓN (SOLO ESTRUCTURA v4.0)
-- Arquitectura: Table-per-Type Inheritance
-- -----------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. LIMPIEZA
DROP TABLE IF EXISTS BitacoraDispositivos;
DROP TABLE IF EXISTS BitacoraUso;
DROP TABLE IF EXISTS Clases;
DROP TABLE IF EXISTS Reportes;
DROP TABLE IF EXISTS Componentes;
DROP TABLE IF EXISTS Equipos;
DROP TABLE IF EXISTS Materias;
DROP TABLE IF EXISTS Proveedores;
DROP TABLE IF EXISTS Ubicaciones;
DROP TABLE IF EXISTS TokenBlacklist;

-- Limpieza de Usuarios (Orden inverso)
DROP TABLE IF EXISTS Alumnos;
DROP TABLE IF EXISTS Docentes;
DROP TABLE IF EXISTS Administradores;
DROP TABLE IF EXISTS Usuarios;

-- -----------------------------------------------------------------
-- 2. USUARIOS Y ROLES (Tablas Segmentadas)
-- -----------------------------------------------------------------

-- TABLA PADRE (Datos de acceso)
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'alumno', 'docente') NOT NULL,
    foto_perfil VARCHAR(512) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABLA HIJA: ADMINISTRADORES
CREATE TABLE Administradores (
    usuario_id INT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo VARCHAR(100) DEFAULT 'Administrador',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLA HIJA: DOCENTES
CREATE TABLE Docentes (
    usuario_id INT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    numero_empleado VARCHAR(50) UNIQUE NULL,
    titulo_academico VARCHAR(50) NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLA HIJA: ALUMNOS
CREATE TABLE Alumnos (
    usuario_id INT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    carrera VARCHAR(100) NULL,
    semestre INT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Token Blacklist (Para Logout)
CREATE TABLE TokenBlacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    INDEX (token)
);

-- -----------------------------------------------------------------
-- 3. CATÁLOGOS E INFRAESTRUCTURA
-- -----------------------------------------------------------------

CREATE TABLE Ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    tipo_zona ENUM('isla', 'mesa_central', 'bodega', 'otro') NOT NULL DEFAULT 'otro'
) ENGINE=InnoDB;

CREATE TABLE Proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(255) NOT NULL UNIQUE,
    contacto_nombre VARCHAR(150) NULL,
    contacto_email VARCHAR(150) NULL,
    contacto_telefono VARCHAR(50) NULL,
    notas TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE Materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    semestre VARCHAR(50) NULL,
    carrera VARCHAR(100) NULL
) ENGINE=InnoDB;

CREATE TABLE Equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ubicacion_id INT NULL,
    nombre_equipo VARCHAR(100) NOT NULL,
    tipo ENUM('computadora', 'router', 'switch', 'servidor', 'impresora', 'monitor', 'otro') NOT NULL,
    modelo VARCHAR(100) NULL,
    serial_number VARCHAR(100) UNIQUE NULL,
    estado ENUM('operativo', 'falla', 'mantenimiento', 'inactivo') NOT NULL DEFAULT 'operativo',
    imagen_url VARCHAR(512) NULL,
    posicion_fisica VARCHAR(50) NULL,
    detalles JSON NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------
-- 4. GESTIÓN ACADÉMICA Y REPORTES
-- -----------------------------------------------------------------

CREATE TABLE Clases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL, -- FK a Usuarios(id) -> Docentes
    materia_id INT NOT NULL,
    grupo VARCHAR(50) NOT NULL, 
    dia_semana ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (docente_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES Materias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE BitacoraUso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    materia_id INT NOT NULL,
    tipo_clase ENUM('teorica', 'practica') NOT NULL DEFAULT 'teorica',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    tema_visto VARCHAR(255) NULL,
    observaciones TEXT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES Materias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE BitacoraDispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bitacora_id INT NOT NULL,
    equipo_id INT NOT NULL,
    FOREIGN KEY (bitacora_id) REFERENCES BitacoraUso(id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,           
    equipo_id INT NULL,            
    ubicacion_id INT NULL,         
    proveedor_id INT NULL,         
    estado_reporte ENUM('nuevo', 'en_revision', 'en_reparacion_externa', 'resuelto', 'dado_de_baja') NOT NULL DEFAULT 'nuevo',
    descripcion_problema TEXT NOT NULL,
    notas_admin TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE SET NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;